// src/app/core/interfaces/harvest.interface.ts

export interface Harvest {
  idHarvest?: number;
  idSeller: number;
  fruitName: string;
  harvestDate?: string;
  qty1ra: number;
  qty3ra: number;
  qty5ta: number;
  qtyMadura: number;
  qtyTotal?: number;
  weight1ra: number;
  weight3ra: number;
  weight5ta: number;
  weightMadura: number;
  weightTotal?: number;
  state?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HarvestRequest {
  idSeller: number;
  fruitName: string;
  qty1ra: number;
  qty3ra: number;
  qty5ta: number;
  qtyMadura: number;
  weight1ra: number;
  weight3ra: number;
  weight5ta: number;
  weightMadura: number;
}