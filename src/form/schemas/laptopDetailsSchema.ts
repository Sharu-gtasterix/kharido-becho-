// src/form/schemas/laptopDetailsSchema.ts
import { z } from 'zod';

const numericString = z
  .string()
  .min(1, 'Please enter a valid numeric value')
  .refine((value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed);
  }, 'Please enter a valid numeric value');

const optionalString = z.string().max(200, 'Value is too long').optional();

export const laptopDetailsSchema = z.object({
  serialNumber: z.string().min(1, 'Please enter Serial Number'),
  dealer: optionalString,
  brand: z.string().min(1, 'Please enter Brand'),
  model: z.string().min(1, 'Please enter Model'),
  price: numericString,
  warrantyInYear: z.number().int().min(0).max(10),
  processor: optionalString,
  processorBrand: optionalString,
  ram: optionalString,
  storage: optionalString,
  colour: optionalString,
  screenSize: optionalString,
  memoryType: optionalString,
  battery: optionalString,
  batteryLife: optionalString,
  graphicsCard: optionalString,
  graphicBrand: optionalString,
  weight: optionalString,
  manufacturer: optionalString,
  usbPorts: z
    .string()
    .optional()
    .refine((value) => {
      if (value == null || value.trim().length === 0) return true;
      return /^\d+$/.test(value.trim());
    }, 'Please enter a numeric value'),
});

export type LaptopDetailsFormValues = z.infer<typeof laptopDetailsSchema>;

export const getDefaultLaptopDetailsValues = (): LaptopDetailsFormValues => ({
  serialNumber: 'CFG-HP-15S-FQ5009TU',
  dealer: 'AK Laptops',
  brand: 'HP',
  model: 'HP 15s-fq5009TU',
  price: '58999',
  warrantyInYear: 1,
  processor: 'Intel Core i5-1335U',
  processorBrand: 'Intel',
  ram: '16 GB',
  storage: '512 GB SSD',
  colour: 'Silver',
  screenSize: '15.6 inch',
  memoryType: 'DDR4',
  battery: '3-cell, 41 Wh Li-ion',
  batteryLife: 'Up to 8 hours',
  graphicsCard: 'Intel Iris Xe Graphics',
  graphicBrand: 'Intel',
  weight: '1.59 kg',
  manufacturer: 'HP India Pvt Ltd',
  usbPorts: '3',
});
