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
  availabilityStatus?: string;
}

export type ValidationErrors = {
  [K in keyof EditState]?: string;
};

export const COL_WIDTHS: Record<ColumnKey, string> = {
  title: "min-w-[280px] flex-1",
  price: "w-32 flex-shrink-0",
  discountPercentage: "w-28 flex-shrink-0",
  rating: "w-24 flex-shrink-0",
  stock: "w-24 flex-shrink-0",
  availabilityStatus: "w-32 flex-shrink-0",
  brand: "w-28 flex-shrink-0",
  category: "w-28 flex-shrink-0",
};

export const COLUMN_MIN_WIDTHS: Record<ColumnKey, number> = {
  title: 280,
  price: 128,
  discountPercentage: 112,
  rating: 96,
  stock: 96,
  availabilityStatus: 128,
  brand: 112,
  category: 112,
};

export const getTableMinWidth = (visibleColumns: ColumnKey[]) => {
  let width = 44 + 72; // checkbox (44) + actions (72)
  visibleColumns.forEach((col) => {
    width += COLUMN_MIN_WIDTHS[col] || 0;
  });
  return width;
};