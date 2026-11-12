import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../api/products";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-იდან ვკითხულობთ მიმდინარე გვერდსა და კატეგორიას
  const page = Number(searchParams.get("page")) || 1;
  const selectedCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { slug: string; name: string }[]
  >([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 12;

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => console.error("Could not load categories"));
  }, []);

  useEffect(() => {
    setLoading(true);
    const skip = (page - 1) * limit;
    fetchProducts(limit, skip, selectedCategory)
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load products");
        setLoading(false);
      });
  }, [page, selectedCategory]);

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (categorySlug) {
        next.set("category", categorySlug);
      } else {
        next.delete("category");
      }
      next.set("page", "1"); // კატეგორიის შეცვლისას ვბრუნდებით 1-ელ გვერდზე
      return next;
    });
  };

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {products.length} of {total} products
          </p>
        </div>

        {/* კატეგორიების Dropdown */}
        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center my-8">
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* პაგინაციის ღილაკები */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pNum) => (
                  <button
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${
                      page === pNum
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pNum}
                  </button>
                ),
              )}

              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
