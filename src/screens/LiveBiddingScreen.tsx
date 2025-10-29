import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

interface CarItem {
  id: string;
  image: any; 
  price: string;
  title: string;
  year: string;
  mileage: string;
}

const LiveBiddingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'My Products' | 'All Products'>('My Products');

  const hyundaiImage = require('../assets/icons/hyundai.png');

  const carData: CarItem[] = [
    {
      id: '1',
      image: hyundaiImage,
      price: 'Rs. 2,50,000',
      title: 'Hyundai i20 Sportz 2019',
      year: '2019 - 30,000km',
      mileage: '',
    },
    {
      id: '2',
      image: hyundaiImage,
      price: 'Rs. 3,10,000',
      title: 'Hyundai Venue 2020',
      year: '2020 - 45,000km',
      mileage: '',
    },
    {
      id: '3',
      image: hyundaiImage,
      price: 'Rs. 4,50,000',
      title: 'Hyundai Creta 2021',
      year: '2021 - 20,000km',
      mileage: '',
    },
    {
      id: '4',
      image: hyundaiImage,
      price: 'Rs. 4,50,000',
      title: 'Hyundai Creta 2021',
      year: '2021 - 20,000km',
      mileage: '',
    },
    {
      id: '5',
      image: hyundaiImage,
      price: 'Rs. 4,50,000',
      title: 'Hyundai Creta 2021',
      year: '2021 - 20,000km',
      mileage: '',
    },
    {
      id: '6',
      image: hyundaiImage,
      price: 'Rs. 4,50,000',
      title: 'Hyundai Creta 2021',
      year: '2021 - 20,000km',
      mileage: '',
    },
  ];

  const renderCarItem = (item: CarItem) => (
    <View key={item.id} style={styles.carItem}>
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.carImage} resizeMode="cover" />
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏰ 00:02:45</Text>
        </View>
      </View>
      <View style={styles.carInfo}>
        <Text style={styles.carPrice}>{item.price}</Text>
        <Text style={styles.carTitle}>{item.title}</Text>
        <Text style={styles.carYear}>{item.year}</Text>
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={14} color="#999" />
          <Text style={styles.locationText}>Baner, Pune</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Bidding</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'My Products' && styles.activeToggleButton,
          ]}
          onPress={() => setActiveTab('My Products')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              activeTab === 'My Products' && styles.activeToggleButtonText,
            ]}
          >
            My Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'All Products' && styles.activeToggleButton,
          ]}
          onPress={() => setActiveTab('All Products')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              activeTab === 'All Products' && styles.activeToggleButtonText,
            ]}
          >
            All Products
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <ScrollView style={styles.productGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {carData.map(renderCarItem)}
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveBiddingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 25,
    margin: 20,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: '#4A90E2',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeToggleButtonText: {
    color: '#fff',
  },
  productGrid: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  carItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  timerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timerText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  carInfo: {
    padding: 12,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  carYear: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});
