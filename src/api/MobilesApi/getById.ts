// src/api/mobiles/productdetails.ts
import client from '../client';

export type MobileDetail = {
  mobileId: number;
  title: string;
  description?: string;
  price: number;
  negotiable?: boolean;
  condition?: string;
  brand?: string;
  model?: string;
  color?: string;
  yearOfPurchase?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string | null;
  sellerId?: number;
  images?: string[];
};

export async function getMobileById(mobileId: number) {
  const res = await client.get<MobileDetail>(`/api/v1/mobiles/${mobileId}`);
  return res.data;
}
