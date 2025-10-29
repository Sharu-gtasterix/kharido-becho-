import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ImageSourcePropType } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyLaptopAdsStackParamList } from '../../navigation/MyLaptopAdsStack';
import { deleteLaptop, getAllLaptops, LaptopItem } from '../../api/LaptopsApi';

import ListingCard from '../../components/myads/ListingCard';
import ListingCardMenu from '../../components/myads/ListingCardMenu';
import MyAdsListLayout from '../MyAds/common/MyAdsListLayout';
import { useMyAdsStatusFilter } from '../../hooks/useMyAdsStatusFilter';
import { formatINR } from '../../utils/formatCurrency';

type NavigationProp = NativeStackNavigationProp<MyLaptopAdsStackParamList>;

const MyLaptopAdsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [laptops, setLaptops] = useState<LaptopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState<LaptopItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { selectedTab, setSelectedTab, filtered } = useMyAdsStatusFilter({
    items: laptops,
    getStatus: (item) => item.status,
  });

  const fetchData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getAllLaptops();
      setLaptops(data);
    } catch (e) {
      console.warn('getAllLaptops error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const openMenuFor = (l: LaptopItem) => {
    setSelectedLaptop(l);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setSelectedLaptop(null);
  };

  const handleEdit = () => {
    if (!selectedLaptop) return;
    (navigation as any).navigate('UpdateLaptop', { laptopId: selectedLaptop.id });
    closeMenu();
  };

  const handleDelete = () => {
    if (!selectedLaptop || deleting) return;

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
              await deleteLaptop(selectedLaptop.id);
              await fetchData();
              Alert.alert('Deleted', 'Laptop soft-deleted');
            } catch (e: any) {
              Alert.alert('Failed', e?.response?.data?.message ?? 'Please try again');
            } finally {
              setDeleting(false);
              closeMenu();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const resolveImage = (item: LaptopItem): ImageSourcePropType => {
    const url = item.laptopPhotos?.[0]?.photo_link ?? '';
    if (url) return { uri: url };
    return require('../../assets/icons/hyundai.png');
  };

  const renderCard = ({ item }: { item: LaptopItem }) => {
    const titleText =
      [item.brand, item.model].filter(Boolean).join(' ') || `Laptop #${item.id}`;
    const subtitleText = [item.processor, item.ram].filter(Boolean).join(' | ');

    return (
      <ListingCard
        image={resolveImage(item)}
        priceText={formatINR(item.price || 0)}
        title={titleText}
        subtitle={subtitleText}
        location="Pune"
        badgeText={item.status === 'ACTIVE' ? 'Live' : (item.status as string) || 'Info'}
        onPress={() => navigation.navigate('LaptopDetails', { laptopId: item.id })}
        onMenuPress={() => openMenuFor(item)}
      />
    );
  };

  return (
    <MyAdsListLayout
      title="My Laptop Ads"
      tabLabelSuffix="Laptops"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      data={filtered}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={renderCard}
      keyExtractor={(item) => String(item.id)}
      emptyMessage="No laptops found."
      onBack={() => navigation.goBack()}
      menuVisible={menuOpen}
      onCloseMenu={closeMenu}
      menuContent={
        <ListingCardMenu
          title={
            selectedLaptop
              ? [selectedLaptop.brand, selectedLaptop.model].filter(Boolean).join(' ')
              : undefined
          }
          statusLabel={selectedLaptop?.status as string | undefined}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleting}
          disabled={deleting}
        />
      }
      isInitialLoading={loading && laptops.length === 0}
    />
  );
};

export default MyLaptopAdsListScreen;
