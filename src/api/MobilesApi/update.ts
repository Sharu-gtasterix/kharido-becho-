import api from '../client';

export type UpdateMobileDTO = {
  title?: string;
  description?: string;
  price?: number;
  negotiable?: boolean;
  condition?: 'NEW' | 'USED' | string;
  brand?: string;
  model?: string;
  color?: string;
  yearOfPurchase?: number;
  images?: string[];      // keep if you allow updating images
  status?: 'ACTIVE' | 'DRAFT' | 'SOLD' | string;
  sellerId?: number;
};

export async function updateMobile(mobileId: number, payload: UpdateMobileDTO) {
  const { data } = await api.patch(`/api/v1/mobiles/update/${mobileId}`, payload);
  return data; // returns the updated mobile (as per your sample response)
}
