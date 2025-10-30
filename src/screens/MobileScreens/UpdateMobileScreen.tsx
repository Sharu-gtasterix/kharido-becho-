import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyAdsStackParamList } from '../../navigation/MyAdsStack';
import { getMobileById, updateMobile, UpdateMobileDTO } from '../../api/MobilesApi';
import ListingUpdateLayout from '../../components/details/ListingUpdateLayout';
import ListingUpdateLoader from '../../components/details/ListingUpdateLoader';
import ListingFormInput from '../../components/form/ListingFormInput';
import ListingFormDropdown from '../../components/form/ListingFormDropdown';
import ListingFormTextArea from '../../components/form/ListingFormTextArea';
import ListingYearPickerField from '../../components/form/ListingYearPickerField';
import {
  listingUpdateStyles,
  LISTING_UPDATE_COLORS as COLORS,
  LISTING_UPDATE_SPACING as SPACING,
} from '../../theme/listingUpdate';
import useListingDetails from '../../hooks/useListingDetails';
import { MobileDetail } from '../../api/MobilesApi';
import getFriendlyApiError from '../../utils/getFriendlyApiError';
import { useAuth } from '../../context/AuthContext';

type UpdateRouteProp = RouteProp<MyAdsStackParamList, 'UpdateMobile'>;
type UpdateNavProp = NativeStackNavigationProp<MyAdsStackParamList, 'UpdateMobile'>;

type FormErrors = {
  title?: string;
  description?: string;
  price?: string;
  brand?: string;
  model?: string;
  color?: string;
  yearOfPurchase?: string;
  condition?: string;
  negotiable?: string;
};

const conditionOptions = [
  { label: 'NEW', value: 'NEW' },
  { label: 'USED', value: 'USED' },
];

const negotiableOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

const styles = listingUpdateStyles;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1990;

