import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { useCart } from "../context/CartContext";
import { discountedPrice, formatPrice } from "../utils/format";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const finalPrice = discountedPrice(product.price, product.discountPercentage);
  const imagesList =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  // მაუსის მოძრაობაზე სურათის ინდექსის გამოთვლა
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imagesList.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const index = Math.floor((x / width) * imagesList.length);
    const clampedIndex = Math.min(Math.max(index, 0), imagesList.length - 1);
    setCurrentImageIndex(clampedIndex);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0); // მაუსის გაყვანისას ბრუნდება პირველ სურათზე
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between transition group">
      <div>
        {/* სურათის ჩარჩო მაუსის მოძრაობის დეტექტორით */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
        >
          <img
            src={imagesList[currentImageIndex]}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
          />

          {/* ფასდაკლების ბეჯი */}
          {product.discountPercentage >= 1 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}

          {/* მაუსის გადატარებისას წერტილები (Dots Indicator) */}
          {isHovered && imagesList.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2 z-10">
              {imagesList.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    currentImageIndex === idx
                      ? "w-4 bg-indigo-600"
                      : "w-1.5 bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            {product.category} {product.brand && `· ${product.brand}`}
          </div>
          <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition">
            {product.title}
          </h3>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(finalPrice)}
            </span>
            {product.discountPercentage >= 1 && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-amber-500 font-medium">
              ★ {product.rating}
            </span>
            {product.stock === 0 ? (
              <span className="text-red-600 font-semibold">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-600 font-semibold">
                Only {product.stock} left!
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">In stock</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 flex gap-2">
        <Link
          to={`/products/${product.id}`}
          className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg transition"
        >
          Details
        </Link>
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:bg-slate-300 active:scale-95"
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};
