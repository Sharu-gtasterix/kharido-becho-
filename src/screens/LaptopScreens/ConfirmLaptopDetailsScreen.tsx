import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { CommonActions, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ConfirmContactForm, {
  type ConfirmContactFormValues,
} from '../../components/sell/ConfirmContactForm';
import PrimaryButton from '../../components/common/PrimaryButton';
import SellFlowLayout from '../Sell/common/SellFlowLayout';
import { buildSellFlowSteps } from '../Sell/common/steps';
import { useSafeAsyncState } from '../../hooks/useSafeAsyncState';
import { useAuth } from '../../context/AuthContext';
import { getLaptopConfirmDetailsCombined, type LaptopConfirmDetailsDTO } from '../../api/LaptopsApi';
import { SellLaptopStackParamList } from '../../navigation/SellLaptopStack';

type ConfirmLaptopNav = NativeStackNavigationProp<SellLaptopStackParamList, 'ConfirmLaptopDetails'>;
type ConfirmLaptopRoute = RouteProp<SellLaptopStackParamList, 'ConfirmLaptopDetails'>;

const CONFIRM_STEPS = buildSellFlowSteps(2);
const PRICE_PLACEHOLDER = 'e.g., Rs 58999';

const ConfirmLaptopDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ConfirmLaptopNav>();
  const route = useRoute<ConfirmLaptopRoute>();
  const { laptopId } = route.params;

  const { userId } = useAuth();
  const [loading, setLoading] = useSafeAsyncState(true);
  const [formData, setFormData] = useSafeAsyncState<LaptopConfirmDetailsDTO>({
    price: '',
    name: '',
    phoneNumber: '',
  });

  useEffect(() => {
    const loadDetails = async () => {
      try {
        if (!laptopId) {
          throw new Error('Missing laptop id');
        }
        if (!userId) {
          throw new Error('Missing user id');
        }

        setLoading(true);
        const data = await getLaptopConfirmDetailsCombined({ laptopId, userId });
        setFormData(data);
      } catch (error: any) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || error?.message || 'Failed to load details',
        );
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [laptopId, setFormData, setLoading, userId]);

  const handleInputChange = <K extends keyof ConfirmContactFormValues>(
    field: K,
    value: ConfirmContactFormValues[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePostNow = () => {
    Alert.alert('Success', 'Your laptop ad has been posted!');

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  };

  return (
    <SellFlowLayout
      title="Confirm Details"
      onBack={() => navigation.goBack()}
      steps={CONFIRM_STEPS}
      footer={
        <PrimaryButton label="Post Now" onPress={handlePostNow} loading={loading} />
      }
    >
      <ConfirmContactForm
        values={formData}
        onChange={handleInputChange}
        editable={!loading}
        pricePlaceholder={PRICE_PLACEHOLDER}
      />
    </SellFlowLayout>
  );
};

export default ConfirmLaptopDetailsScreen;
