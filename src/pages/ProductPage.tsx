import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/products";
import type { Product } from "../types/product";
import { useCart } from "../context/CartContext";
import { discountedPrice, formatPrice } from "../utils/format";

interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProductById(id)
      .then((data) => {
        setProduct(data);
        setSelectedImage(
          data.thumbnail || (data.images && data.images[0]) || "",
        );

        // ლოკალური შეფასებების წამოღება localStorage-იდან
        const localReviews: Record<number, Review[]> = JSON.parse(
          localStorage.getItem("shop_reviews") || "{}",
        );
        const userReviews = localReviews[data.id] || [];

        // API-ის და ლოკალური შეფასებების გაერთიანება (ახალი შეფასებები თავში)
        setReviewsList([...userReviews, ...(data.reviews || [])]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load product details");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 inline-block mb-4">
          {error || "Product not found"}
        </div>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:underline font-medium text-sm"
          >
            ← Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const finalPrice = discountedPrice(product.price, product.discountPercentage);

  return (
    <div className="py-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 hover:underline text-sm font-medium mb-6 inline-block bg-transparent border-0 cursor-pointer p-0"
      >
        ← Back to Catalog
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {/* სურათების გალერეა */}
        <div>
          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-200">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                    selectedImage === img
                      ? "border-indigo-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* პროდუქტის ინფორმაცია */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-2">
              {product.category} {product.brand && `· ${product.brand}`}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-500 text-sm font-semibold">
                ★ {product.rating}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 text-sm">
                {reviewsList.length} reviews
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-slate-900">
                {formatPrice(finalPrice)}
              </span>
              {product.discountPercentage >= 1 && (
                <>
                  <span className="text-slate-400 line-through text-lg">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{Math.round(product.discountPercentage)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="mb-6">
              <span className="text-sm font-medium text-slate-700">
                Availability:{" "}
              </span>
              {product.stock === 0 ? (
                <span className="text-sm font-semibold text-red-600">
                  Out of Stock
                </span>
              ) : product.stock <= 5 ? (
                <span className="text-sm font-semibold text-amber-600">
                  Only {product.stock} left!
                </span>
              ) : (
                <span className="text-sm font-semibold text-emerald-600">
                  In Stock ({product.stock} left)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:bg-slate-300 shadow-sm active:scale-95"
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>

      {/* მომხმარებელთა შეფასებები (Reviews) */}
      {reviewsList.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Customer Reviews ({reviewsList.length})
          </h2>
          <div className="space-y-4">
            {reviewsList.map((rev, idx) => (
              <div
                key={idx}
                className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800">
                    {rev.reviewerName}
                  </span>
                  <span className="text-amber-500 text-xs font-medium">
                    ★ {rev.rating}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-1">{rev.comment}</p>
                <span className="text-slate-400 text-xs">
                  {new Date(rev.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
