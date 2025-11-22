export interface Seller {
  idSeller?: number;
  firstName: string;
  lastName: string;
  dni: string;
  email?: string;
  phone?: string;
  state?: string;
  createdAt?: Date;
  updatedAt?: Date;
}