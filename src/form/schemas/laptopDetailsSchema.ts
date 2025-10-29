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
  serialNumber: '',
  dealer: '',
  brand: '',
  model: '',
  price: '',
  warrantyInYear: 1,
  processor: '',
  processorBrand: '',
  ram: '',
  storage: '',
  colour: '',
  screenSize: '',
  memoryType: '',
  battery: '',
  batteryLife: '',
  graphicsCard: '',
  graphicBrand: '',
  weight: '',
  manufacturer: '',
  usbPorts: '',
});
