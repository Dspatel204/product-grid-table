export interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  rating: number;
  category: string;
  brand?: string;
}

export interface ApiResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface EditState {
  title?: string;
  category?: string;
  price?: number;
  stock?: number;
  rating?: number;
}

export type ValidationErrors = {
  [K in keyof EditState]?: string;
};