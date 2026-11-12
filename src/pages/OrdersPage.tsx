import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

interface OrderItem {
  product: {
    id: number;
    title: string;
    thumbnail: string;
    price: number;
    discountPercentage: number;
  };
  quantity: number;
}

interface Order {
  id: number;
  number: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: string;
}

interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

export const OrdersPage = () => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setTick] = useState(0);

  // შეფასების ფორმის State
  const [activeReviewProductId, setActiveReviewProductId] = useState<
    number | null
  >(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submittedReviews, setSubmittedReviews] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("shop_orders") || "[]");
    setOrders(saved);

    // ⏱️ ავტომატური განახლება ყოველ 3 წამში
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 📍 მონაცემების სრული განულება (Reset Data)
  const handleResetData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all demo data (orders, stock overrides, reviews)?",
      )
    ) {
      localStorage.removeItem("shop_orders");
      localStorage.removeItem("shop_stock_overrides");
      localStorage.removeItem("shop_reviews");
      clearCart();
      setOrders([]);
      setSubmittedReviews({});
      window.location.reload();
    }
  };

  const getOrderStatus = (placedAt: string) => {
    const elapsedSeconds = (Date.now() - new Date(placedAt).getTime()) / 1000;

    if (elapsedSeconds < 10)
      return {
        isDelivered: false,
        text: "Processing ⏳",
        color: "bg-amber-100 text-amber-800",
      };
    if (elapsedSeconds < 25)
      return {
        isDelivered: false,
        text: "Shipped 🚚",
        color: "bg-blue-100 text-blue-800",
      };
    return {
      isDelivered: true,
      text: "Delivered ✅",
      color: "bg-emerald-100 text-emerald-800",
    };
  };

  const handleReviewSubmit = (productId: number) => {
    const newReview: Review = {
      rating,
      comment: comment.trim() || "Great product!",
      date: new Date().toISOString(),
      reviewerName: user.username || "Customer",
    };

    const existingReviews: Record<number, Review[]> = JSON.parse(
      localStorage.getItem("shop_reviews") || "{}",
    );

    const productReviews = existingReviews[productId] || [];
    existingReviews[productId] = [newReview, ...productReviews];

    localStorage.setItem("shop_reviews", JSON.stringify(existingReviews));

    setSubmittedReviews((prev) => ({ ...prev, [productId]: true }));
    setActiveReviewProductId(null);
    setComment("");
    setRating(5);
  };

  return (
    <div className="py-6 max-w-4xl mx-auto">
      {/* პროფილის ბარათი + Reset Demo Data ღილაკი */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            Logged in as:{" "}
            <strong className="text-slate-800">{user.username}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            Reset Demo Data 🔄
          </button>
          <span className="bg-indigo-100 text-indigo-700 font-semibold text-xs px-3 py-1 rounded-full">
            Active Account
          </span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-4">
        My Orders History
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <p className="text-slate-500 mb-4">You have no orders yet.</p>
          <Link to="/" className="text-indigo-600 font-medium hover:underline">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = getOrderStatus(order.placedAt);
            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <span className="font-bold text-slate-900">
                      Order #{order.number}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(order.placedAt).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${status.color}`}
                  >
                    {status.text}
                  </span>
                </div>

                <div className="space-y-4 mb-4">
                  {order.items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="border border-slate-100 p-3 rounded-xl bg-slate-50/50"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-14 h-14 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="flex-1">
                          <Link
                            to={`/products/${product.id}`}
                            className="font-semibold text-slate-800 hover:text-indigo-600 text-sm"
                          >
                            {product.title}
                          </Link>
                          <div className="text-xs text-slate-500">
                            Qty: {quantity}
                          </div>
                        </div>

                        {status.isDelivered && (
                          <div>
                            {submittedReviews[product.id] ? (
                              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                Reviewed ✓
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  setActiveReviewProductId(
                                    activeReviewProductId === product.id
                                      ? null
                                      : product.id,
                                  )
                                }
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg transition"
                              >
                                {activeReviewProductId === product.id
                                  ? "Cancel"
                                  : "Leave Review ★"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {activeReviewProductId === product.id && (
                        <div className="mt-4 pt-3 border-t border-slate-200 bg-white p-4 rounded-xl border">
                          <h4 className="text-xs font-bold text-slate-800 mb-2">
                            Write Review for {product.title}
                          </h4>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-slate-600 font-medium">
                              Rating:
                            </span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-lg transition ${star <= rating ? "text-amber-500" : "text-slate-300"}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your feedback (optional)..."
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                            rows={2}
                          />

                          <button
                            onClick={() => handleReviewSubmit(product.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                          >
                            Submit Review
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-indigo-600 text-base">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
