export const STORE = {
  name: "somStore",
  tagline: "Somalia's home of genuine electronics",
  description:
    "Shop laptops, smartphones, tablets, components and accessories with fast delivery across Somalia. Pay with EVC Plus, ZAAD, Sahal, eDahab or cash on delivery.",
  phone: "+252 61 000 0000",
  email: "support@somstore.so",
  address: "Maka Al-Mukarama Road, Mogadishu, Somalia",
};

export const CITIES = [
  { name: "Mogadishu", fee: 2 },
  { name: "Hargeisa", fee: 3 },
  { name: "Garowe", fee: 4 },
  { name: "Bosaso", fee: 4 },
  { name: "Kismayo", fee: 4 },
  { name: "Baidoa", fee: 4 },
  { name: "Galkayo", fee: 4 },
  { name: "Beledweyne", fee: 4 },
] as const;

export const FREE_DELIVERY_CITY = "Mogadishu";
export const FREE_DELIVERY_THRESHOLD = 300;

export function deliveryFeeFor(city: string, subtotal: number) {
  if (city === FREE_DELIVERY_CITY && subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return CITIES.find((c) => c.name === city)?.fee ?? 4;
}

export const PAYMENT_METHODS = [
  { id: "EVC_PLUS", name: "EVC Plus", operator: "Hormuud", prefixes: ["61", "77"], color: "#16a34a" },
  { id: "ZAAD", name: "ZAAD", operator: "Telesom", prefixes: ["63"], color: "#2563eb" },
  { id: "SAHAL", name: "Sahal", operator: "Golis", prefixes: ["90"], color: "#ea580c" },
  { id: "EDAHAB", name: "eDahab", operator: "Somtel", prefixes: ["62", "65", "66"], color: "#ca8a04" },
  { id: "CASH_ON_DELIVERY", name: "Cash on Delivery", operator: "Pay when you receive", prefixes: [], color: "#64748b" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];
