import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MyAdsStackParamList } from '../navigation/MyAdsStack';

type MyAdsListScreenRouteProp = RouteProp<MyAdsStackParamList, 'MyAdsListScreen'>;
type NavigationProp = NativeStackNavigationProp<MyAdsStackParamList>;

const MyAdsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MyAdsListScreenRouteProp>();
  const { category } = route.params;

  const [selectedTab, setSelectedTab] = useState('Live');

  const mockAds = Array(6).fill(null).map((_, index) => ({
    id: index.toString(),
    price: 'Rs. 2,50,000',
    title: 'Maruti Suzuki Dzire 2009',
    km: '2009 – 150,000km',
    location: 'Baner, Pune',
    image: require('../assets/icons/hyundai.png'),
    timeLeft: '00:02:45',
    rating: 4.3,
    description: 'Here electric description goes. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    brand: 'Hero Honda',
    model: 'Optima',
    fuel: 'Electric',
    year: '2009',
  }));

  const renderAdCard = ({ item }: { item: typeof mockAds[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AdDetailsScreen', { product: item })}
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.details}>
        <View style={styles.timerBadge}>
          <Icon name="clock-outline" size={12} color="#fff" />
          <Text style={styles.timerText}>{item.timeLeft}</Text>
        </View>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.km}>{item.km}</Text>
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={14} color="#888" />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Ads</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['Live', 'Upcoming', 'Completed'].map((tab) => {
          const isSelected = selectedTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isSelected && styles.tabSelected]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                {tab} Car
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Ads Grid */}
      <FlatList
        data={mockAds}
        keyExtractor={(item) => item.id}
        renderItem={renderAdCard}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MyAdsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  tabSelected: {
    backgroundColor: '#216DBD',
  },
  tabText: {
    color: '#333',
    fontSize: 13,
  },
  tabTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  grid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: '1.5%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  details: {
    padding: 8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FDC20C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 11,
    color: '#000',
    fontWeight: '600',
    marginLeft: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 12,
    color: '#444',
  },
  km: {
    fontSize: 11,
    color: '#888',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    marginLeft: 4,
    fontSize: 11,
    color: '#888',
  },
});
