import type { Product, ProductsResponse } from "../types/product";

// დამხმარე ფუნქცია ლოკალურად შეცვლილი მარაგების გასაახლებლად
function applyStockOverrides(products: Product[]): Product[] {
  const overrides: Record<number, number> = JSON.parse(
    localStorage.getItem("shop_stock_overrides") || "{}",
  );

  return products.map((product) => {
    if (overrides[product.id] !== undefined) {
      return { ...product, stock: overrides[product.id] };
    }
    return product;
  });
}

export async function fetchAllProducts(): Promise<Product[]> {
  const response = await fetch("https://dummyjson.com/products?limit=0");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data: ProductsResponse = await response.json();
  return applyStockOverrides(data.products);
}

export async function fetchProducts(
  limit = 12,
  skip = 0,
  category = "",
): Promise<ProductsResponse> {
  const url = category
    ? `https://dummyjson.com/products/category/${category}?limit=${limit}&skip=${skip}`
    : `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data: ProductsResponse = await response.json();

  return {
    ...data,
    products: applyStockOverrides(data.products),
  };
}

export async function fetchCategories(): Promise<
  { slug: string; name: string }[]
> {
  const response = await fetch("https://dummyjson.com/products/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = await response.json();
  return data.map((cat: unknown) =>
    typeof cat === "string"
      ? { slug: cat, name: cat }
      : {
          slug: (cat as { slug: string }).slug,
          name: (cat as { name: string }).name,
        },
  );
}

export async function fetchProductById(id: string | number): Promise<Product> {
  const response = await fetch(`https://dummyjson.com/products/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }
  const product: Product = await response.json();
  const overrides: Record<number, number> = JSON.parse(
    localStorage.getItem("shop_stock_overrides") || "{}",
  );

  if (overrides[product.id] !== undefined) {
    return { ...product, stock: overrides[product.id] };
  }
  return product;
}
