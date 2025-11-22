import { SupermarketCustomer } from './supermarket-customer.interface';
import { MarketCustomer } from './market-customer.interface';

export interface Contact {
  id?: number;
  type: 'supermercado' | 'mercado';
  name: string;
  city: string;
  district: string;
  deleted: boolean;
  // Supermercado
  ruc?: string;
  phone?: string;
  email?: string;
  // Mercado
  marketName?: string;
  stall?: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
}