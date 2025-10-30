// src/screens/LaptopScreens/AddLaptopDetailsScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SellFlowLayout from '../Sell/common/SellFlowLayout';
import PrimaryButton from '../../components/common/PrimaryButton';
import TextField from '../../components/form/TextField';
import DropdownField, { DropdownOption } from '../../components/form/DropdownField';
import { StepConfig } from '../../components/common/ProgressStepper';
import { colors, spacing } from '../../theme/tokens';
import { useFormState } from '../../form/hooks/useFormState';
import {
  LaptopDetailsFormValues,
  getDefaultLaptopDetailsValues,
  laptopDetailsSchema,
} from '../../form/schemas/laptopDetailsSchema';
import { FormFieldConfig } from '../../form/config/types';
import { laptopDetailsFieldConfig } from '../../form/config/laptopDetailsFields';
import { normalizeCreateResponse } from '../../utils/normalizeCreateResponse';
import { toLaptopCreateDTO } from '../../mappers/listingMappers';
import { addLaptop } from '../../api/LaptopsApi';
import { useAuth } from '../../context/AuthContext';
import { SellLaptopStackParamList } from '../../navigation/SellLaptopStack';
import getFriendlyApiError from '../../utils/getFriendlyApiError';

type AddLaptopNav = NativeStackNavigationProp<SellLaptopStackParamList, 'AddLaptopDetails'>;

const SELL_FLOW_STEPS: StepConfig[] = [
  { label: 'Details', status: 'current' },
  { label: 'Photos', status: 'upcoming' },
  { label: 'Confirm', status: 'upcoming' },
];

const AddLaptopDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AddLaptopNav>();
  const { sellerId } = useAuth();

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    touchField,
    validateForm,
  } = useFormState<LaptopDetailsFormValues>({
    initialValues: getDefaultLaptopDetailsValues(),
    schema: laptopDetailsSchema,
  });

  const [loading, setLoading] = useState(false);

  const renderField = (config: FormFieldConfig<LaptopDetailsFormValues>) => {
    const field = config.field;
    const value = values[field];
    const error = touched[field] ? errors[field] : undefined;

    switch (config.component) {
      case 'text': {
        const formattedValue = value == null ? '' : String(value);
        return (
          <TextField
            key={String(field)}
            label={config.label}
            value={formattedValue}
            onChangeText={(text) => {
              const nextValue =
                config.transform?.(text, { values }) ?? text;
              setFieldValue(field, nextValue as LaptopDetailsFormValues[typeof field], {
                validate: Boolean(touched[field]),
              });
            }}
            onBlur={() => handleBlur(field)}
            required={config.required}
            error={error}
            {...config.props}
          />
        );
      }
      case 'dropdown': {
        const props = config.props ?? {};
        const data: DropdownOption<any>[] = props.data ?? [];
        const { placeholder, ...restProps } = props;
        return (
          <DropdownField
            key={String(field)}
            label={config.label}
            data={data}
            value={value as any}
            onChange={(item) => {
              touchField(field);
              setFieldValue(field, item.value, { validate: true });
            }}
            required={config.required}
            error={error}
            placeholder={placeholder}
            {...restProps}
          />
        );
      }
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (sellerId == null) {
      Alert.alert('Error', 'Seller account not found');
      return;
    }

    const valid = validateForm();
    if (!valid) {
      return;
    }

    if (!values.serialNumber.trim() || !values.brand.trim() || !values.model.trim() || !values.price.trim()) {
      Alert.alert('Error', 'Please enter Serial Number, Brand, Model, and Price');
      return;
    }

    try {
      setLoading(true);
      const payload = toLaptopCreateDTO(values, Number(sellerId));
      const response = await addLaptop(payload);
      const normalized = normalizeCreateResponse(response, 'laptop');

      if (!normalized.success) {
        Alert.alert('Failed', normalized.rawMessage || 'Laptop could not be created');
        return;
      }

      if (normalized.id === null) {
        const baseMessage = normalized.message || normalized.fallbackMessage;
        Alert.alert(
          'Success',
          `${baseMessage}. Unable to determine the new listing id automatically. Please upload photos from My Laptop Ads.`,
        );
        return;
      }

      Alert.alert('Success', normalized.message || normalized.fallbackMessage);
      navigation.navigate('SelectLaptopPhotoScreen', { laptopId: normalized.id });
    } catch (error: any) {
      Alert.alert('Error', getFriendlyApiError(error, 'Failed to add laptop'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellFlowLayout
      title="Laptop Details"
      onBack={() => navigation.goBack()}
      steps={SELL_FLOW_STEPS}
      footer={
        <PrimaryButton
          label="Next"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          icon={<Icon name="arrow-right" size={20} color={colors.white} />}
        />
      }
      contentContainerStyle={{ paddingBottom: spacing.xxxl }}
    >
      {laptopDetailsFieldConfig.map((config) => renderField(config))}
      <View style={{ height: spacing.xxxl }} />
    </SellFlowLayout>
  );
};

export default AddLaptopDetailsScreen;