const UpdateMobileScreen: React.FC = () => {
  const navigation = useNavigation<UpdateNavProp>();
  const { params } = useRoute<UpdateRouteProp>();
  const { mobileId } = params;
  const { sellerId: authSellerId } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    negotiable: null as boolean | null,
    condition: null as string | null,
    brand: '',
    model: '',
    color: '',
    yearOfPurchase: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [ownerSellerId, setOwnerSellerId] = useState<number | null>(null);
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);

  const yearOptions = useMemo(() => {
    const years: string[] = [];
    for (let year = CURRENT_YEAR; year >= MIN_YEAR; year--) {
      years.push(year.toString());
    }
    return years;
  }, []);

  const fetchMobile = useCallback(() => getMobileById(mobileId), [mobileId]);

  const { data, loading, error } = useListingDetails<MobileDetail>(fetchMobile, {
    defaultErrorMessage: 'Failed to load mobile details',
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  useEffect(() => {
    if (!data) return;
    const nextFormData = {
      title: data.title ?? '',
      description: data.description ?? '',
      price: data.price != null ? String(data.price) : '',
      negotiable: typeof data.negotiable === 'boolean' ? data.negotiable : null,
      condition: (data.condition as string) ?? null,
      brand: data.brand ?? '',
      model: data.model ?? '',
      color: data.color ?? '',
      yearOfPurchase: data.yearOfPurchase ? String(data.yearOfPurchase) : '',
    };
    setFormData(nextFormData);
    setInitialFormData({ ...nextFormData });
    setOwnerSellerId(
      typeof data.sellerId === 'number' && Number.isFinite(data.sellerId)
        ? data.sellerId
        : null,
    );
    setTouched({});
    setErrors({});
  }, [data]);

  const validateField = useCallback((field: string, value: any): string | undefined => {
    switch (field) {
      case 'title':
        if (!value || value.trim().length < 5) return 'Title must be at least 5 characters';
        if (value.length > 80) return 'Title must not exceed 80 characters';
        break;
      case 'description':
        if (!value || value.trim().length < 20) return 'Description must be at least 20 characters';
        if (value.length > 400) return 'Description must not exceed 400 characters';
        break;
      case 'price': {
        const price = parseFloat(value);
        if (!value || Number.isNaN(price)) return 'Please enter a valid price';
        if (price <= 0) return 'Price must be greater than 0';
        if (price > 10000000) return 'Price seems too high';
        break;
      }
      case 'brand':
      case 'model':
      case 'color':
        if (!value || value.trim().length === 0) return 'This field is required';
        break;
      case 'yearOfPurchase': {
        if (!value) return 'Please select year of purchase';
        const year = parseInt(value, 10);
        if (Number.isNaN(year) || year < MIN_YEAR || year > CURRENT_YEAR) {
          return `Year must be between ${MIN_YEAR} and ${CURRENT_YEAR}`;
        }
        break;
      }
      case 'condition':
        if (!value) return 'Please select condition';
        break;
      case 'negotiable':
        if (value === null || value === undefined) return 'Please select negotiable';
        break;
      default:
        break;
    }
    return undefined;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched((prev) => {
      const updated: Record<string, boolean> = { ...prev };
      (Object.keys(formData) as Array<keyof typeof formData>).forEach((field) => {
        updated[field] = true;
      });
      return updated;
    });
    return isValid;
  }, [formData, validateField]);

  const handleInputChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (field: string, value?: any) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const valueToValidate = value !== undefined ? value : formData[field];
      const error = validateField(field, valueToValidate);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField],
  );

  const handleUpdate = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert('Please review the form', 'Correct highlighted fields before saving.');
      return;
    }

    const changedFields = initialFormData
      ? (Object.keys(formData) as Array<keyof typeof formData>).filter((field) => {
          const current = formData[field];
          const initial = initialFormData[field];
          const normalize = (value: any) => {
            if (typeof value === 'string') {
              return value.trim();
            }
            return value;
          };
          return normalize(current) !== normalize(initial);
        })
      : (Object.keys(formData) as Array<keyof typeof formData>);

    if (changedFields.length === 0) {
      Alert.alert('No changes detected', 'Please update at least one field before saving.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    const yearNum = parseInt(formData.yearOfPurchase, 10);

    try {
      setSaving(true);

      const payload: UpdateMobileDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: priceNum,
        negotiable: formData.negotiable === true,
        condition: formData.condition,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        color: formData.color.trim(),
        yearOfPurchase: yearNum,
      };

      const resolvedSellerId =
        (typeof ownerSellerId === 'number' && Number.isFinite(ownerSellerId) && ownerSellerId) ||
        (typeof authSellerId === 'number' && Number.isFinite(authSellerId) && authSellerId) ||
        undefined;

      if (resolvedSellerId !== undefined) {
        Object.assign(payload, { sellerId: resolvedSellerId });
      }

      await updateMobile(mobileId, payload);
      Alert.alert('Success', 'Mobile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', getFriendlyApiError(err, 'Failed to update mobile'));
    } finally {
      setSaving(false);
    }
  }, [authSellerId, formData, initialFormData, mobileId, navigation, ownerSellerId, validateForm]);

  if (loading) {
    return <ListingUpdateLoader message="Loading mobile details..." />;
  }

  return (
    <>
      <ListingUpdateLayout
        title="Edit Mobile Details"
        onBack={() => navigation.goBack()}
        footer={
          <TouchableOpacity
            style={[styles.nextButton, saving && styles.nextButtonDisabled]}
            onPress={handleUpdate}
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
        <ListingFormInput
          label="Title"
          placeholder="e.g., iPhone 15 Pro - Excellent Condition"
          value={formData.title}
          onChangeText={(v) => handleInputChange('title', v)}
          onBlur={() => handleBlur('title')}
          error={touched.title ? errors.title : undefined}
          autoCapitalize="sentences"
          maxLength={80}
          required
        />

        <ListingFormTextArea
          label="Description"
          value={formData.description}
          onChangeText={(v) => handleInputChange('description', v)}
          onBlur={() => handleBlur('description')}
          error={touched.description ? errors.description : undefined}
          autoCapitalize="sentences"
          maxLength={400}
          required
          placeholder="Describe your mobile's condition, features, and accessories..."
        />

        <ListingFormInput
          label="Price"
          placeholder="Enter price"
          value={formData.price}
          onChangeText={(v) => handleInputChange('price', v.replace(/[^0-9]/g, ''))}
          onBlur={() => handleBlur('price')}
          error={touched.price ? errors.price : undefined}
          keyboardType="numeric"
          maxLength={10}
          required
        />

        <ListingFormDropdown
          label="Condition"
          data={conditionOptions}
          value={formData.condition}
          onChange={(item) => {
            handleInputChange('condition', item.value);
            handleBlur('condition', item.value);
          }}
          error={touched.condition ? errors.condition : undefined}
          required
        />

        <ListingFormInput
          label="Brand"
          placeholder="e.g., Apple, Samsung, OnePlus"
          value={formData.brand}
          onChangeText={(v) => handleInputChange('brand', v)}
          onBlur={() => handleBlur('brand')}
          error={touched.brand ? errors.brand : undefined}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={40}
          required
        />

        <ListingFormInput
          label="Model"
          placeholder="e.g., 15 Pro Max, Galaxy S24"
          value={formData.model}
          onChangeText={(v) => handleInputChange('model', v)}
          onBlur={() => handleBlur('model')}
          error={touched.model ? errors.model : undefined}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={40}
          required
        />

        <ListingFormInput
          label="Color"
          placeholder="e.g., Midnight Blue, Space Gray"
          value={formData.color}
          onChangeText={(v) => handleInputChange('color', v)}
          onBlur={() => handleBlur('color')}
          error={touched.color ? errors.color : undefined}
          autoCapitalize="words"
          maxLength={40}
          required
        />

        <ListingYearPickerField
          label="Year of Purchase"
          value={formData.yearOfPurchase}
          years={yearOptions}
          onChange={(year) => {
            handleInputChange('yearOfPurchase', year);
            handleBlur('yearOfPurchase', year);
          }}
          required
          error={touched.yearOfPurchase ? errors.yearOfPurchase : undefined}
        />

        <ListingFormDropdown
          label="Negotiable"
          data={negotiableOptions}
          value={formData.negotiable}
          onChange={(item) => {
            handleInputChange('negotiable', item.value);
            handleBlur('negotiable', item.value);
          }}
          error={touched.negotiable ? errors.negotiable : undefined}
          required
        />

        <View style={{ height: SPACING.xxxl }} />
      </ListingUpdateLayout>
    </>
  );
};

export default UpdateMobileScreen;

