import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MyAdsStackParamList } from '../navigation/MyAdsStack';

// Define navigation type
type HomeScreenNavigationProp = NativeStackNavigationProp<MyAdsStackParamList, 'HomeScreen'>;

const categories = [
  { id: '1', name: 'Vehicle', icon: require('../assets/icons/vehicle.png'), bgColor: '#FFF4CC' },
  { id: '2', name: 'Electronics', icon: require('../assets/icons/electronics.png'), bgColor: '#D9F3FF' },
  { id: '3', name: 'Fashion', icon: require('../assets/icons/fashion.png'), bgColor: '#FFE1EC' },
  { id: '4', name: 'Kitchen appliances', icon: require('../assets/icons/kitchen-appliances.png'), bgColor: '#FFF2D9' },
  { id: '5', name: 'Real Estate', icon: require('../assets/icons/real-estate.png'), bgColor: '#FFECE0' },
  { id: '6', name: 'Jobs', icon: require('../assets/icons/jobs.png'), bgColor: '#FFEFF6' },
  { id: '7', name: 'Books', icon: require('../assets/icons/books.png'), bgColor: '#EDF0FF' },
  { id: '8', name: 'Services', icon: require('../assets/icons/services.png'), bgColor: '#E8F5F1' },
];

const products = [
  {
    id: '1',
    title: 'Maruti Suzuki Dzire 2009',
    price: '₹2,50,000',
    specs: '2009 • 150,000 km',
    location: 'Baner, Pune',
    image: require('../assets/icons/hyundai.png'),
  },
  {
    id: '2',
    title: 'Maruti Suzuki Dzire 2009',
    price: '₹2,50,000',
    specs: '2009 • 150,000 km',
    location: 'Baner, Pune',
    image: require('../assets/icons/hyundai.png'),
  },
  {
    id: '3',
    title: 'Maruti Suzuki Dzire 2009',
    price: '₹2,50,000',
    specs: '2009 • 150,000 km',
    location: 'Baner, Pune',
    image: require('../assets/icons/hyundai.png'),
  },
  {
    id: '4',
    title: 'Maruti Suzuki Dzire 2009',
    price: '₹2,50,000',
    specs: '2009 • 150,000 km',
    location: 'Baner, Pune',
    image: require('../assets/icons/hyundai.png'),
  },
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleCategoryPress = (name: string) => {
    if (name === 'Vehicle') {
      // The screen name 'CarList' must match the name in MyAdsStack.tsx
      navigation.navigate('CarListScreen', { category: 'Vehicle' });
    } else {
      Alert.alert('Coming Soon', `You selected: ${name}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Icon name="location-outline" size={18} color="#fff" />
          <Text style={styles.locationText}>India</Text>
          <Icon name="chevron-down" size={16} color="#fff" />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="#000" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search here"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What are you looking for?</Text>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>See All</Text>
            <Icon name="chevron-forward-outline" size={14} color="#007bff" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(cat.name)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: cat.bgColor }]}>
                <Image source={cat.icon} style={styles.categoryIcon} />
              </View>
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
        </View>

        <View style={styles.productGrid}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image source={product.image} style={styles.productImage} />
              <Text style={styles.productPrice}>{product.price}</Text>
              <Text style={styles.productTitle} numberOfLines={1}>
                {product.title}
              </Text>
              <Text style={styles.productSpecs}>{product.specs}</Text>
              <View style={styles.productLocation}>
                <Icon name="location-outline" size={14} color="#888" />
                <Text style={styles.locationTextCard}>{product.location}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Styles (same as before)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#002b40',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  searchWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 70,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007bff',
    marginRight: 2,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    marginVertical: 10,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
  productCard: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  productPrice: {
    marginTop: 6,
    fontWeight: '700',
    fontSize: 14,
  },
  productTitle: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  productSpecs: {
    fontSize: 12,
    color: '#777',
    marginTop: 1,
  },
  productLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationTextCard: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
});

export default HomeScreen;
