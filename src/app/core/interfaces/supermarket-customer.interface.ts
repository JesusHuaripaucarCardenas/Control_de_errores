export interface SupermarketCustomer {
  idCustomer?: number;
  ruc: string;
  supermarketName: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  state?: string;
  createdAt?: Date;
  updatedAt?: Date;
}