// src/api/CarsApi/getCarsList.ts
import client from '../client';

export type Car = {
  carId?: number;
  id?: number;
  title: string;
  brand: string;
  model: string;
  price: number;
  kmDriven: number;
  yearOfPurchase: number;
  variant?: string;
  description?: string;
  color?: string;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  airbag?: boolean;
  abs?: boolean;
  buttonStart?: boolean;
  sunroof?: boolean;
  childSafetyLocks?: boolean;
  acFeature?: boolean;
  musicFeature?: boolean;
  powerWindowFeature?: boolean;
  rearParkingCameraFeature?: boolean;
  carInsurance?: boolean;
  negotiable?: boolean;
  sellerId?: number;
  createdDate?: string;
  updatedDate?: string;
  [k: string]: any;
};

export type GetCarsResponse = {
  status?: string;
  message?: string;
  data?: Car[];
  cars?: Car[];
  content?: Car[];
  statusCode?: number;
  total?: number;
  [k: string]: any;
};

/**
 * Fetches all cars with pagination and filters.
 * GET /api/v1/cars
 * @param page - Page number (default 0)
 * @param limit - Number of cars per page (default 10)
 * @param search - Search term (optional)
 * @param city - Filter by city (optional)
 * @param brand - Filter by brand (optional)
 */
export async function getAllCars(
  page: number = 0,
  limit: number = 10,
  search?: string,
  city?: string,
  brand?: string
): Promise<GetCarsResponse> {
  try {
    console.log('=== GET ALL CARS REQUEST ===');
    console.log('Page:', page);
    console.log('Limit:', limit);
    console.log('Search:', search);
    console.log('City:', city);
    console.log('Brand:', brand);

    const params: any = {
      page,
      limit,
    };

    if (search) params.search = search;
    if (city) params.city = city;
    if (brand) params.brand = brand;

    const { data } = await client.get<GetCarsResponse>('/api/v1/cars', {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('=== GET ALL CARS RESPONSE ===');
    console.log('Total cars:', data.total || data.data?.length || 0);
    console.log('Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== GET ALL CARS ERROR ===');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));

      const errorMessage =
        error.response.data?.message ||
        error.response.data?.errorMessage ||
        'Failed to fetch cars list';

      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Request Error:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
}

/**
 * Fetches cars by seller ID.
 * GET /api/v1/cars/seller/{sellerId}
 * @param sellerId - The ID of the seller
 * @param page - Page number (default 0)
 * @param limit - Number of cars per page (default 10)
 */
export async function getCarsBySellerId(
  sellerId: number,
  page: number = 0,
  limit: number = 10
): Promise<GetCarsResponse> {
  try {
    console.log('=== GET CARS BY SELLER ID REQUEST ===');
    console.log('Seller ID:', sellerId);
    console.log('Page:', page);
    console.log('Limit:', limit);

    const { data } = await client.get<GetCarsResponse>(
      `/api/v1/cars/seller/${sellerId}`,
      {
        params: {
          page,
          limit,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('=== GET CARS BY SELLER ID RESPONSE ===');
    console.log('Total cars:', data.total || data.data?.length || 0);
    console.log('Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== GET CARS BY SELLER ID ERROR ===');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));

      const errorMessage =
        error.response.data?.message ||
        error.response.data?.errorMessage ||
        'Failed to fetch seller cars';

      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Request Error:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
}

/**
 * Searches cars by criteria.
 * GET /api/v1/cars/search
 * @param searchTerm - Search term
 * @param filters - Additional filters
 */
export async function searchCars(
  searchTerm: string,
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    city?: string;
  }
): Promise<GetCarsResponse> {
  try {
    console.log('=== SEARCH CARS REQUEST ===');
    console.log('Search term:', searchTerm);
    console.log('Filters:', filters);

    const params: any = {
      q: searchTerm,
    };

    if (filters) {
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minYear) params.minYear = filters.minYear;
      if (filters.maxYear) params.maxYear = filters.maxYear;
      if (filters.fuelType) params.fuelType = filters.fuelType;
      if (filters.transmission) params.transmission = filters.transmission;
      if (filters.city) params.city = filters.city;
    }

    const { data } = await client.get<GetCarsResponse>('/api/v1/cars/search', {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('=== SEARCH CARS RESPONSE ===');
    console.log('Found cars:', data.data?.length || 0);
    console.log('Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== SEARCH CARS ERROR ===');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));

      const errorMessage =
        error.response.data?.message ||
        error.response.data?.errorMessage ||
        'Search failed';

      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Request Error:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
}
