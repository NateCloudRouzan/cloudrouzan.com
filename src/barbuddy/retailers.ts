export const retailers = [
  "Total Wine",
  "BevMo",
  "Instacart",
  "Amazon",
] as const;
export type Retailer = (typeof retailers)[number];
export type RetailerCheck = {
  status: "available" | "unavailable";
  checkedAt: string;
};
export function retailerURL(
  name: string,
  retailer: Retailer = "Total Wine",
): string {
  const term = encodeURIComponent(name.trim());
  switch (retailer) {
    case "Total Wine":
      return `https://www.totalwine.com/search/all?text=${term}`;
    case "BevMo":
      return `https://bevmo.com/search?q=${term}`;
    case "Instacart":
      return `https://www.instacart.com/store/s?k=${term}`;
    case "Amazon":
      return `https://www.amazon.com/s?k=${term}`;
    default:
      throw new Error("Unsupported retailer");
  }
}
