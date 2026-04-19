export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  createdAt: string;
}

export type ProductFilter = "all" | "active" | "out";
export type ProductSort = "recent" | "price-asc" | "price-desc";
