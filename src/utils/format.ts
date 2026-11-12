export function discountedPrice(price: number, discountPercentage: number): number {
  if (!discountPercentage || discountPercentage <= 0) return price;
  return price * (1 - discountPercentage / 100);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}