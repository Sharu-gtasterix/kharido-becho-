import React, { useCallback } from 'react';
import { Alert, type AlertButton, type AlertOptions } from 'react-native';
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { RNFile, UploadProgress, uploadLaptopImages } from '../../api/LaptopsApi';
import PhotoUploadLayout, {
  PhotoUploadProgressState,
  PhotoUploadStep,
} from '../../components/photoUpload/PhotoUploadLayout';
import { useSafeAsyncState } from '../../hooks/useSafeAsyncState';
import { SellLaptopStackParamList } from '../../navigation/SellLaptopStack';
import { ensureOverlayReady } from '../../utils/ensureOverlayReady';

type SelectLaptopPhotoNav = NativeStackNavigationProp<
  SellLaptopStackParamList,
  'SelectLaptopPhotoScreen'
>;
type SelectLaptopPhotoRoute = RouteProp<SellLaptopStackParamList, 'SelectLaptopPhotoScreen'>;

const STEPS: PhotoUploadStep[] = [
  { label: 'Details', state: 'complete', stepNumber: 1 },
  { label: 'Photos', state: 'active', stepNumber: 2 },
  { label: 'Confirm', state: 'upcoming', stepNumber: 3 },
];

const PROGRESS_HINT = 'Please wait...';

const SelectLaptopPhotoScreen: React.FC = () => {
  const navigation = useNavigation<SelectLaptopPhotoNav>();
  const route = useRoute<SelectLaptopPhotoRoute>();
  const { laptopId } = route.params;
  const isFocused = useIsFocused();

  const [uploading, setUploading] = useSafeAsyncState(false);
  const [uploadProgress, setUploadProgress] = useSafeAsyncState<PhotoUploadProgressState | null>(
    null,
  );

  const showAlert = useCallback(
    (title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) => {
      if (!isFocused) {
        return;
      }
      Alert.alert(title, message, buttons, options);
    },
    [isFocused],
  );

  const uploadFromAssets = async (assets: Asset[]) => {
    if (uploading) return;

    if (!laptopId) {
      showAlert('Error', 'Missing laptop ID');
      return;
    }

    const valid = (assets || []).filter((asset) => !!asset?.uri);
    if (valid.length === 0) {
      showAlert('Error', 'No photos selected');
      return;
    }

    setUploading(true);
    setUploadProgress({ total: valid.length, uploaded: 0, current: 'Starting...' });

    try {
      await ensureOverlayReady();

      const files: RNFile[] = valid.map((asset, index) => ({
        uri: asset.uri!,
        name: asset.fileName ?? `laptop_${Date.now()}_${index}.jpg`,
        type: asset.type ?? 'image/jpeg',
      }));

      console.log(`[LAPTOP PHOTOS] Uploading ${files.length} image(s)`);

      const handleProgress = (progress: UploadProgress) => {
        setUploadProgress(progress);
      };

      const result = await uploadLaptopImages(laptopId, files, handleProgress);

      const uploadedUrls = Array.isArray(result?.imageUrls)
        ? result.imageUrls.filter((url) => typeof url === 'string' && url.trim().length > 0)
        : [];

      const total = files.length;
      const successCount = uploadedUrls.length;
      const rawFailed = Number((result as any)?.failedCount);
      const failCount = Number.isFinite(rawFailed)
        ? Math.max(rawFailed, 0)
        : Math.max(total - successCount, 0);

      setUploadProgress({ total, uploaded: total, current: 'Complete' });

      if (successCount === 0) {
        const firstError =
          (result as any)?.failedFiles?.[0]?.error ||
          (result as any)?.message ||
          'All uploads failed';
        throw new Error(firstError);
      }

      const navigateToConfirm = () => navigation.replace('ConfirmLaptopDetails', { laptopId });

      if (failCount > 0) {
        showAlert(
          'Partial Success',
          `${successCount} of ${total} images uploaded successfully.\n${failCount} failed.`,
          [
            { text: 'Continue Anyway', onPress: navigateToConfirm },
            { text: 'Retry Failed', style: 'cancel' },
          ],
        );
      } else {
        showAlert('Success', `All ${successCount} images uploaded successfully!`);
        navigateToConfirm();
      }
    } catch (error: any) {
      console.error('[LAPTOP PHOTO UPLOAD ERROR]', error?.response?.data || error?.message || error);
      showAlert('Upload Failed', error?.message || 'Network error. Please try again.', [
        { text: 'Retry', onPress: () => uploadFromAssets(assets) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleTakePhoto = async () => {
    if (uploading) return;
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (res.assets?.length) {
        await uploadFromAssets(res.assets);
      }
    } catch (error) {
      console.error('[CAMERA ERROR]', error);
      showAlert('Camera Error', 'Failed to open camera');
    }
  };

  const handlePickGallery = async () => {
    if (uploading) return;
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 10,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (res.assets?.length) {
        await uploadFromAssets(res.assets);
      }
    } catch (error) {
      console.error('[GALLERY ERROR]', error);
      showAlert('Gallery Error', 'Failed to open gallery');
    }
  };

  return (
    <PhotoUploadLayout
      title="Upload Photos"
      onBackPress={() => navigation.goBack()}
      backDisabled={uploading}
      steps={STEPS}
      actions={[
        { label: 'Take Photo', iconName: 'camera', onPress: handleTakePhoto },
        { label: 'Pick Gallery', iconName: 'folder', onPress: handlePickGallery },
      ]}
      uploading={uploading}
      progress={uploadProgress}
      progressHint={PROGRESS_HINT}
    />
  );
};

export default SelectLaptopPhotoScreen;
