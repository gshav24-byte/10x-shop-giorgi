import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validateNameOrEmail = (val: string) => {
    const isEmail = /\S+@\S+\.\S+/.test(val);
    const isValidName = /^[a-zA-Zა-ჰ\s]{2,30}$/.test(val.trim());
    return isEmail || isValidName;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = "Username or Email is required";
    } else if (!validateNameOrEmail(username)) {
      newErrors.username =
        "Please enter a valid name (letters only) or email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    login(username.trim());
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Link
        to="/"
        className="text-sm font-medium text-indigo-600 hover:underline mb-6 inline-block"
      >
        ← Back to catalog
      </Link>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          Log In
        </h1>
        <p className="text-xs text-slate-500 text-center mb-6">
          Enter valid Name or Email and password (min 6 chars)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setUsername(e.target.value);
                if (errors.username)
                  setErrors((prev) => ({ ...prev, username: "" }));
              }}
              placeholder="e.g. Giorgi Beridze or giorgi@example.com"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.username ? "border-red-500" : "border-slate-300"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="••••••••"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.password ? "border-red-500" : "border-slate-300"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-sm mt-2"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};
