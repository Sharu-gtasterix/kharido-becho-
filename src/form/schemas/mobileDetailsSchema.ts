// src/form/schemas/mobileDetailsSchema.ts
import { z } from 'zod';
import { Condition } from '../../types/listings';

export const MIN_MOBILE_YEAR = 1990;
export const CURRENT_YEAR = new Date().getFullYear();

const priceValidator = z
  .string()
  .min(1, 'Please enter a valid price')
  .refine((value) => {
    if (!value) return false;
    const price = Number(value);
    return Number.isFinite(price) && price > 0 && price <= 10_000_000;
  }, 'Please enter a valid price between 1 and 10000000');

const conditionSchema = z
  .union([z.literal<Condition>('NEW'), z.literal<Condition>('USED')])
  .nullable()
  .refine((val) => val === 'NEW' || val === 'USED', 'Please select condition');

export const mobileDetailsSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must not exceed 80 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(400, 'Description must not exceed 400 characters'),
  price: priceValidator,
  negotiable: z
    .boolean()
    .nullable()
    .refine((val) => val !== null, 'Please select negotiable option'),
  condition: conditionSchema,
  brand: z.string().min(2, 'Brand name is required'),
  model: z.string().min(1, 'Model name is required'),
  color: z.string().min(2, 'Color is required'),
  yearOfPurchase: z
    .string()
    .min(4, 'Please select year of purchase')
    .refine((value) => {
      const year = Number(value);
      return (
        Number.isFinite(year) &&
        year.toString().length === 4 &&
        year >= MIN_MOBILE_YEAR &&
        year <= CURRENT_YEAR
      );
    }, `Please select a valid year between ${MIN_MOBILE_YEAR} and ${CURRENT_YEAR}`),
});

export type MobileDetailsFormValues = z.infer<typeof mobileDetailsSchema>;

export const getDefaultMobileDetailsValues = (): MobileDetailsFormValues => ({
 title: 'iPhone 13 Pro',
  description: 'Used for 1 year, excellent condition with original accessories.',
  price: 58000,
  negotiable: true,
  condition: 'USED',
  brand: 'Apple',
  model: 'iPhone 13 Pro',
  color: 'Sierra Blue',
  yearOfPurchase: 2022
});
