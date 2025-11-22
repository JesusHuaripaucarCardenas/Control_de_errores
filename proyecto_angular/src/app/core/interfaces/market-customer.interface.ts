export interface MarketCustomer {
  idCustomer?: number;
  nombre: string;
  apellido: string;
  documentNumber: string;
  marketName: string;
  positionNumber: string;
  city: string;
  district: string;
  phone: string;
  state?: string;
  createdAt?: Date;
  updatedAt?: Date;
}