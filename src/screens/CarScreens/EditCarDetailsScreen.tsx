import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellCarStackParamList } from '../../navigation/SellCarStack';
import { CarsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toCarUpdateDTO, CarDetailsFormValues } from '../../mappers/listingMappers';
import { validateCarDetails } from '../../form/schemas/CarDetailsSchema';

type EditCarDetailsScreenNavigationProp = NativeStackNavigationProp<
  SellCarStackParamList,
  'EditCarDetails'
>;

type EditCarDetailsScreenRouteProp = RouteProp<SellCarStackParamList, 'EditCarDetails'>;

const EditCarDetailsScreen: React.FC = () => {
  const navigation = useNavigation<EditCarDetailsScreenNavigationProp>();
  const route = useRoute<EditCarDetailsScreenRouteProp>();
  const { carId } = route.params;
  const { sellerId, userId, isSignedIn } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!isSignedIn) {
      Alert.alert('Error', 'You must be logged in to edit a car', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
      return;
    }

    fetchCarDetails();

    return () => {
      isMounted.current = false;
    };
  }, [isSignedIn]);

  const [formData, setFormData] = useState<CarDetailsFormValues>({
    title: '',
    brand: '',
    model: '',
    variant: '',
    price: '',
    description: '',
    color: '',
    yearOfPurchase: '',
    fuelType: '',
    transmission: '',
    kmDriven: '',
    numberOfOwners: '',
    condition: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    carInsurance: false,
    carInsuranceType: '',
    carInsuranceDate: '',
    airbag: false,
    abs: false,
    buttonStart: false,
    sunroof: false,
    childSafetyLocks: false,
    acFeature: false,
    musicFeature: false,
    powerWindowFeature: false,
    rearParkingCameraFeature: false,
    negotiable: false,
  });

  const fetchCarDetails = async () => {
    try {
      setFetchingData(true);
      console.log('=== FETCHING CAR DETAILS FOR ID:', carId, '===');

      // ✅ Using namespace import
      const response = await CarsApi.getCarById(carId);
      console.log('=== CAR DETAILS FETCHED ===', response);

      if (!isMounted.current) return;

      if (response.sellerId && sellerId && response.sellerId !== sellerId) {
        Alert.alert(
          'Access Denied',
          'You can only edit cars that you have added.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }

      setFormData({
        title: response.title || '',
        brand: response.brand || '',
        model: response.model || '',
        variant: response.variant || '',
        price: response.price ? String(response.price) : '',
        description: response.description || '',
        color: response.color || '',
        yearOfPurchase: response.yearOfPurchase ? String(response.yearOfPurchase) : '',
        fuelType: response.fuelType || '',
        transmission: response.transmission || '',
        kmDriven: response.kmDriven ? String(response.kmDriven) : '',
        numberOfOwners: response.numberOfOwners ? String(response.numberOfOwners) : '',
        condition: response.condition || '',
        address: response.address || '',
        city: response.city || '',
        state: response.state || '',
        pincode: response.pincode || '',
        carInsurance: response.carInsurance || false,
        carInsuranceType: response.carInsuranceType || '',
        carInsuranceDate: response.carInsuranceDate || '',
        airbag: response.airbag || false,
        abs: response.abs || false,
        buttonStart: response.buttonStart || false,
        sunroof: response.sunroof || false,
        childSafetyLocks: response.childSafetyLocks || false,
        acFeature: response.acFeature || false,
        musicFeature: response.musicFeature || false,
        powerWindowFeature: response.powerWindowFeature || false,
        rearParkingCameraFeature: response.rearParkingCameraFeature || false,
        negotiable: response.negotiable || false,
      });
    } catch (error: any) {
      console.error('=== ERROR FETCHING CAR DETAILS ===', error);
      if (isMounted.current) {
        Alert.alert('Error', error.message || 'Failed to load car details');
        navigation.goBack();
      }
    } finally {
      if (isMounted.current) {
        setFetchingData(false);
      }
    }
  };

  const handleInputChange = (field: keyof CarDetailsFormValues, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBooleanChange = (field: keyof CarDetailsFormValues, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('=== STARTING CAR UPDATE PROCESS ===');

      const validation = validateCarDetails(formData);
      if (!validation.success && validation.errors && validation.errors.length > 0) {
        const errorMessage = validation.errors[0].message || 'Please check all required fields';
        Alert.alert('Validation Error', errorMessage);
        if (isMounted.current) {
          setLoading(false);
        }
        return;
      }

      const carUpdateDTO = toCarUpdateDTO(formData, sellerId || undefined);

      console.log('=== UPDATE CAR DTO ===');
      console.log(JSON.stringify(carUpdateDTO, null, 2));
      console.log('=== USING SELLER ID:', sellerId, '===');

      console.log('=== CALLING UPDATE CAR API ===');
      // ✅ Using namespace import
      const response = await CarsApi.updateCar(carId, carUpdateDTO);

      console.log('=== UPDATE API RETURNED ===');
      console.log('Full response:', JSON.stringify(response, null, 2));

      if (!isMounted.current) return;

      if (response) {
        console.log('✅ SUCCESS! Showing alert...');

        Alert.alert(
          'Success ✅',
          response.message || 'Car updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('User clicked OK, going back');
                if (isMounted.current) {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        throw new Error('No response from server');
      }
    } catch (error: any) {
      console.error('=== UPDATE ERROR ===', error.message);

      if (!isMounted.current) return;

      let errorMessage = error.message || 'Something went wrong. Please try again.';

      if (errorMessage.includes('500') || errorMessage.includes('Server error')) {
        errorMessage = 'Server Error (500): Could not update car.\n\nPlease check:\n• Backend database connection\n• Required database fields match\n• Data validation rules (UPPERCASE fuel type, transmission)\n• Check backend server logs for details';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const renderFormField = (
    placeholder: string,
    field: keyof CarDetailsFormValues,
    keyboardType: 'default' | 'numeric' = 'default',
    required: boolean = false
  ) => (
    <View style={styles.inputContainer} key={field}>
      <TextInput
        style={styles.input}
        placeholder={required ? `${placeholder} *` : placeholder}
        placeholderTextColor="#999"
        value={String(formData[field] || '')}
        onChangeText={value => handleInputChange(field, value)}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderBooleanField = (label: string, field: keyof CarDetailsFormValues) => (
    <View style={styles.booleanContainer} key={field}>
      <Text style={styles.booleanLabel}>{label}</Text>
      <View style={styles.booleanButtons}>
        <TouchableOpacity
          style={[
            styles.booleanButton,
            formData[field] === true && styles.booleanSelected,
          ]}
          onPress={() => handleBooleanChange(field, true)}
        >
          <Text
            style={[
              styles.booleanText,
              formData[field] === true && styles.booleanTextSelected,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.booleanButton,
            formData[field] === false && styles.booleanSelected,
          ]}
          onPress={() => handleBooleanChange(field, false)}
        >
          <Text
            style={[
              styles.booleanText,
              formData[field] === false && styles.booleanTextSelected,
            ]}
          >
            No
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (fetchingData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Loading car details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Car Details</Text>
        <View style={styles.placeholder} />
      </View>

      {sellerId && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Seller ID: </Text>
            {sellerId}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Car ID: </Text>
            {carId}
          </Text>
        </View>
      )}

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {renderFormField('Title', 'title', 'default', true)}
        {renderFormField('Brand', 'brand', 'default', true)}
        {renderFormField('Model', 'model', 'default', true)}
        {renderFormField('Variant', 'variant')}
        {renderFormField('Price', 'price', 'numeric', true)}
        {renderFormField('Description', 'description')}
        {renderFormField('Color', 'color')}
        {renderFormField('Year of Purchase', 'yearOfPurchase', 'numeric', true)}
        {renderFormField('Fuel Type (PETROL/DIESEL/ELECTRIC/HYBRID)', 'fuelType')}
        {renderFormField('Transmission (MANUAL/AUTOMATIC)', 'transmission')}
        {renderFormField('KM Driven', 'kmDriven', 'numeric', true)}
        {renderFormField('Number of Owners', 'numberOfOwners', 'numeric')}
        {renderFormField('Condition', 'condition')}
        {renderFormField('Address', 'address')}
        {renderFormField('City', 'city')}
        {renderFormField('State', 'state')}
        {renderFormField('Pincode', 'pincode')}
        {renderFormField('Insurance Type', 'carInsuranceType')}
        {renderFormField('Insurance Date (YYYY-MM-DD)', 'carInsuranceDate')}

        {renderBooleanField('Airbag', 'airbag')}
        {renderBooleanField('ABS', 'abs')}
        {renderBooleanField('Button Start', 'buttonStart')}
        {renderBooleanField('Sunroof', 'sunroof')}
        {renderBooleanField('Child Safety Locks', 'childSafetyLocks')}
        {renderBooleanField('AC Feature', 'acFeature')}
        {renderBooleanField('Music Feature', 'musicFeature')}
        {renderBooleanField('Power Window', 'powerWindowFeature')}
        {renderBooleanField('Rear Parking Camera', 'rearParkingCameraFeature')}
        {renderBooleanField('Car Insurance', 'carInsurance')}
        {renderBooleanField('Negotiable', 'negotiable')}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Updating Car...' : 'Update Car'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditCarDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 34 },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  infoText: { fontSize: 14, color: '#1976D2', marginBottom: 4 },
  infoLabel: { fontWeight: '600' },
  formContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  inputContainer: { marginBottom: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  booleanContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  booleanLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
  booleanButtons: { flexDirection: 'row', gap: 10 },
  booleanButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  booleanSelected: { backgroundColor: '#4A90E2' },
  booleanText: { fontSize: 14, color: '#333' },
  booleanTextSelected: { color: '#fff', fontWeight: '600' },
  buttonContainer: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#f5f5f5' },
  nextButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#95a5a6' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
