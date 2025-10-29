// src/api/LaptopsApi/updateLaptop.ts
import client from '../client';

export async function updateLaptop(laptopId: number, data: any) {
  const res = await client.patch('/api/laptops/update', data, {
    params: { laptopId },
  });
  return res.data;
}
