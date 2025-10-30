import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyMobileAdsStackParamList } from '../../navigation/MyMobileAdsStack';
import { deleteMobile, getAllMobiles } from '../../api/MobilesApi';

import MobileCard from '../../components/mobiles/MobileCard';
import MobileCardMenu from '../../components/mobiles/MobileCardMenu';
import MyAdsListLayout from '../MyAds/common/MyAdsListLayout';
import { useMyAdsStatusFilter } from '../../hooks/useMyAdsStatusFilter';
import { formatINR } from '../../utils/formatCurrency';

type NavigationProp = NativeStackNavigationProp<MyMobileAdsStackParamList>;

type ApiMobile = {
  mobileId: number;
  title: string;
  description?: string;
  price: number;
  negotiable?: boolean;
  condition?: string;
  brand?: string;
  model?: string;
  color?: string;
  yearOfPurchase?: number;
  status?: 'ACTIVE' | 'DRAFT' | 'SOLD' | string;
  createdAt?: string;
  updatedAt?: string | null;
  sellerId?: number;
  images?: string[];
};

const MyMobilesAdsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [mobiles, setMobiles] = useState<ApiMobile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMobile, setSelectedMobile] = useState<ApiMobile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { selectedTab, setSelectedTab, filtered } = useMyAdsStatusFilter({
    items: mobiles,
    getStatus: (item) => item.status,
  });

  const fetchData = async (reset = false) => {
    if (loading && !reset) return;
    try {
      if (reset) {
        setPage(0);
        setHasMore(true);
      }
      setLoading(true);
      const res = await getAllMobiles({
        page: reset ? 0 : page,
        size: 20,
        sort: 'createdAt,DESC',
      });
      setHasMore(res?.last === false);
      setPage((prev) => (reset ? 1 : prev + 1));
      setMobiles((prev) => (reset ? res.content : [...prev, ...res.content]));
    } catch (e) {
      console.warn('getAllMobiles error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  };

  const openMenuFor = (mobile: ApiMobile) => {
    setSelectedMobile(mobile);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setSelectedMobile(null);
  };

  const handleEdit = () => {
    if (!selectedMobile) return;
    (navigation as any).navigate('UpdateMobile', { mobileId: selectedMobile.mobileId });
    closeMenu();
  };

  const handleDelete = () => {
    if (!selectedMobile || deleting) return;

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
              await deleteMobile(selectedMobile.mobileId);
              await fetchData(true);
              Alert.alert('Deleted', 'Mobile soft-deleted');
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

  const renderAdCard = ({ item }: { item: ApiMobile }) => {
    const primaryImage = item.images?.[0]
      ? { uri: item.images[0] }
      : require('../../assets/icons/mobile.png');

    const titleText = item.title || 'Untitled Mobile';
    const subtitleText = [item.brand, item.yearOfPurchase?.toString()].filter(Boolean).join(' | ');

    return (
      <MobileCard
        image={primaryImage}
        priceText={formatINR(item.price)}
        title={titleText}
        subtitle={subtitleText}
        location="Pune"
        badgeText={item.status === 'ACTIVE' ? 'Live' : (item.status ?? 'Info')}
        onPress={() => navigation.navigate('ProductDetails', { mobileId: item.mobileId })}
        onMenuPress={() => openMenuFor(item)}
      />
    );
  };

  const listFooter =
    hasMore && loading ? <ActivityIndicator style={{ paddingVertical: 16 }} /> : null;

  return (
    <MyAdsListLayout
      title="My Mobile Ads"
      tabLabelSuffix="Mobiles"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      data={filtered}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={renderAdCard}
      keyExtractor={(item) => String(item.mobileId)}
      emptyMessage="No mobiles found."
      onBack={() => navigation.goBack()}
      menuVisible={menuOpen}
      onCloseMenu={closeMenu}
      menuContent={
        <MobileCardMenu
          title={selectedMobile?.title}
          statusLabel={selectedMobile?.status}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleting}
          disabled={deleting}
        />
      }
      isInitialLoading={loading && mobiles.length === 0}
      listProps={{
        onEndReachedThreshold: 0.3,
        onEndReached: () => {
          if (hasMore && !loading) {
            fetchData(false);
          }
        },
        ListFooterComponent: listFooter,
      }}
    />
  );
};

export default MyMobilesAdsListScreen;
