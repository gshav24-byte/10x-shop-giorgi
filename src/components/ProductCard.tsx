import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { useCart } from "../context/CartContext";
import { discountedPrice, formatPrice } from "../utils/format";

interface ProductCardProps {
  product: Product;
  isBestseller?: boolean;
  soldCount?: number;
}

export const ProductCard = ({
  product,
  isBestseller = false,
  soldCount,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 1));
    const idx = Math.floor((relX / rect.width) * images.length);
    setActiveImgIdx(idx);
  };

  const finalPrice = discountedPrice(product.price, product.discountPercentage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden group">
      <Link to={`/products/${product.id}`} className="block relative">
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveImgIdx(0)}
          className="aspect-square bg-slate-100 overflow-hidden relative"
        >
          <img
            src={images[activeImgIdx] || product.thumbnail}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* ზედა მარცხენა ბეჯები: ფასდაკლება და Bestseller */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.discountPercentage >= 1 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                -{Math.round(product.discountPercentage)}%
              </span>
            )}
            {isBestseller && (
              <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                🔥 Bestseller
              </span>
            )}
          </div>

          {/* მარაგის სტატუსის ბეჯი */}
          {product.stock === 0 ? (
            <span className="absolute top-2.5 right-2.5 bg-slate-900/85 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
              Out of stock
            </span>
          ) : (
            product.stock <= 5 && (
              <span className="absolute top-2.5 right-2.5 bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                Only {product.stock} left
              </span>
            )
          )}

          {/* AliExpress-ის სტილის წერტილების ინდიკატორი */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/30 backdrop-blur-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeImgIdx ? "w-3 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-1">
            <span className="truncate">{product.category}</span>
            <span className="text-amber-500 font-bold ml-2">
              ★ {product.rating.toFixed(1)}
            </span>
          </div>

          <Link
            to={`/products/${product.id}`}
            className="font-semibold text-slate-900 hover:text-indigo-600 transition line-clamp-1 text-sm mb-1"
            title={product.title}
          >
            {product.title}
          </Link>

          {soldCount !== undefined && (
            <div className="text-[11px] text-slate-400 mb-2">
              {soldCount}+ sold
            </div>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(finalPrice)}
            </span>
            {product.discountPercentage >= 1 && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};
