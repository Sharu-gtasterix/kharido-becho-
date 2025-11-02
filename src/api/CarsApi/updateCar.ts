import client from '../client';
import { CarUpdateDTO } from '../../mappers/listingMappers';

export type UpdateCarResponse = {
  status?: string;
  message?: string;
  code?: string;
  statusCode?: number;
  timeStamp?: string;
  apiPath?: string;
  carId?: number;
  [k: string]: any;
};

/**
 * Updates an existing car listing by ID.
 * @param carId - The ID of the car to update
 * @param payload - The fields to update (partial update supported)
 */
export async function updateCar(
  carId: number,
  payload: CarUpdateDTO
): Promise<UpdateCarResponse> {
  try {
    console.log('=== UPDATE CAR API REQUEST ===');
    console.log('Car ID:', carId);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const { data } = await client.put<UpdateCarResponse>(
      `/api/v1/cars/update/${carId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('=== UPDATE CAR API RESPONSE ===');
    console.log('Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== UPDATE CAR API ERROR ===');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response Headers:', error.response.headers);
      throw new Error(
        error.response.data?.message ||
          error.response.data?.errorMessage ||
          'Failed to update car'
      );
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
 * Fetches existing car details by ID for editing.
 * @param carId - The ID of the car to fetch
 */
export async function getCarById(carId: number): Promise<any> {
  try {
    console.log('=== GET CAR BY ID REQUEST ===');
    console.log('Car ID:', carId);

    const { data } = await client.get(`/api/v1/cars/${carId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('=== GET CAR BY ID RESPONSE ===');
    console.log('Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== GET CAR BY ID ERROR ===');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      throw new Error(
        error.response.data?.message ||
          error.response.data?.errorMessage ||
          'Failed to fetch car details'
      );
    } else if (error.request) {
      console.error('Request Error:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
}
