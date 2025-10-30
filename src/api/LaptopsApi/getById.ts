// src/api/LaptopsApi/getLaptopById.ts
import client from '../client';
import { extractLaptopPhotos, LaptopPhoto } from './photoNormalizer';

export type LaptopDetail = {
  id: number;
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
  status?: string;
  bookingDate?: string;
  sellerId?: number;
  laptopPhotos?: LaptopPhoto[];
  deleted?: boolean;
  deletedAt?: string | null;
};

export async function getLaptopById(laptopId: number): Promise<LaptopDetail> {
  const res = await client.get<LaptopDetail>('/api/laptops/getById', {
    params: { laptop_id: laptopId },
  });
  const payload = (res.data ?? {}) as Record<string, unknown>;
  const laptopPhotos = extractLaptopPhotos(payload);
  return {
    ...(payload as LaptopDetail),
    laptopPhotos,
  };
}
