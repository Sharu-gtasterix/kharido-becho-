import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyLaptopAdsStackParamList } from '../../navigation/MyLaptopAdsStack';
import { getLaptopById, LaptopDetail, updateLaptop } from '../../api/LaptopsApi';
import ListingUpdateLayout from '../../components/details/ListingUpdateLayout';
import ListingUpdateLoader from '../../components/details/ListingUpdateLoader';
import ListingFormInput from '../../components/form/ListingFormInput';
import ListingFormDropdown from '../../components/form/ListingFormDropdown';
import {
  listingUpdateStyles,
  LISTING_UPDATE_COLORS as COLORS,
  LISTING_UPDATE_SPACING as SPACING,
} from '../../theme/listingUpdate';
import useListingDetails from '../../hooks/useListingDetails';

type UpdateRouteProp = RouteProp<MyLaptopAdsStackParamList, 'UpdateLaptop'>;
type NavProp = NativeStackNavigationProp<MyLaptopAdsStackParamList, 'UpdateLaptop'>;

type FormState = {
  serialNumber: string;
  dealer: string;
  brand: string;
  model: string;
  price: string;
  warrantyInYear: number;
  processor: string;
  processorBrand: string;
  memoryType: string;
  ram: string;
  storage: string;
  colour: string;
  screenSize: string;
  battery: string;
  batteryLife: string;
  graphicsCard: string;
  graphicBrand: string;
  weight: string;
  manufacturer: string;
  usbPorts: string;
};

const DEFAULT_FORM: FormState = {
  serialNumber: '',
  dealer: '',
  brand: '',
  model: '',
  price: '',
  warrantyInYear: 1,
  processor: '',
  processorBrand: '',
  memoryType: '',
  ram: '',
  storage: '',
  colour: '',
  screenSize: '',
  battery: '',
  batteryLife: '',
  graphicsCard: '',
  graphicBrand: '',
  weight: '',
  manufacturer: '',
  usbPorts: '',
};

const warrantyOptions = [
  { label: '1 Year', value: 1 },
  { label: '2 Years', value: 2 },
  { label: '3 Years', value: 3 },
];

const styles = listingUpdateStyles;

const UpdateLaptopScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const {
    params: { laptopId },
  } = useRoute<UpdateRouteProp>();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const fetchLaptop = useCallback(() => getLaptopById(laptopId), [laptopId]);

  const { data, loading, error } = useListingDetails<LaptopDetail>(fetchLaptop, {
    defaultErrorMessage: 'Failed to load laptop',
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  useEffect(() => {
    if (!data) return;
    const allowedWarranty =
      data.warrantyInYear != null && warrantyOptions.some((option) => option.value === data.warrantyInYear)
        ? data.warrantyInYear
        : DEFAULT_FORM.warrantyInYear;

    setForm({
      serialNumber: data.serialNumber ?? '',
      dealer: data.dealer ?? '',
      brand: data.brand ?? '',
      model: data.model ?? '',
      price: data.price != null ? String(data.price) : '',
      warrantyInYear: allowedWarranty,
      processor: data.processor ?? '',
      processorBrand: data.processorBrand ?? '',
      memoryType: data.memoryType ?? '',
      ram: data.ram ?? '',
      storage: data.storage ?? '',
      colour: data.colour ?? '',
      screenSize: data.screenSize ?? '',
      battery: data.battery ?? '',
      batteryLife: data.batteryLife ?? '',
      graphicsCard: data.graphicsCard ?? '',
      graphicBrand: data.graphicBrand ?? '',
      weight: data.weight ?? '',
      manufacturer: data.manufacturer ?? '',
      usbPorts: data.usbPorts != null ? String(data.usbPorts) : '',
    });
  }, [data]);

  const handleFieldChange = (field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const trimmed = (value: string) => {
    const next = value.trim();
    return next.length > 0 ? next : undefined;
  };

  const handleSave = async () => {
    if (saving) return;

    if (!form.serialNumber.trim() || !form.brand.trim() || !form.model.trim() || !form.price.trim()) {
      Alert.alert('Validation', 'Please enter Serial Number, Brand, Model, and Price');
      return;
    }

    const priceNum = Number(form.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation', 'Please enter a valid numeric price');
      return;
    }

    const usbPortsNum = form.usbPorts.trim().length ? Number(form.usbPorts) : undefined;
    if (form.usbPorts.trim().length && (Number.isNaN(usbPortsNum!) || usbPortsNum! < 0)) {
      Alert.alert('Validation', 'Please enter a valid number of USB ports');
      return;
    }

    const payload = {
      serialNumber: form.serialNumber.trim(),
      dealer: trimmed(form.dealer),
      brand: form.brand.trim(),
      model: form.model.trim(),
      price: priceNum,
      warrantyInYear: Number(form.warrantyInYear) || DEFAULT_FORM.warrantyInYear,
      processor: trimmed(form.processor),
      processorBrand: trimmed(form.processorBrand),
      memoryType: trimmed(form.memoryType),
      ram: trimmed(form.ram),
      storage: trimmed(form.storage),
      colour: trimmed(form.colour),
      screenSize: trimmed(form.screenSize),
      battery: trimmed(form.battery),
      batteryLife: trimmed(form.batteryLife),
      graphicsCard: trimmed(form.graphicsCard),
      graphicBrand: trimmed(form.graphicBrand),
      weight: trimmed(form.weight),
      manufacturer: trimmed(form.manufacturer),
      usbPorts: usbPortsNum,
      status: data?.status,
      sellerId: data?.sellerId,
    };

    try {
      setSaving(true);
      await updateLaptop(laptopId, payload);
      Alert.alert('Success', 'Laptop updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to update laptop');
    } finally {
      setSaving(false);
    }
  };

  type FieldOptions = {
    placeholder?: string;
    keyboardType?: 'default' | 'numeric';
    required?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    maxLength?: number;
  };

  const renderField = (
    label: string,
    field: Exclude<keyof FormState, 'warrantyInYear'>,
    options: FieldOptions = {},
  ) => {
    const {
      placeholder = label,
      keyboardType = 'default',
      required = false,
      autoCapitalize = 'sentences',
      autoCorrect = true,
      maxLength,
    } = options;

    return (
      <ListingFormInput
        key={field}
        label={label}
        placeholder={placeholder}
        value={form[field]}
        onChangeText={(text) => handleFieldChange(field, text)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        required={required}
        maxLength={maxLength}
      />
    );
  };

  const renderDropdown = (
    label: string,
    field: 'warrantyInYear',
    data: Array<{ label: string; value: number }>,
    options: { placeholder?: string; required?: boolean } = {},
  ) => {
    const { placeholder = `Select ${label.toLowerCase()}`, required = false } = options;

    return (
      <ListingFormDropdown
        key={field}
        label={label}
        data={data}
        value={form[field]}
        onChange={(item) =>
          handleFieldChange(
            field,
            Number(item.value) || DEFAULT_FORM.warrantyInYear,
          )
        }
        placeholder={placeholder}
        required={required}
      />
    );
  };

  if (loading) {
    return <ListingUpdateLoader message="Loading laptop..." />;
  }

  return (
    <ListingUpdateLayout
      title="Edit Laptop Details"
      onBack={() => navigation.goBack()}
      backDisabled={saving}
      footer={
        <TouchableOpacity
          style={[styles.nextButton, saving && styles.nextButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.nextButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      }
      scrollProps={{ showsVerticalScrollIndicator: false }}
    >
      {renderField('Serial Number', 'serialNumber', {
        placeholder: 'Enter laptop serial number',
        required: true,
        autoCapitalize: 'characters',
        autoCorrect: false,
      })}
      {renderField('Dealer', 'dealer', {
        placeholder: 'Enter dealer name',
        autoCapitalize: 'words',
      })}
      {renderField('Brand', 'brand', {
        placeholder: 'e.g., HP, Dell, Apple',
        required: true,
        autoCapitalize: 'words',
      })}
      {renderField('Model', 'model', {
        placeholder: 'e.g., 15s-fq5009TU',
        required: true,
        autoCapitalize: 'characters',
        autoCorrect: false,
      })}
      {renderField('Price', 'price', {
        placeholder: 'Enter price',
        keyboardType: 'numeric',
        required: true,
        autoCapitalize: 'none',
        autoCorrect: false,
      })}
      {renderDropdown('Warranty (Years)', 'warrantyInYear', warrantyOptions, {
        placeholder: 'Select warranty duration',
      })}

      {renderField('Processor', 'processor', {
        placeholder: 'e.g., Intel Core i5-1335U',
        autoCapitalize: 'words',
      })}
      {renderField('Processor Brand', 'processorBrand', {
        placeholder: 'e.g., Intel, AMD',
        autoCapitalize: 'words',
      })}
      {renderField('RAM', 'ram', {
        placeholder: 'e.g., 16 GB',
        autoCapitalize: 'characters',
        autoCorrect: false,
      })}
      {renderField('Storage', 'storage', {
        placeholder: 'e.g., 512 GB SSD',
        autoCapitalize: 'characters',
        autoCorrect: false,
      })}
      {renderField('Colour', 'colour', {
        placeholder: 'e.g., Silver',
        autoCapitalize: 'words',
      })}
      {renderField('Screen Size', 'screenSize', {
        placeholder: 'e.g., 15.6 inch',
        autoCapitalize: 'none',
        autoCorrect: false,
      })}

      {renderField('Memory Type', 'memoryType', {
        placeholder: 'e.g., DDR4',
        autoCapitalize: 'characters',
        autoCorrect: false,
      })}
      {renderField('Battery', 'battery', {
        placeholder: 'e.g., 41 Wh Li-ion',
        autoCapitalize: 'words',
      })}
      {renderField('Battery Life', 'batteryLife', {
        placeholder: 'e.g., Up to 8 hours',
        autoCapitalize: 'sentences',
      })}
      {renderField('Graphics Card', 'graphicsCard', {
        placeholder: 'e.g., Intel Iris Xe',
        autoCapitalize: 'words',
      })}
      {renderField('Graphic Brand', 'graphicBrand', {
        placeholder: 'e.g., Intel',
        autoCapitalize: 'words',
      })}
      {renderField('Weight', 'weight', {
        placeholder: 'e.g., 1.59 kg',
        autoCapitalize: 'none',
        autoCorrect: false,
      })}
      {renderField('Manufacturer', 'manufacturer', {
        placeholder: 'e.g., HP India Pvt Ltd',
        autoCapitalize: 'words',
      })}
      {renderField('USB Ports', 'usbPorts', {
        placeholder: 'Number of USB ports',
        keyboardType: 'numeric',
        autoCapitalize: 'none',
        autoCorrect: false,
      })}

      <View style={{ height: SPACING.xxxl }} />
    </ListingUpdateLayout>
  );
};

export default UpdateLaptopScreen;

