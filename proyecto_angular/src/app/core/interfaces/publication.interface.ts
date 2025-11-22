// core/interfaces/publication.interface.ts
export interface ProductPublication {
  idPublication?: number;
  idSeller: number;
  idCategory: number;
  idHarvest: number;
  productName: string;
  emoji?: string;
  publicationDate?: string;
  state?: string;
  createdAt?: string;
}

export interface PublicationDetail {
  idPubDetail?: number;
  idPublication: number;
  selectionType: string;
  quantity: number;
  totalWeight: number;
  avgWeightPerBox: number;
  pricePerKg: number;
  state?: string;
  createdAt?: string;
}

export interface PublicationRequest {
  publication: {
    idSeller: number;
    idCategory: number;
    idHarvest: number;
    productName: string;
    emoji: string;
  };
  details: Array<{
    selectionType: string;
    quantity: number;
    totalWeight: number;
    avgWeightPerBox: number;
    pricePerKg: number;
  }>;
}