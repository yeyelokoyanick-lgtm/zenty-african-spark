export type OrderStatus = "Attente" | "Expédiée" | "Nouvelle";

export interface RecentOrder {
  id: string;
  customer: string;
  city: string;
  amount: number;
  status: OrderStatus;
}

export const recentOrders: RecentOrder[] = [
  { id: "CMD-1042", customer: "Awa Diop", city: "Cotonou", amount: 12500, status: "Nouvelle" },
  { id: "CMD-1041", customer: "Kofi Mensah", city: "Lomé", amount: 8400, status: "Attente" },
  { id: "CMD-1040", customer: "Adjoa Boateng", city: "Abidjan", amount: 24900, status: "Expédiée" },
  { id: "CMD-1039", customer: "Ibrahim Diallo", city: "Cotonou", amount: 5600, status: "Nouvelle" },
  { id: "CMD-1038", customer: "Fatou Ndiaye", city: "Lomé", amount: 17200, status: "Expédiée" },
];

export const salesWeek = [
  { label: "Lun", value: 14000 },
  { label: "Mar", value: 18500 },
  { label: "Mer", value: 16200 },
  { label: "Jeu", value: 22400 },
  { label: "Ven", value: 28100 },
  { label: "Sam", value: 31500 },
  { label: "Dim", value: 25300 },
];

export const salesMonth = [
  { label: "S1", value: 92000 },
  { label: "S2", value: 118500 },
  { label: "S3", value: 134200 },
  { label: "S4", value: 156800 },
];

export const stats = [
  { label: "Revenus", value: "842 500 FCFA", trend: "+12%", icon: "sales" as const },
  { label: "Commandes", value: "47", trend: "+8", icon: "orders" as const },
  { label: "Produits", value: "12", trend: "+2", icon: "products" as const },
  { label: "Visiteurs", value: "1 204", trend: "+18%", icon: "visitors" as const },
];

export function formatFCFA(value: number): string {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}
