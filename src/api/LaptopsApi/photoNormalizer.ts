// src/api/LaptopsApi/photoNormalizer.ts
export type LaptopPhoto = {
  photoId?: number | string;
  photo_link: string;
  publicId?: string;
  [key: string]: any;
};

type RawLaptopPhoto = {
  photoId?: number | string | null;
  photo_id?: number | string | null;
  id?: number | string | null;
  photo_link?: string | null;
  photoLink?: string | null;
  photoURL?: string | null;
  photoUrl?: string | null;
  photo_url?: string | null;
  url?: string | null;
  secureUrl?: string | null;
  secure_url?: string | null;
  publicId?: string | null;
  public_id?: string | null;
  [key: string]: any;
};

const pickString = (...values: Array<unknown>): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const pickId = (...values: Array<unknown>): number | string | undefined => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

export const normalizeLaptopPhoto = (
  photo: RawLaptopPhoto | null | undefined
): LaptopPhoto | null => {
  if (!photo || typeof photo !== 'object') {
    return null;
  }

  const photoId = pickId(photo.photoId, photo.photo_id, photo.id);
  const publicId = pickString(photo.publicId, photo.public_id);
  const photoLink = pickString(
    photo.photo_link,
    photo.photoLink,
    photo.photoURL,
    photo.photoUrl,
    photo.photo_url,
    photo.url,
    photo.secureUrl,
    photo.secure_url
  );

  if (!photoLink) {
    return null;
  }

  return {
    ...photo,
    photoId,
    photo_link: photoLink,
    publicId,
  };
};

const toLaptopPhotos = (collection: unknown): LaptopPhoto[] => {
  if (!Array.isArray(collection)) {
    return [];
  }

  return collection
    .map((item) => {
      if (typeof item === 'string') {
        return normalizeLaptopPhoto({ photo_link: item });
      }
      if (!item || typeof item !== 'object') {
        return null;
      }
      return normalizeLaptopPhoto(item as RawLaptopPhoto);
    })
    .filter((item): item is LaptopPhoto => !!item);
};

export const normalizeLaptopPhotos = (photos: unknown): LaptopPhoto[] => {
  return toLaptopPhotos(photos);
};

const photoCollectionKeys = [
  'laptopPhotos',
  'laptopPhotoDtos',
  'laptopPhotoResponses',
  'laptopPhotoList',
  'laptop_photo',
  'photos',
  'photoDtos',
  'photoResponses',
  'images',
  'imageList',
  'imageUrls',
  'imageURLs',
  'image_urls',
  'urls',
];

export const extractLaptopPhotos = (source: unknown): LaptopPhoto[] => {
  if (Array.isArray(source)) {
    return toLaptopPhotos(source);
  }

  if (!source || typeof source !== 'object') {
    return [];
  }

  const src = source as Record<string, unknown>;

  for (const key of photoCollectionKeys) {
    const value = src[key];
    const normalized = toLaptopPhotos(value);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  const singularKeys = ['primaryPhoto', 'photo', 'image', 'photoUrl', 'photoURL', 'url'];
  for (const key of singularKeys) {
    const value = src[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return toLaptopPhotos([value]);
    }
    if (value && typeof value === 'object') {
      const normalized = normalizeLaptopPhoto(value as RawLaptopPhoto);
      if (normalized) {
        return [normalized];
      }
    }
  }

  return [];
};
