// src/mappers/listingMappers.ts
import { MobileDetailsFormValues } from '../form/schemas/mobileDetailsSchema';
import { LaptopDetailsFormValues } from '../form/schemas/laptopDetailsSchema';
import { CarDetailsFormValues } from '../form/schemas/carDetailsSchema';
import { Condition, ListingStatus } from '../types/listings';

export interface MobileCreateDTO {
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: Condition;
  brand: string;
  model: string;
  color: string;
  yearOfPurchase: number;
  sellerId: number;
}

export interface LaptopCreateDTO {
  serialNumber: string;
  dealer?: string;
  brand: string;
  model: string;
  price: number;
  warrantyInYear: number;
  processor?: string;
  processorBrand?: string;
  memoryType?: string;
  screenSize?: string;
  colour?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  batteryLife?: string;
  graphicsCard?: string;
  graphicBrand?: string;
  weight?: string;
  manufacturer?: string;
  usbPorts?: number;
  status: ListingStatus;
  sellerId: number;
}

// ✅ Car DTO Interfaces - status removed from CarCreateDTO
export interface CarCreateDTO {
  title: string;
  brand: string;
  model: string;
  variant?: string;
  price: number;
  description?: string;
  color?: string;
  yearOfPurchase: number;
  fuelType?: string;
  transmission?: string;
  kmDriven: number;
  numberOfOwners?: number;
  condition?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  carInsurance?: boolean;
  carInsuranceType?: string;
  carInsuranceDate?: string;
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
  sellerId: number;
}

export interface CarUpdateDTO {
  title?: string;
  brand?: string;
  model?: string;
  variant?: string;
  price?: number;
  description?: string;
  color?: string;
  yearOfPurchase?: number;
  fuelType?: string;
  transmission?: string;
  kmDriven?: number;
  numberOfOwners?: number;
  condition?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  carInsurance?: boolean;
  carInsuranceType?: string;
  carInsuranceDate?: string;
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
  sellerId?: number;
}

export interface CarDetailsFormValues {
  title: string;
  brand: string;
  model: string;
  variant: string;
  price: string;
  description: string;
  color: string;
  yearOfPurchase: string;
  fuelType: string;
  transmission: string;
  kmDriven: string;
  numberOfOwners: string;
  condition: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  carInsurance: boolean;
  carInsuranceType: string;
  carInsuranceDate: string;
  airbag: boolean;
  abs: boolean;
  buttonStart: boolean;
  sunroof: boolean;
  childSafetyLocks: boolean;
  acFeature: boolean;
  musicFeature: boolean;
  powerWindowFeature: boolean;
  rearParkingCameraFeature: boolean;
  negotiable: boolean;
}

const trimOrUndefined = (value?: string | null) => {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const toMobileCreateDTO = (
  values: MobileDetailsFormValues,
  sellerId: number,
): MobileCreateDTO => {
  const price = Number(values.price);
  const year = Number(values.yearOfPurchase);

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    price: Number.isFinite(price) ? price : 0,
    negotiable: values.negotiable === true,
    condition: values.condition as Condition,
    brand: values.brand.trim(),
    model: values.model.trim(),
    color: values.color.trim(),
    yearOfPurchase: Number.isFinite(year) ? year : new Date().getFullYear(),
    sellerId,
  };
};

export const toLaptopCreateDTO = (
  values: LaptopDetailsFormValues,
  sellerId: number,
): LaptopCreateDTO => {
  const price = Number(values.price);
  const warranty = Number(values.warrantyInYear);
  const usbPortsValue =
    values.usbPorts !== undefined && values.usbPorts !== null && `${values.usbPorts}`.trim().length > 0
      ? Number(values.usbPorts)
      : undefined;

  return {
    serialNumber: values.serialNumber.trim(),
    dealer: trimOrUndefined(values.dealer),
    model: values.model.trim(),
    brand: values.brand.trim(),
    price: Number.isFinite(price) ? price : 0,
    warrantyInYear: Number.isFinite(warranty) ? warranty : 0,
    processor: trimOrUndefined(values.processor),
    processorBrand: trimOrUndefined(values.processorBrand),
    memoryType: trimOrUndefined(values.memoryType),
    screenSize: trimOrUndefined(values.screenSize),
    colour: trimOrUndefined(values.colour),
    ram: trimOrUndefined(values.ram),
    storage: trimOrUndefined(values.storage),
    battery: trimOrUndefined(values.battery),
    batteryLife: trimOrUndefined(values.batteryLife),
    graphicsCard: trimOrUndefined(values.graphicsCard),
    graphicBrand: trimOrUndefined(values.graphicBrand),
    weight: trimOrUndefined(values.weight),
    manufacturer: trimOrUndefined(values.manufacturer),
    usbPorts: Number.isFinite(usbPortsValue ?? NaN) ? usbPortsValue : undefined,
    status: 'ACTIVE',
    sellerId,
  };
};

