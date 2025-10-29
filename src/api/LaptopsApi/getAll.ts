// src/api/LaptopsApi/getAllLaptops.ts
import client from '../client';

export type LaptopStatus =
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'DRAFT'
  | 'DEACTIVATE'
  | 'DELETED'
  | 'PENDING'
  | 'SOLD'
  | string;

export type LaptopPhoto = {
  photoId: number;
  photo_link: string;
  publicId?: string;
};

export type LaptopItem = {
  id: number;                // backend uses "id"
  serialNumber?: string;
  dealer?: string;
  model?: string;
  brand?: string;
  price?: number;
  warrantyInYear?: number;
  processor?: string;
  processorBrand?: string;
  memoryType?: string;
  screenSize?: string;
  colour?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  batteryLife?: string;
  graphicsCard?: string;
  graphicBrand?: string;
  weight?: string;
  manufacturer?: string;
  usbPorts?: number;
  status?: LaptopStatus;
  laptopPhotos?: LaptopPhoto[];
  deleted?: boolean;
  deletedAt?: string | null;
};

// Plain array response (based on your Postman example)
export async function getAllLaptops(): Promise<LaptopItem[]> {
  const res = await client.get<LaptopItem[]>('/api/laptops/getAll');
  return res.data ?? [];
}
