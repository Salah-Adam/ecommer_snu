const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(value: number | string | { toString(): string }) {
  return usd.format(Number(value));
}

export function discountPercent(price: number, compare?: number | null) {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}