// ✅ Car Mapper Functions - status removed
export const toCarCreateDTO = (
  values: CarDetailsFormValues,
  sellerId: number,
): CarCreateDTO => {
  const price = Number(values.price);
  const kmDriven = Number(values.kmDriven);
  const year = Number(values.yearOfPurchase);
  const numberOfOwners = values.numberOfOwners ? Number(values.numberOfOwners) : undefined;

  return {
    title: values.title.trim(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    price: Number.isFinite(price) ? price : 0,
    kmDriven: Number.isFinite(kmDriven) ? kmDriven : 0,
    yearOfPurchase: Number.isFinite(year) ? year : new Date().getFullYear(),
    variant: trimOrUndefined(values.variant),
    description: trimOrUndefined(values.description),
    color: trimOrUndefined(values.color),
    fuelType: trimOrUndefined(values.fuelType),
    transmission: trimOrUndefined(values.transmission),
    condition: trimOrUndefined(values.condition),
    address: trimOrUndefined(values.address),
    city: trimOrUndefined(values.city),
    state: trimOrUndefined(values.state),
    pincode: trimOrUndefined(values.pincode),
    carInsuranceType: trimOrUndefined(values.carInsuranceType),
    carInsuranceDate: trimOrUndefined(values.carInsuranceDate),
    numberOfOwners: Number.isFinite(numberOfOwners ?? NaN) ? numberOfOwners : undefined,
    airbag: values.airbag === true,
    abs: values.abs === true,
    buttonStart: values.buttonStart === true,
    sunroof: values.sunroof === true,
    childSafetyLocks: values.childSafetyLocks === true,
    acFeature: values.acFeature === true,
    musicFeature: values.musicFeature === true,
    powerWindowFeature: values.powerWindowFeature === true,
    rearParkingCameraFeature: values.rearParkingCameraFeature === true,
    carInsurance: values.carInsurance === true,
    negotiable: values.negotiable === true,
    sellerId,
  };
};

export const toCarUpdateDTO = (
  values: CarDetailsFormValues,
  sellerId?: number,
): CarUpdateDTO => {
  const price = Number(values.price);
  const kmDriven = Number(values.kmDriven);
  const year = Number(values.yearOfPurchase);
  const numberOfOwners = values.numberOfOwners ? Number(values.numberOfOwners) : undefined;

  return {
    title: values.title.trim(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    price: Number.isFinite(price) ? price : undefined,
    kmDriven: Number.isFinite(kmDriven) ? kmDriven : undefined,
    yearOfPurchase: Number.isFinite(year) ? year : undefined,
    variant: trimOrUndefined(values.variant),
    description: trimOrUndefined(values.description),
    color: trimOrUndefined(values.color),
    fuelType: trimOrUndefined(values.fuelType),
    transmission: trimOrUndefined(values.transmission),
    condition: trimOrUndefined(values.condition),
    address: trimOrUndefined(values.address),
    city: trimOrUndefined(values.city),
    state: trimOrUndefined(values.state),
    pincode: trimOrUndefined(values.pincode),
    carInsuranceType: trimOrUndefined(values.carInsuranceType),
    carInsuranceDate: trimOrUndefined(values.carInsuranceDate),
    numberOfOwners: Number.isFinite(numberOfOwners ?? NaN) ? numberOfOwners : undefined,
    airbag: values.airbag,
    abs: values.abs,
    buttonStart: values.buttonStart,
    sunroof: values.sunroof,
    childSafetyLocks: values.childSafetyLocks,
    acFeature: values.acFeature,
    musicFeature: values.musicFeature,
    powerWindowFeature: values.powerWindowFeature,
    rearParkingCameraFeature: values.rearParkingCameraFeature,
    carInsurance: values.carInsurance,
    negotiable: values.negotiable,
    sellerId: sellerId,
  };
};
