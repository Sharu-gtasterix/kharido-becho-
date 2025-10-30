// src/screens/MobileScreens/AddMobileDetailsScreen

import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SellFlowLayout from '../Sell/common/SellFlowLayout';
import PrimaryButton from '../../components/common/PrimaryButton';
import TextField from '../../components/form/TextField';
import Textarea from '../../components/form/Textarea';
import DropdownField, { DropdownOption } from '../../components/form/DropdownField';
import ReadonlyPickerInput from '../../components/form/ReadonlyPickerInput';
import BottomSheetPicker, {
  BottomSheetPickerOption,
} from '../../components/common/BottomSheetPicker';
import { StepConfig } from '../../components/common/ProgressStepper';
import { colors, spacing } from '../../theme/tokens';
import { useFormState } from '../../form/hooks/useFormState';
import {
  CURRENT_YEAR,
  MIN_MOBILE_YEAR,
  MobileDetailsFormValues,
  getDefaultMobileDetailsValues,
  mobileDetailsSchema,
} from '../../form/schemas/mobileDetailsSchema';
import { FormFieldConfig } from '../../form/config/types';
import { getMobileDetailsFieldConfig } from '../../form/config/mobileDetailsFields';
import { normalizeCreateResponse } from '../../utils/normalizeCreateResponse';
import { toMobileCreateDTO } from '../../mappers/listingMappers';
import { addMobile } from '../../api/MobilesApi';
import { useAuth } from '../../context/AuthContext';
import { SellMobileStackParamList } from '../../navigation/SellMobileStack';
import getFriendlyApiError from '../../utils/getFriendlyApiError';

type AddMobileDetailsScreenNavigationProp = NativeStackNavigationProp<
  SellMobileStackParamList,
  'AddMobileDetails'
>;

const SELL_FLOW_STEPS: StepConfig[] = [
  { label: 'Details', status: 'current' },
  { label: 'Photos', status: 'upcoming' },
  { label: 'Confirm', status: 'upcoming' },
];

const AddMobileDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AddMobileDetailsScreenNavigationProp>();
  const { sellerId } = useAuth();

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    touchField,
    validateForm,
  } = useFormState<MobileDetailsFormValues>({
    initialValues: getDefaultMobileDetailsValues(),
    schema: mobileDetailsSchema,
  });

  const [loading, setLoading] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  const yearOptions = useMemo<BottomSheetPickerOption<string>[]>(() => {
    const years: BottomSheetPickerOption<string>[] = [];
    for (let year = CURRENT_YEAR; year >= MIN_MOBILE_YEAR; year -= 1) {
      const value = year.toString();
      years.push({ label: value, value });
    }
    return years;
  }, []);

  const fieldConfig = useMemo(
    () =>
      getMobileDetailsFieldConfig({
        onOpenYearPicker: () => setYearPickerVisible(true),
      }),
    [],
  );

  const renderField = (config: FormFieldConfig<MobileDetailsFormValues>) => {
    const field = config.field;
    const value = values[field];
    const error = touched[field] ? errors[field] : undefined;
    const labelAccessory = config.getLabelAccessory?.({ values });

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
              setFieldValue(field, nextValue as MobileDetailsFormValues[typeof field], {
                validate: Boolean(touched[field]),
              });
            }}
            onBlur={() => handleBlur(field)}
            required={config.required}
            error={error}
            labelAccessory={labelAccessory}
            {...config.props}
          />
        );
      }
      case 'textarea': {
        const formattedValue = value == null ? '' : String(value);
        return (
          <Textarea
            key={String(field)}
            label={config.label}
            value={formattedValue}
            onChangeText={(text) => {
              const nextValue =
                config.transform?.(text, { values }) ?? text;
              setFieldValue(field, nextValue as MobileDetailsFormValues[typeof field], {
                validate: Boolean(touched[field]),
              });
            }}
            onBlur={() => handleBlur(field)}
            required={config.required}
            error={error}
            labelAccessory={labelAccessory}
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
      case 'readonlyPicker': {
        const props = config.props ?? {};
        const { onPress, ...restProps } = props;
        return (
          <ReadonlyPickerInput
            key={String(field)}
            label={config.label}
            value={value as string | number | null | undefined}
            required={config.required}
            error={error}
            onPress={onPress ?? (() => {})}
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

    try {
      setLoading(true);
      const payload = toMobileCreateDTO(values, Number(sellerId));
      const response = await addMobile(payload);
      const normalized = normalizeCreateResponse(response, 'mobile');

      if (!normalized.success || normalized.id === null) {
        Alert.alert('Failed', normalized.rawMessage || 'Something went wrong');
        return;
      }

      Alert.alert('Success', normalized.message);
      navigation.navigate('SelectPhoto', { mobileId: normalized.id });
    } catch (error: any) {
      Alert.alert('Error', getFriendlyApiError(error, 'Failed to add mobile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SellFlowLayout
        title="Mobile Details"
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
        {fieldConfig.map((config) => renderField(config))}
        <View style={{ height: spacing.xxxl }} />
      </SellFlowLayout>

      <BottomSheetPicker
        visible={yearPickerVisible}
        title="Select Year"
        options={yearOptions}
        selectedValue={values.yearOfPurchase}
        onSelect={(year) => {
          touchField('yearOfPurchase');
          setFieldValue('yearOfPurchase', year, { validate: true });
        }}
        onClose={() => setYearPickerVisible(false)}
      />
    </>
  );
};

export default AddMobileDetailsScreen;
