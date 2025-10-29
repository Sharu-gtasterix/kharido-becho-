import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MyAdsStackParamList } from '../navigation/MyAdsStack';

type MyAdsScreenNavigationProp = NativeStackNavigationProp<
  MyAdsStackParamList,
  'CarListScreen'
>;

interface CarItem {
  id: string;
  image: ImageSourcePropType;
  price: string;
  title: string;
  year: string;
  mileage: string;
}

const CarListScreen: React.FC = () => {
  const navigation = useNavigation<MyAdsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'Upcoming Car' | 'Live Car'>('Upcoming Car');

  const hyundaiImage = require('../assets/icons/hyundai.png'); // Replace with your image path
  const carImage = require('../assets/icons/car.png'); // Replace with your car image path for the detail screen

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
    <TouchableOpacity
      key={item.id}
      style={styles.carItem}
      onPress={() => {
        const [carYear, carMileage] = item.year.split(' - ');
        
        const product = {
          image: carImage,
          price: item.price,
          title: 'Hero electric optima CX (2025)', // Hardcoded as per the image
          year: '2025', // Hardcoded as per the image
          km: '0', // Hardcoded as per the image
          location: 'Baner, Pune',
          timeLeft: '00:02:45',
          description: 'Lorem ipsum dolor sit amet, consectetur. Congue justo facilisi quis non malesuada aliquet nisi tincidunt tellus. Gravida cursus lacus tincidunt ipsum aenean.',
          brand: 'Hero Honda',
          model: 'Optima CX',
          fuel: 'Electric',
          rating: 4.3,
        };
        navigation.navigate('ProductDetailsScreen', { product });
      }}
    >
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
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Car List</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'Upcoming Car' && styles.activeToggleButton,
          ]}
          onPress={() => setActiveTab('Upcoming Car')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              activeTab === 'Upcoming Car' && styles.activeToggleButtonText,
            ]}
          >
            Upcoming Car
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'Live Car' && styles.activeToggleButton,
          ]}
          onPress={() => setActiveTab('Live Car')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              activeTab === 'Live Car' && styles.activeToggleButtonText,
            ]}
          >
            Live Car
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

export default CarListScreen;

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
    top: 108,
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
