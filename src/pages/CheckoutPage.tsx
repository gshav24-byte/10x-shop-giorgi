import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (items.length === 0 && !isSubmitted) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          No items to checkout
        </h2>
        <p className="text-slate-500 mb-6">
          Please add some products to your cart first.
        </p>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition inline-block shadow-sm"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP Code is required";
    return newErrors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // 1. მარაგების ჩამოჭრა localStorage-ში
    const currentOverrides: Record<number, number> = JSON.parse(
      localStorage.getItem("shop_stock_overrides") || "{}"
    );

    items.forEach(({ product, quantity }) => {
      const currentStock =
        currentOverrides[product.id] !== undefined
          ? currentOverrides[product.id]
          : product.stock;
      const newStock = Math.max(0, currentStock - quantity);
      currentOverrides[product.id] = newStock;
    });

    localStorage.setItem("shop_stock_overrides", JSON.stringify(currentOverrides));
    // 2. შეკვეთის შენახვა localStorage-ში
    const newOrder = {
  id: Date.now(),
  number: `10X-${Math.floor(10000 + Math.random() * 90000)}`,
  items: [...items],
  totalPrice,
  shipping: { ...formData },
  placedAt: new Date().toISOString(),
};

const savedOrders = JSON.parse(localStorage.getItem("shop_orders") || "[]");
localStorage.setItem("shop_orders", JSON.stringify([newOrder, ...savedOrders]));

    clearCart();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center my-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Order Confirmed!
        </h2>
        <p className="text-slate-600 mb-6">
          Thank you,{" "}
          <strong className="text-slate-900">{formData.fullName}</strong>! Your
          order has been placed successfully.
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-sm"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Shipping Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.fullName ? "border-red-500" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Apt 4B"
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.address ? "border-red-500" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Tbilisi"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.city ? "border-red-500" : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="0101"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.zipCode ? "border-red-500" : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.zipCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-sm"
            >
              Place Order (${totalPrice.toFixed(2)})
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Summary</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="truncate max-w-[160px] text-slate-700 font-medium">
                  {quantity}x {product.title}
                </span>
                <span className="font-semibold text-slate-900">
                  $
                  {(
                    product.price *
                    (1 - product.discountPercentage / 100) *
                    quantity
                  ).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-between text-lg font-bold text-slate-900">
            <span>Total Pay</span>
            <span className="text-indigo-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
