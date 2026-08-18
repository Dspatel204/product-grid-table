export type ViewMode = "table" | "grid";

export type ColumnKey = "title" | "price" | "discountPercentage" | "rating" | "stock" | "availabilityStatus" | "brand" | "category";

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  category: string;
  brand?: string;
  thumbnail?: string;
  images?: string[];
  availabilityStatus?: string;
  tags?: string[];
  sku?: string;
  weight?: number;
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
  brand?: string;
  discountPercentage?: number;
}

export type ValidationErrors = {
  [K in keyof EditState]?: string;
};