
import type { CategoryFilter } from "../components/CategoryBeans";
import type { Product } from "../interfaces";

export function filterProducts(
  products: Product[],
  filterText: string,
  minPrice: number | "",
  maxPrice: number | "",
  category: CategoryFilter
): Product[] {
  const q = filterText.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  const min = minPrice === "" ? -Infinity : Number(minPrice);
  const max = maxPrice === "" ? Infinity : Number(maxPrice);

  return products.filter((p) => {
    if (category !== "all" && p.category.toLowerCase() !== category) {
      return false;
    }
    const inPrice = p.price >= min && p.price <= max;
    if (!inPrice) return false;
    if (!tokens.length) return true;

    const haystack = [p.name, p.description, p.category, ...p.tags]
      .join(" ")
      .toLowerCase();

    return tokens.some((t) => haystack.includes(t));
  });
}

