import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellCarStackParamList } from '../../navigation/SellCarStack';
import { CarsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toCarCreateDTO, CarDetailsFormValues } from '../../mappers/listingMappers';
import { validateCarDetails } from '../../form/schemas/CarDetailsSchema';

type AddCarDetailsScreenNavigationProp = NativeStackNavigationProp<
  SellCarStackParamList,
  'AddCarDetails'
>;

const AddCarDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AddCarDetailsScreenNavigationProp>();
  const { sellerId, userId, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!isSignedIn) {
      Alert.alert('Error', 'You must be logged in to add a car', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    }

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
      console.log('=== STARTING CAR ADD PROCESS ===');

      if (!sellerId) {
        Alert.alert('Error', 'Seller ID not found. Please ensure you are logged in as a seller.');
        if (isMounted.current) {
          setLoading(false);
        }
        return;
      }

      // Validate form
      const validation = validateCarDetails(formData);
      if (!validation.success && validation.errors && validation.errors.length > 0) {
        const errorMessage = validation.errors[0].message || 'Please check all required fields';
        Alert.alert('Validation Error', errorMessage);
        if (isMounted.current) {
          setLoading(false);
        }
        return;
      }

      // Create DTO
      const carDTO = toCarCreateDTO(formData, sellerId);

      console.log('=== FINAL CAR DTO TO API ===');
      console.log(JSON.stringify(carDTO, null, 2));
      console.log('=== USING SELLER ID FROM AUTH:', sellerId, '===');

      // Call API using namespace import
      console.log('=== CALLING ADD CAR API ===');
      const response = await CarsApi.addCar(carDTO);

      console.log('=== API SUCCESS RESPONSE ===');
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('response.carId:', response.carId);
      console.log('response.status:', response.status);
      console.log('response.statusCode:', response.statusCode);
      console.log('response.message:', response.message);

      if (!isMounted.current) return;

      // Extract carId
      let newCarId: number | undefined = response.carId;

      console.log('✅ EXTRACTED CAR ID:', newCarId);

      if (newCarId) {
        console.log('Showing alert with Edit button for carId:', newCarId);

        Alert.alert(
          'Success ✅',
          response.message || 'Car added successfully!',
          [
            {
              text: 'Edit Car',
              onPress: () => {
                console.log('User clicked Edit Car, navigating with carId:', newCarId);
                if (isMounted.current && newCarId) {
                  navigation.replace('EditCarDetails', { carId: newCarId });
                }
              },
            },
            {
              text: 'Done',
              onPress: () => {
                if (isMounted.current) {
                  navigation.goBack();
                }
              },
              style: 'cancel',
            },
          ]
        );
      } else {
        console.warn('❌ NO CAR ID FOUND! Response:', response);
        Alert.alert('Success', 'Car added successfully!', [
          {
            text: 'Done',
            onPress: () => {
              if (isMounted.current) {
                navigation.goBack();
              }
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('=== ERROR ===', error.message);
      if (!isMounted.current) return;

      let errorMessage = error.message || 'Something went wrong. Please try again.';
      if (errorMessage.includes('500')) {
        errorMessage = 'Server Error (500): Check backend logs for details';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Car Details</Text>
        <View style={styles.placeholder} />
      </View>

      {sellerId && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Seller ID: </Text>
            {sellerId}
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
            {loading ? 'Adding Car...' : 'Add Car'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddCarDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  infoText: { fontSize: 14, color: '#1976D2' },
  infoLabel: { fontWeight: '600' },
  formContainer: { flex: 1, paddingHorizontal: 20 },
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
