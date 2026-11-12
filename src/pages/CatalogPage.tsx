import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAllProducts, fetchCategories } from "../api/products";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";
import { PriceRangeSlider } from "../components/PriceRangeSlider";
import { discountedPrice } from "../utils/format";

const ITEMS_PER_PAGE = 12;

type SortOption =
  | "default"
  | "bestsellers"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

interface StoredOrder {
  items: { product: { id: number }; quantity: number }[];
}

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { slug: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL პარამეტრების წაკითხვა
  const query = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "";
  const sortBy = (searchParams.get("sort") as SortOption) || "default";
  const inStockOnly = searchParams.get("inStock") === "1";
  const bestsellersOnly = searchParams.get("bestsellers") === "1";
  const urlMinPrice = searchParams.get("minPrice");
  const urlMaxPrice = searchParams.get("maxPrice");
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAllProducts(), fetchCategories()])
      .then(([productsData, categoriesData]) => {
        setAllProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load catalog");
        setLoading(false);
      });
  }, []);

  // გაყიდვების რეიტინგის გამოთვლა (API შეფასებები + საიტზე რეალურად შეძენილი რაოდენობა)
  const salesMap = useMemo(() => {
    const savedOrders: StoredOrder[] = JSON.parse(
      localStorage.getItem("shop_orders") || "[]",
    );
    const userPurchasedQty: Record<number, number> = {};

    savedOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const pid = item.product.id;
        userPurchasedQty[pid] = (userPurchasedQty[pid] || 0) + item.quantity;
      });
    });

    const scores: Record<number, number> = {};
    allProducts.forEach((p) => {
      const baseSales =
        (p.reviews?.length || 1) * 18 + Math.round(p.rating * 12);
      scores[p.id] = baseSales + (userPurchasedQty[p.id] || 0) * 10;
    });
    return scores;
  }, [allProducts]);

  // ტოპ 25% პროდუქტი მოინიშნება Bestseller-ად
  const bestsellerIds = useMemo(() => {
    if (allProducts.length === 0) return new Set<number>();
    const sortedBySales = [...allProducts].sort(
      (a, b) => (salesMap[b.id] || 0) - (salesMap[a.id] || 0),
    );
    const topCount = Math.max(1, Math.ceil(sortedBySales.length * 0.25));
    return new Set(sortedBySales.slice(0, topCount).map((p) => p.id));
  }, [allProducts, salesMap]);

  // არჩეული კატეგორიის მიხედვით მინიმალური და მაქსიმალური ფასების საზღვრები
  const { boundsMin, boundsMax } = useMemo(() => {
    const categoryScope = selectedCategory
      ? allProducts.filter((p) => p.category === selectedCategory)
      : allProducts;

    if (categoryScope.length === 0) {
      return { boundsMin: 0, boundsMax: 1000 };
    }

    let min = Infinity;
    let max = -Infinity;
    categoryScope.forEach((p) => {
      const price = discountedPrice(p.price, p.discountPercentage);
      if (price < min) min = price;
      if (price > max) max = price;
    });

    return {
      boundsMin: Math.floor(min),
      boundsMax: Math.ceil(max),
    };
  }, [allProducts, selectedCategory]);

  const activeMinPrice =
    urlMinPrice !== null
      ? Math.max(boundsMin, Math.min(Number(urlMinPrice), boundsMax))
      : boundsMin;

  const activeMaxPrice =
    urlMaxPrice !== null
      ? Math.min(boundsMax, Math.max(Number(urlMaxPrice), boundsMin))
      : boundsMax;

  // URL პარამეტრების განახლების დამხმარე ფუნქცია
  const updateParams = (
    updates: Record<string, string | null>,
    resetPage = true,
  ) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    if (resetPage) {
      next.delete("page");
    }
    setSearchParams(next);
  };

  // ძიების Debounce URL-ში
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== query) {
        updateParams({ q: searchInput.trim() || null }, true);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // ფილტრაცია და სორტირება
  const filteredAndSortedProducts = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    const filtered = allProducts.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory)
        return false;
      if (inStockOnly && product.stock <= 0) return false;
      if (bestsellersOnly && !bestsellerIds.has(product.id)) return false;

      const finalPrice = discountedPrice(
        product.price,
        product.discountPercentage,
      );
      if (finalPrice < activeMinPrice || finalPrice > activeMaxPrice)
        return false;

      if (normalizedQuery) {
        const matchesTitle = product.title
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesBrand = product.brand
          ?.toLowerCase()
          .includes(normalizedQuery);
        const matchesCat = product.category
          .toLowerCase()
          .includes(normalizedQuery);
        if (!matchesTitle && !matchesBrand && !matchesCat) return false;
      }

      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case "bestsellers":
        sorted.sort((a, b) => (salesMap[b.id] || 0) - (salesMap[a.id] || 0));
        break;
      case "price-asc":
        sorted.sort(
          (a, b) =>
            discountedPrice(a.price, a.discountPercentage) -
            discountedPrice(b.price, b.discountPercentage),
        );
        break;
      case "price-desc":
        sorted.sort(
          (a, b) =>
            discountedPrice(b.price, b.discountPercentage) -
            discountedPrice(a.price, a.discountPercentage),
        );
        break;
      case "name-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return sorted;
  }, [
    allProducts,
    selectedCategory,
    inStockOnly,
    bestsellersOnly,
    bestsellerIds,
    activeMinPrice,
    activeMaxPrice,
    query,
    sortBy,
    salesMap,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, safePage]);

  const hasActiveFilters =
    Boolean(query) ||
    Boolean(selectedCategory) ||
    sortBy !== "default" ||
    inStockOnly ||
    bestsellersOnly ||
    urlMinPrice !== null ||
    urlMaxPrice !== null;

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 font-medium">Loading catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 inline-block">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* ზედა პანელი: ძიება და სორტირება */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* ძიების ველი */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products by name, brand, or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
          </div>

          {/* სორტირების მენიუ */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-select"
              className="text-xs font-semibold text-slate-500 whitespace-nowrap"
            >
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) =>
                updateParams({
                  sort: e.target.value === "default" ? null : e.target.value,
                })
              }
              className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">Featured (Default)</option>
              <option value="bestsellers">🔥 Most Sold / Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical: A → Z</option>
              <option value="name-desc">Alphabetical: Z → A</option>
            </select>
          </div>
        </div>
      </div>

      {/* მთავარი სექცია: მარცხენა ფილტრების პანელი + მარჯვენა პროდუქტების ბადე */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* ფილტრების Sidebar */}
        <aside className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* ორმხრივი საფასო სლაიდერი */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Price Range
            </h3>
            <PriceRangeSlider
              min={boundsMin}
              max={boundsMax}
              valueMin={activeMinPrice}
              valueMax={activeMaxPrice}
              onChange={(newMin, newMax) =>
                updateParams({
                  minPrice: newMin <= boundsMin ? null : String(newMin),
                  maxPrice: newMax >= boundsMax ? null : String(newMax),
                })
              }
            />
          </div>

          {/* სწრაფი ფილტრები: Bestsellers & In Stock */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Quick Filters
            </h3>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bestsellersOnly}
                onChange={(e) =>
                  updateParams({ bestsellers: e.target.checked ? "1" : null })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">
                🔥 Bestsellers Only
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) =>
                  updateParams({ inStock: e.target.checked ? "1" : null })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">
                In Stock Only
              </span>
            </label>
          </div>

          {/* კატეგორიები */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Categories
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              <button
                onClick={() =>
                  updateParams({
                    category: null,
                    minPrice: null,
                    maxPrice: null,
                  })
                }
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === ""
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() =>
                    updateParams({
                      category: cat.slug,
                      minPrice: null,
                      maxPrice: null,
                    })
                  }
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* პროდუქტების სია */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <strong className="text-slate-800">
                {filteredAndSortedProducts.length}
              </strong>{" "}
              products
            </p>
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No products found
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Try adjusting your price range, search query, or selected
                filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isBestseller={bestsellerIds.has(product.id)}
                    soldCount={salesMap[product.id]}
                  />
                ))}
              </div>

              {/* პაგინაცია */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                  <button
                    onClick={() =>
                      updateParams({ page: String(safePage - 1) }, false)
                    }
                    disabled={safePage === 1}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - safePage) <= 1,
                    )
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <span key={page} className="flex items-center gap-2">
                          {showEllipsis && (
                            <span className="text-slate-400 text-xs">...</span>
                          )}
                          <button
                            onClick={() =>
                              updateParams({ page: String(page) }, false)
                            }
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                              safePage === page
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        </span>
                      );
                    })}

                  <button
                    onClick={() =>
                      updateParams({ page: String(safePage + 1) }, false)
                    }
                    disabled={safePage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
