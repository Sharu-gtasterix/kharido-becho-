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
import MobileCardMenu from '../../components/mobiles/MobileCardMenu';
import useListingDetails from '../../hooks/useListingDetails';
import { deleteMobile, getMobileById, MobileDetail } from '../../api/MobilesApi';
import { MyAdsStackParamList } from '../../navigation/MyAdsStack';

type DetailsRouteProp = RouteProp<MyAdsStackParamList, 'ProductDetails'>;
type NavProp = NativeStackNavigationProp<MyAdsStackParamList>;

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

const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<DetailsRouteProp>();
  const { mobileId } = params;
  const insets = useSafeAreaInsets();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMobile = useCallback(() => getMobileById(mobileId), [mobileId]);

  const { data, loading, error, refetch } = useListingDetails<MobileDetail>(fetchMobile, {
    defaultErrorMessage: 'Failed to load details',
  });

  const images = useMemo(() => {
    return (data?.images || []).filter(
      (uri): uri is string => typeof uri === 'string' && uri.trim().length > 0
    );
  }, [data?.images]);

  const titleText = useMemo(() => {
    if (!data) return `Mobile #${mobileId}`;
    if (data.title && data.title.trim().length > 0) return data.title;
    const parts = [data.brand, data.model].filter((part) => part && String(part).trim().length > 0);
    if (parts.length > 0) return parts.join(' ');
    return `Mobile #${mobileId}`;
  }, [data, mobileId]);

  const priceText = useMemo(() => {
    const base = currencyText(data?.price);
    return data?.negotiable ? `${base} (Negotiable)` : base;
  }, [data?.price, data?.negotiable]);

  const metaLines = useMemo(() => {
    if (!data) return [];
    const pieces: string[] = [];
    if (data.yearOfPurchase) pieces.push(`Purchased ${data.yearOfPurchase}`);
    if (data.condition) pieces.push(data.condition);
    return pieces.length > 0 ? [pieces.join(' | ')] : [];
  }, [data]);

  const detailSections = useMemo<DetailSection[]>(() => {
    if (!data) return [];
    const productSection = [
      { label: 'Brand', value: data.brand ?? '' },
      { label: 'Model', value: data.model ?? '' },
      { label: 'Colour', value: data.color ?? '' },
      { label: 'Condition', value: data.condition ?? '' },
      {
        label: 'Year of Purchase',
        value: data.yearOfPurchase != null ? String(data.yearOfPurchase) : '',
      },
    ].filter((row) => row.value && row.value.trim().length > 0);

    return productSection.length > 0 ? [{ title: 'Product Details', rows: productSection }] : [];
  }, [data]);

  const descriptionText = data?.description?.trim() ?? null;
  const badgeLabel = data?.status || 'Status unavailable';

  const handleRetry = useCallback(() => {
    refetch().catch(() => {
      /* handled inside hook */
    });
  }, [refetch]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check this mobile on CarYanam: ${titleText}`,
      });
    } catch {
      /* share cancelled */
    }
  }, [titleText]);

  const handleEdit = useCallback(() => {
    setSheetVisible(false);
    (navigation as any).navigate('UpdateMobile', { mobileId });
  }, [mobileId, navigation]);

  const confirmDelete = useCallback(() => {
    if (deleting || !data) return;
    Alert.alert(
      'Delete mobile',
      'Are you sure you want to delete this mobile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteMobile(mobileId);
              setSheetVisible(false);
              Alert.alert('Deleted', 'Mobile removed from your listings', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              Alert.alert('Failed', e?.response?.data?.message || 'Unable to delete mobile');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [data, deleting, mobileId, navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading mobile details...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.center, styles.contentPadding]}>
        <Text style={styles.errorText}>{error || 'Unable to load details.'}</Text>
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
        description={descriptionText}
        onBack={() => navigation.goBack()}
        onShare={onShare}
        onMenu={() => setSheetVisible(true)}
        actionBarHeight={ACTION_BAR_HEIGHT}
        bottomInset={insets.bottom}
      />

      <BottomActionBar
        onChat={() => navigation.navigate('ChatScreen')}
        onBid={() => console.log('Start Bidding')}
      />

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} height={0.3}>
        <MobileCardMenu
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

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { justifyContent: 'center', alignItems: 'center' },
  contentPadding: { paddingHorizontal: 32 },
  loadingText: { marginTop: 8, color: '#666' },
  errorText: { color: '#c00', marginBottom: 16, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#216DBD',
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});
