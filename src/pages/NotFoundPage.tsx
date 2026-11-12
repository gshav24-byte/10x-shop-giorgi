import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="py-20 text-center max-w-md mx-auto">
      <h1 className="text-7xl font-extrabold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm"
      >
        Go Back Home
      </Link>
    </div>
  );
};
