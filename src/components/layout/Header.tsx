import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-black tracking-wider text-indigo-400"
        >
          10X Shop
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? "text-indigo-400" : "text-slate-300 hover:text-white"}`
            }
          >
            Catalog
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `text-sm font-medium transition relative flex items-center gap-1 ${
                isActive ? "text-indigo-400" : "text-slate-300 hover:text-white"
              }`
            }
          >
            Cart
            {totalItems > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1 animate-pulse">
                {totalItems}
              </span>
            )}
          </NavLink>

          {user.isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link
                to="/orders"
                className="text-sm text-slate-300 hover:text-indigo-400 transition"
              >
                Hi,{" "}
                <strong className="text-white underline underline-offset-4">
                  {user.username}
                </strong>
              </Link>
              <button
                onClick={logout}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition shadow-sm"
            >
              Log In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
