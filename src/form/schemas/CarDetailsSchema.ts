// src/form/schemas/carDetailsSchema.ts
import { z } from 'zod';
import { Condition } from '../../types/listings';

export const MIN_CAR_YEAR = 1990;
export const CURRENT_YEAR = new Date().getFullYear();

const priceValidator = z
  .string()
  .min(1, 'Please enter a valid price')
  .refine((value) => {
    if (!value) return false;
    const price = Number(value);
    return Number.isFinite(price) && price > 0 && price <= 100_000_000;
  }, 'Please enter a valid price between 1 and 100000000');

const kmDrivenValidator = z
  .string()
  .min(1, 'Please enter kilometers driven')
  .refine((value) => {
    if (!value) return false;
    const km = Number(value);
    return Number.isFinite(km) && km >= 0 && km <= 10_000_000;
  }, 'Please enter valid kilometers between 0 and 10000000');

const yearValidator = z
  .string()
  .min(4, 'Please select year of purchase')
  .refine((value) => {
    const year = Number(value);
    return (
      Number.isFinite(year) &&
      year.toString().length === 4 &&
      year >= MIN_CAR_YEAR &&
      year <= CURRENT_YEAR
    );
  }, `Please select a valid year between ${MIN_CAR_YEAR} and ${CURRENT_YEAR}`);

const optionalNumberValidator = z
  .string()
  .optional()
  .refine((value) => {
    if (!value || value.trim() === '') return true;
    const num = Number(value);
    return Number.isFinite(num) && num > 0;
  }, 'Please enter a valid number');

export const carDetailsSchema = z.object({
  // Basic Information - Required
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  brand: z.string().min(2, 'Brand name is required'),
  model: z.string().min(1, 'Model name is required'),
  price: priceValidator,
  kmDriven: kmDrivenValidator,
  yearOfPurchase: yearValidator,

  // Basic Information - Optional
  variant: z.string().optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  // Specifications - Optional
  color: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  numberOfOwners: optionalNumberValidator,
  condition: z.string().optional(),

  // Location - Optional
  address: z.string().max(200, 'Address must not exceed 200 characters').optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || value.trim() === '') return true;
      return /^\d{6}$/.test(value);
    }, 'Pincode must be 6 digits'),

  // Insurance - Optional
  carInsurance: z.boolean(),
  carInsuranceType: z.string().optional(),
  carInsuranceDate: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || value.trim() === '') return true;
      // Validate YYYY-MM-DD format
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }, 'Date must be in YYYY-MM-DD format'),

  // Features - Boolean
  airbag: z.boolean(),
  abs: z.boolean(),
  buttonStart: z.boolean(),
  sunroof: z.boolean(),
  childSafetyLocks: z.boolean(),
  acFeature: z.boolean(),
  musicFeature: z.boolean(),
  powerWindowFeature: z.boolean(),
  rearParkingCameraFeature: z.boolean(),
  negotiable: z.boolean(),
});

export type CarDetailsFormValues = z.infer<typeof carDetailsSchema>;

// ✅ UPDATED: Use UPPERCASE for fuelType and transmission (backend requirement)
export const getDefaultCarDetailsValues = (): CarDetailsFormValues => ({
  // Basic Information
  title: 'Maruti Suzuki Swift VXI',
  brand: 'Maruti Suzuki',
  model: 'Swift',
  variant: 'VXI',
  price: '550000',
  description: 'Well maintained car with full service history. Single owner.',

  // Specifications
  color: 'Pearl Arctic White',
  yearOfPurchase: '2020',
  fuelType: 'PETROL',           // ✅ Changed from 'Petrol' to 'PETROL'
  transmission: 'MANUAL',       // ✅ Changed from 'Manual' to 'MANUAL'
  kmDriven: '35000',
  numberOfOwners: '1',
  condition: 'Excellent',

  // Location
  address: 'Baner Road',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411045',

  // Insurance
  carInsurance: true,
  carInsuranceType: 'Comprehensive',
  carInsuranceDate: '2025-12-31',

  // Features
  airbag: true,
  abs: true,
  buttonStart: true,
  sunroof: false,
  childSafetyLocks: true,
  acFeature: true,
  musicFeature: true,
  powerWindowFeature: true,
  rearParkingCameraFeature: true,
  negotiable: true,
});

// ✅ Enhanced Validation helpers with better error messages
export const validateCarDetails = (values: CarDetailsFormValues) => {
  try {
    carDetailsSchema.parse(values);
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Validation failed' }] };
  }
};

// ✅ Helper function to get valid fuel types
export const VALID_FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];

// ✅ Helper function to get valid transmission types
export const VALID_TRANSMISSION_TYPES = ['MANUAL', 'AUTOMATIC'];

// ✅ Helper to validate fuel type
export const isValidFuelType = (value: string): boolean => {
  return VALID_FUEL_TYPES.includes(value.toUpperCase());
};

// ✅ Helper to validate transmission type
export const isValidTransmissionType = (value: string): boolean => {
  return VALID_TRANSMISSION_TYPES.includes(value.toUpperCase());
};
