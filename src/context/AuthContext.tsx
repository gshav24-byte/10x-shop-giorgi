import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  username: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: User;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem("shop_user");
    return saved ? JSON.parse(saved) : { username: "", isLoggedIn: false };
  });

  const login = (username: string) => {
    const newUser = { username, isLoggedIn: true };
    setUser(newUser);
    localStorage.setItem("shop_user", JSON.stringify(newUser));
  };

  const logout = () => {
    // 🛑 ლოგაუთისას იშლება ავტორიზაცია და ყველა ლოკალური დემო მონაცემი
    localStorage.removeItem("shop_user");
    localStorage.removeItem("shop_cart");
    localStorage.removeItem("shop_orders");
    localStorage.removeItem("shop_stock_overrides");
    localStorage.removeItem("shop_reviews");

    setUser({ username: "", isLoggedIn: false });

    // 🔄 საწყის მდგომარეობაზე დაბრუნება და მთავარ გვერდზე გადამისამართება
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
