import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ListingDetailsLayout, {
  DetailSection,
} from '../../components/details/ListingDetailsLayout';
import BottomSheet from '../../components/myads/BottomSheet';
import BottomActionBar from '../../components/myadsFlowComponents/BottomActionBar';
import LaptopCardMenu from '../../components/laptops/LaptopCardMenu';
import useListingDetails from '../../hooks/useListingDetails';
import { deleteLaptop, getLaptopById, LaptopDetail } from '../../api/LaptopsApi';
import { extractLaptopPhotos } from '../../api/LaptopsApi/photoNormalizer';
import { MyLaptopAdsStackParamList } from '../../navigation/MyLaptopAdsStack';

type DetailsRouteProp = RouteProp<MyLaptopAdsStackParamList, 'LaptopDetails'>;
type NavProp = NativeStackNavigationProp<MyLaptopAdsStackParamList>;

const ACTION_BAR_HEIGHT = 96;
const PLACEHOLDER_IMAGE = require('../../assets/icons/hyundai.png');

const currencyText = (value?: number) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
  return 'Price on request';
};

const LaptopDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<DetailsRouteProp>();
  const { laptopId } = params;
  const insets = useSafeAreaInsets();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchLaptop = useCallback(() => getLaptopById(laptopId), [laptopId]);

  const { data, loading, error, refetch } = useListingDetails<LaptopDetail>(fetchLaptop, {
    defaultErrorMessage: 'Failed to load details',
  });

  const images = useMemo(() => {
    const photos = extractLaptopPhotos(data ?? null);
    return photos
      .map((photo) => {
        if (typeof photo?.photo_link === 'string' && photo.photo_link.trim().length > 0) {
          return photo.photo_link;
        }
        const legacy = (photo as any)?.photoLink;
        if (typeof legacy === 'string' && legacy.trim().length > 0) {
          return legacy;
        }
        return null;
      })
      .filter((uri): uri is string => typeof uri === 'string' && uri.trim().length > 0);
  }, [data]);

  const titleText = useMemo(() => {
    if (!data) return `Laptop #${laptopId}`;
    const parts = [data.brand, data.model].filter(
      (part) => !!part && String(part).trim().length > 0
    );
    if (parts.length > 0) return parts.join(' ');
    if (data.serialNumber) return data.serialNumber;
    return `Laptop #${laptopId}`;
  }, [data, laptopId]);

  const priceText = useMemo(() => currencyText(data?.price), [data?.price]);

  const metaLines = useMemo(() => {
    if (!data?.serialNumber) return [];
    return [`Serial No: ${data.serialNumber}`];
  }, [data?.serialNumber]);

  const detailSections = useMemo<DetailSection[]>(() => {
    if (!data) return [];

    const productSection = [
      { label: 'Brand', value: data.brand },
      { label: 'Model', value: data.model },
      { label: 'Colour', value: data.colour },
      { label: 'Manufacturer', value: data.manufacturer },
      {
        label: 'Warranty',
        value: data.warrantyInYear != null ? `${data.warrantyInYear} year(s)` : undefined,
      },
      { label: 'Serial Number', value: data.serialNumber },
    ].filter((row) => row.value && String(row.value).trim().length > 0);

    const specificationSection = [
      { label: 'Processor', value: data.processor },
      { label: 'Processor Brand', value: data.processorBrand },
      { label: 'Memory Type', value: data.memoryType },
      { label: 'RAM', value: data.ram },
      { label: 'Storage', value: data.storage },
      { label: 'Graphics Card', value: data.graphicsCard },
      { label: 'Graphic Brand', value: data.graphicBrand },
      { label: 'Screen Size', value: data.screenSize },
      { label: 'Battery', value: data.battery },
      { label: 'Battery Life', value: data.batteryLife },
      { label: 'Weight', value: data.weight },
      {
        label: 'USB Ports',
        value:
          data.usbPorts != null && !Number.isNaN(data.usbPorts) ? String(data.usbPorts) : undefined,
      },
    ].filter((row) => row.value && String(row.value).trim().length > 0);

    const sections: DetailSection[] = [];
    if (productSection.length > 0) {
      sections.push({ title: 'Product Details', rows: productSection });
    }
    if (specificationSection.length > 0) {
      sections.push({ title: 'Specifications', rows: specificationSection });
    }

    return sections;
  }, [data]);

  const badgeLabel = data?.status || 'Status unavailable';

  const handleRetry = useCallback(() => {
    refetch().catch(() => {
      /* handled inside hook */
    });
  }, [refetch]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check this laptop on CarYanam: ${titleText}`,
      });
    } catch {
      /* share cancelled */
    }
  }, [titleText]);

  const handleEdit = useCallback(() => {
    setSheetVisible(false);
    navigation.navigate('UpdateLaptop', { laptopId });
  }, [laptopId, navigation]);

  const confirmDelete = useCallback(() => {
    if (deleting || !data) return;
    Alert.alert(
      'Delete laptop',
      'Are you sure you want to delete this laptop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteLaptop(laptopId);
              setSheetVisible(false);
              Alert.alert('Deleted', 'Laptop removed from your listings', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              Alert.alert('Failed', e?.response?.data?.message || 'Unable to delete laptop');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [data, deleting, laptopId, navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading laptop details...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || 'Unable to load laptop details.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ListingDetailsLayout
        images={images}
        placeholderSource={PLACEHOLDER_IMAGE}
        badgeLabel={badgeLabel}
        title={titleText}
        price={priceText}
        detailSections={detailSections}
        metaLines={metaLines}
        onBack={() => navigation.goBack()}
        onShare={onShare}
        onMenu={() => setSheetVisible(true)}
        actionBarHeight={ACTION_BAR_HEIGHT}
        bottomInset={insets.bottom}
        priceRightSlot={
          data.screenSize ? <Text style={styles.metaText}>{data.screenSize}</Text> : undefined
        }
      />

      <BottomActionBar
        onChat={() => navigation.navigate('ChatScreen')}
        onBid={() => console.log('Start Bidding')}
      />

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} height={0.3}>
        <LaptopCardMenu
          title={titleText}
          statusLabel={data.status}
          onEdit={handleEdit}
          onDelete={confirmDelete}
          isDeleting={deleting}
          disabled={deleting}
        />
      </BottomSheet>
    </View>
  );
};

export default LaptopDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#666' },
  errorText: { color: '#c00', marginBottom: 16, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#216DBD',
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  metaText: { fontSize: 13, color: '#4F6575' },
});
