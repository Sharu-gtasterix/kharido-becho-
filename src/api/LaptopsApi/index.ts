export { addLaptop } from './addLaptop';
export type { AddLaptopDTO, AddLaptopResponse } from './addLaptop';

export { getLaptopConfirmDetailsCombined } from './confirmDetails';
export type { LaptopConfirmDetailsDTO } from './confirmDetails';

export { deleteLaptop } from './deleteLaptop';

export { getAllLaptops } from './getAll';
export type { LaptopItem, LaptopStatus } from './getAll';
export type { LaptopPhoto as LaptopListPhoto } from './getAll';

export { getLaptopById } from './getById';
export type { LaptopDetail, LaptopPhoto } from './getById';

export { updateLaptop } from './update';

export { uploadLaptopImages } from './uploadImages';
export type { RNFile, UploadLaptopImagesResponse, UploadProgress } from './uploadImages';
