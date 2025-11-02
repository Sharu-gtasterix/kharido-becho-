// src/api/CarsApi/updateCar.ts
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
 * Uses PATCH method to update partial fields.
 * @param carId - The ID of the car to update
 * @param payload - The fields to update (partial update)
 * @returns UpdateCarResponse with status and message
 */
export async function updateCar(
  carId: number,
  payload: CarUpdateDTO
): Promise<UpdateCarResponse> {
  try {
    console.log('=== UPDATE CAR API REQUEST ===');
    console.log('Car ID:', carId);
    console.log('Endpoint:', `/api/v1/cars/update/${carId}`);
    console.log('Method:', 'PATCH');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // ✅ Using PATCH method (backend requirement)
    const { data } = await client.patch<UpdateCarResponse>(
      `/api/v1/cars/update/${carId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('=== UPDATE CAR API RESPONSE ===');
    console.log('Response Status:', data.status);
    console.log('Response StatusCode:', data.statusCode);
    console.log('Response Message:', data.message);
    console.log('Full Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== UPDATE CAR API ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);

    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response Headers:', error.response.headers);

      // Extract error message from response
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.errorMessage ||
        error.response.data?.error ||
        error.response.statusText ||
        'Failed to update car';

      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Request Error - No response received');
      console.error('Request:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error Details:', error);
      throw error;
    }
  }
}

/**
 * Fetches existing car details by ID for editing.
 * @param carId - The ID of the car to fetch
 * @returns Car object with all details
 */
export async function getCarById(carId: number): Promise<any> {
  try {
    console.log('=== GET CAR BY ID REQUEST ===');
    console.log('Car ID:', carId);
    console.log('Endpoint:', `/api/v1/cars/${carId}`);
    console.log('Method:', 'GET');

    const { data } = await client.get(`/api/v1/cars/${carId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('=== GET CAR BY ID RESPONSE ===');
    console.log('Car ID from response:', data.carId || data.id);
    console.log('Car Title:', data.title);
    console.log('Full Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== GET CAR BY ID ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);

    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));

      // Extract error message from response
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.errorMessage ||
        error.response.data?.error ||
        error.response.statusText ||
        'Failed to fetch car details';

      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Request Error - No response received');
      console.error('Request:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error Details:', error);
      throw error;
    }
  }
}

/**
 * Deletes a car listing by ID (optional - for future use).
 * @param carId - The ID of the car to delete
 * @returns Response with status and message
 */
export async function deleteCar(carId: number): Promise<UpdateCarResponse> {
  try {
    console.log('=== DELETE CAR API REQUEST ===');
    console.log('Car ID:', carId);
    console.log('Endpoint:', `/api/v1/cars/delete/${carId}`);
    console.log('Method:', 'DELETE');

    const { data } = await client.delete<UpdateCarResponse>(
      `/api/v1/cars/delete/${carId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('=== DELETE CAR API RESPONSE ===');
    console.log('Response Status:', data.status);
    console.log('Response Message:', data.message);
    console.log('Full Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== DELETE CAR API ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);

    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));

      const errorMessage =
        error.response.data?.message ||
        error.response.data?.errorMessage ||
        error.response.data?.error ||
        error.response.statusText ||
        'Failed to delete car';

      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Request Error - No response received');
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error Details:', error);
      throw error;
    }
  }
}

/**
 * Lists all cars (optional - for future use).
 * @param page - Page number (default 1)
 * @param limit - Number of cars per page (default 10)
 * @returns List of cars
 */
export async function getAllCars(page: number = 1, limit: number = 10): Promise<any> {
  try {
    console.log('=== GET ALL CARS REQUEST ===');
    console.log('Page:', page);
    console.log('Limit:', limit);

    const { data } = await client.get(`/api/v1/cars`, {
      params: {
        page,
        limit,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('=== GET ALL CARS RESPONSE ===');
    console.log('Total Cars:', data.total || data.length);
    console.log('Full Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('=== GET ALL CARS ERROR ===');
    console.error('Error Message:', error.message);

    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));

      const errorMessage =
        error.response.data?.message ||
        error.response.data?.errorMessage ||
        'Failed to fetch cars';

      throw new Error(errorMessage);
    }
    throw error;
  }
}
