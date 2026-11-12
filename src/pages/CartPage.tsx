import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { discountedPrice, formatPrice } from "../utils/format";

export const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-slate-500 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => {
            const itemPrice = discountedPrice(
              product.price,
              product.discountPercentage,
            );

            return (
              <div
                key={product.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
              >
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product.id}`}
                    className="font-semibold text-slate-900 hover:text-indigo-600 transition truncate block"
                  >
                    {product.title}
                  </Link>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {formatPrice(itemPrice)}
                  </div>
                  {quantity >= product.stock && (
                    <p className="text-xs text-amber-600 font-semibold mt-1">
                      Max stock reached!
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1 bg-slate-50">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded border text-slate-700 font-bold hover:bg-slate-100 transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded border text-slate-700 font-bold hover:bg-slate-100 transition"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-red-500 hover:text-red-700 p-2 text-sm font-medium transition"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Order Summary
          </h2>
          <div className="flex justify-between text-slate-600 text-sm mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-slate-600 text-sm mb-4">
            <span>Shipping</span>
            <span className="text-emerald-600 font-semibold">Free</span>
          </div>
          <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-slate-900 text-lg mb-6">
            <span>Total</span>
            <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
          </div>

          <Link
            to="/checkout"
            className="block text-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-sm"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};
