import type { Product } from "@/types/product";

export const initialProducts: Product[] = [
  {
    id: "p-001",
    name: "T-shirt Premium",
    price: 5000,
    stock: 25,
    description: "T-shirt 100% coton, coupe moderne. Parfait pour toutes les occasions.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
    createdAt: "2025-04-15",
  },
  {
    id: "p-002",
    name: "Montre Luxe",
    price: 15000,
    stock: 0,
    description: "Montre élégante avec bracelet en cuir véritable.",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&h=200&fit=crop",
    createdAt: "2025-04-10",
  },
  {
    id: "p-003",
    name: "Sac à dos Urbain",
    price: 8500,
    stock: 14,
    description: "Sac résistant, idéal pour le quotidien et les voyages courts.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
    createdAt: "2025-04-12",
  },
  {
    id: "p-004",
    name: "Casque Bluetooth",
    price: 22000,
    stock: 7,
    description: "Casque sans fil avec réduction de bruit active.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    createdAt: "2025-04-18",
  },
  {
    id: "p-005",
    name: "Sneakers Sport",
    price: 12000,
    stock: 0,
    description: "Chaussures légères et confortables pour le sport.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
    createdAt: "2025-04-05",
  },
];
