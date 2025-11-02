import client from '../client';

export type AddCarDTO = {
  // Basic Information
  title: string;
  brand: string;
  model: string;
  variant?: string;
  price: number;
  description?: string;

  // Specifications
  color?: string;
  yearOfPurchase: number;
  fuelType?: string;
  transmission?: string;
  kmDriven: number;
  numberOfOwners?: number;
  condition?: string;

  // Location
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // Insurance
  carInsurance?: boolean;
  carInsuranceType?: string;
  carInsuranceDate?: string;

  // Features (Boolean fields)
  airbag?: boolean;
  abs?: boolean;
  buttonStart?: boolean;
  sunroof?: boolean;
  childSafetyLocks?: boolean;
  acFeature?: boolean;
  musicFeature?: boolean;
  powerWindowFeature?: boolean;
  rearParkingCameraFeature?: boolean;
  negotiable?: boolean;

  /** Required */
  sellerId: number;
};

export type AddCarResponse = {
  status?: string;
  message?: string;
  code?: string;
  statusCode?: number;
  timeStamp?: string;
  apiPath?: string;
  imageUrl?: string | null;
  carId?: number;
  [k: string]: any;
};

/**
 * Creates a new car listing.
 */
export async function addCar(payload: AddCarDTO): Promise<AddCarResponse> {
  const { data } = await client.post<AddCarResponse>('/api/v1/cars/add', payload, {
    headers: {
      'Content-Type': 'application/json',
      'x-skip-authorization': 'true', // ✅ Add this line to bypass auth
    },
  });
  return data;
}