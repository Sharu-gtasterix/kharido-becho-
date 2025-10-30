

// src/api/LaptopsApi/uploadLaptopImages.ts
import client from '../client';

export type RNFile = { uri: string; name: string; type: string };

export type UploadLaptopImagesResponse = {
  status?: string;
  message?: string;
  code?: string;
  statusCode?: number;
  imageUrls?: string[];
  [k: string]: any;
};

export type UploadProgress = {
  total: number;
  uploaded: number;
  current: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RETRIES = 3;
const UPLOAD_TIMEOUT = 60000; // 60 seconds

/**
 * Validate file before upload
 */
function validateFile(file: RNFile): { valid: boolean; error?: string } {
  if (!file.uri) {
    return { valid: false, error: 'Missing file URI' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: `Invalid file type: ${file.type}` };
  }

  return { valid: true };
}

/**
 * Upload a single image with retry logic
 */
async function uploadSingleImage(
  laptopId: number,
  file: RNFile,
  retryCount = 0
): Promise<string> {
  try {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const form = new FormData();

    // Append single file - backend expects 'files' field name
    form.append('files', {
      // @ts-ignore React Native FormData
      uri: file.uri,
      name: file.name || `laptop_${laptopId}_${Date.now()}.jpg`,
      type: file.type || 'image/jpeg',
    } as any);

    console.log(`[UPLOAD] Uploading: ${file.name} (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

    const { data } = await client.post<UploadLaptopImagesResponse>(
      `/api/laptop-photo/upload?laptopId=${encodeURIComponent(laptopId)}`,
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT,
        // Don't transform request - let FormData handle it
        transformRequest: [(data) => data],
      }
    );

    // Extract uploaded URL from response
    const uploadedUrl =
      data.imageUrls?.[0] ||
      (data as any).imageUrl ||
      (data as any).url ||
      'uploaded';

    console.log(`[UPLOAD SUCCESS] ${file.name} -> ${uploadedUrl}`);
    return uploadedUrl;

  } catch (error: any) {
    const isNetworkError =
      error.message?.toLowerCase().includes('network') ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT';

    // Retry on network errors
    if (isNetworkError && retryCount < MAX_RETRIES) {
      console.log(`[UPLOAD RETRY] ${file.name} - Retry ${retryCount + 1}/${MAX_RETRIES}`);
      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), 1000 * (retryCount + 1)),
      ); // Exponential backoff
      return uploadSingleImage(laptopId, file, retryCount + 1);
    }

    console.error(`[UPLOAD FAILED] ${file.name}:`, error.message);
    throw error;
  }
}

/**
 * Upload multiple images ONE BY ONE with progress tracking
 */
export async function uploadLaptopImages(
  laptopId: number,
  files: RNFile[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadLaptopImagesResponse> {

  if (!laptopId) {
    throw new Error('Laptop ID is required');
  }

  if (!files || files.length === 0) {
    throw new Error('No files to upload');
  }

  const uploadedUrls: string[] = [];
  const failedFiles: { file: RNFile; error: string }[] = [];

  console.log(`[UPLOAD START] Uploading ${files.length} images for laptop ${laptopId}`);

  // Upload files ONE BY ONE
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      // Report progress
      onProgress?.({
        total: files.length,
        uploaded: i,
        current: file.name || `Image ${i + 1}`,
      });

      const url = await uploadSingleImage(laptopId, file);
      uploadedUrls.push(url);

    } catch (error: any) {
      console.error(`[UPLOAD ERROR] Failed to upload ${file.name}:`, error.message);
      failedFiles.push({
        file,
        error: error.message || 'Upload failed',
      });
      // Continue with next file instead of stopping
    }
  }

  // Final progress
  onProgress?.({
    total: files.length,
    uploaded: files.length,
    current: 'Complete',
  });

  console.log(`[UPLOAD COMPLETE] Success: ${uploadedUrls.length}, Failed: ${failedFiles.length}`);

  // Return results
  if (uploadedUrls.length === 0) {
    throw new Error(`All uploads failed. First error: ${failedFiles[0]?.error}`);
  }

  return {
    status: 'success',
    message: `Uploaded ${uploadedUrls.length} of ${files.length} images`,
    imageUrls: uploadedUrls,
    statusCode: 200,
    failedCount: failedFiles.length,
    failedFiles: failedFiles.map(f => ({ name: f.file.name, error: f.error })),
  };
}
