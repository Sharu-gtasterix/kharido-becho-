import React from 'react';
import { Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';

import PhotoUploadLayout, {
  PhotoUploadProgressState,
  PhotoUploadStep,
} from '../../components/photoUpload/PhotoUploadLayout';
import { useSafeAsyncState } from '../../hooks/useSafeAsyncState';
import { MobileStackParamList } from '../../navigation/MobileStack';
import { ensureOverlayReady } from '../../utils/ensureOverlayReady';
import { uploadMobileImages } from '../../api/MobilesApi';

type SelectPhotoNavProp = NativeStackNavigationProp<MobileStackParamList, 'SelectPhoto'>;
type RouteProps = RouteProp<MobileStackParamList, 'SelectPhoto'>;

const STEPS: PhotoUploadStep[] = [
  { label: 'Details', state: 'complete', stepNumber: 1 },
  { label: 'Photos', state: 'active', stepNumber: 2 },
  { label: 'Confirm', state: 'upcoming', stepNumber: 3 },
];

const PROGRESS_HINT = 'Please wait...';

const SelectMobilePhotoScreen: React.FC = () => {
  const navigation = useNavigation<SelectPhotoNavProp>();
  const route = useRoute<RouteProps>();
  const { mobileId } = route.params;

  const [uploading, setUploading] = useSafeAsyncState(false);
  const [uploadProgress, setUploadProgress] = useSafeAsyncState<PhotoUploadProgressState | null>(
    null,
  );

  const uploadFromAssets = async (assets: Asset[]) => {
    if (uploading) return;

    if (!mobileId) {
      Alert.alert('Error', 'Missing mobile id');
      return;
    }

    const valid = (assets || []).filter((asset) => !!asset?.uri);
    if (valid.length === 0) {
      Alert.alert('Error', 'No photo selected');
      return;
    }

    setUploading(true);
    setUploadProgress({ total: valid.length, uploaded: 0, current: 'Starting...' });

    try {
      await ensureOverlayReady();

      const files = valid.map((asset, index) => ({
        uri: asset.uri!,
        name: asset.fileName ?? `mobile_${Date.now()}_${index}.jpg`,
        type: asset.type ?? 'image/jpeg',
      }));

      const uploadedUrls: string[] = [];
      const seenUrls = new Set<string>();
      const failedFiles: { name: string; error: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        setUploadProgress({
          total: files.length,
          uploaded: i,
          current: file.name || `Image ${i + 1}`,
        });

        try {
          const urls = await uploadMobileImages(mobileId, [file]);

          if (!Array.isArray(urls)) {
            throw new Error('Invalid response from server');
          }

          urls.forEach((url) => {
            if (typeof url === 'string' && url.trim().length && !seenUrls.has(url)) {
              seenUrls.add(url);
              uploadedUrls.push(url);
            }
          });
        } catch (error: any) {
          console.error('[MOBILE UPLOAD ERROR]', error?.message || error);
          failedFiles.push({
            name: file.name || `Image ${i + 1}`,
            error: error?.message || 'Upload failed',
          });
        }
      }

      setUploadProgress({
        total: files.length,
        uploaded: files.length,
        current: 'Complete',
      });

      if (uploadedUrls.length === 0) {
        const firstError = failedFiles[0]?.error || 'All uploads failed';
        throw new Error(firstError);
      }

      const successCount = uploadedUrls.length;
      const failCount = failedFiles.length;

      if (failCount > 0) {
        Alert.alert(
          'Partial Success',
          `${successCount} of ${files.length} images uploaded successfully.\n${failCount} failed.`,
          [
            {
              text: 'Continue Anyway',
              onPress: () =>
                navigation.navigate('ConfirmDetails', { mobileId, images: uploadedUrls }),
            },
            { text: 'Retry Failed', style: 'cancel' },
          ],
        );
      } else {
        Alert.alert('Success', `All ${successCount} images uploaded successfully!`);
        navigation.navigate('ConfirmDetails', { mobileId, images: uploadedUrls });
      }
    } catch (error: any) {
      console.error('[UPLOAD FAILED]', error?.response?.data || error?.message || error);
      Alert.alert('Upload Failed', error?.message || 'Network error. Please try again.', [
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
      Alert.alert('Camera Error', 'Failed to open camera');
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
      Alert.alert('Gallery Error', 'Failed to open gallery');
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

export default SelectMobilePhotoScreen;
