import { useEffect, useState } from "react";
import { LuChefHat } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../stores/store";
import { login, clearError, clearMessage } from "../stores/slices/AuthSlice";
import ThemeToggle from "../components/ThemeToggle";

export type FormDataType = {
  userEmail: string;
  userPassword: string;
};

const SignIn = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, error, message } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState<FormDataType>({
    userEmail: "",
    userPassword: "",
  });

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) dispatch(clearError());
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen justify-center items-center bg-gradient-to-br from-slate-50 via-emerald-50/40 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12 relative overflow-hidden transition-colors duration-250">
      {/* Soft ambient decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-300/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top right Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative p-8 sm:p-10 flex items-center flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 max-w-md w-full animate-fadeIn transition-colors">
        <Link to="/" className="text-3xl bg-gradient-to-tr from-emerald-600 to-green-500 rounded-2xl text-white p-3 mb-4 shadow-md hover:scale-105 transition-transform duration-300">
          <LuChefHat />
        </Link>

        <h2 className="font-bold text-2xl font-serif text-gray-900 dark:text-white pb-1 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm text-center pb-6">
          Sign in to your CookTrack account to manage your kitchen inventory
        </p>

        {error && (
          <div className="w-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4 text-center animate-fadeIn">
            {error}
          </div>
        )}

        {!error && message && message !== "Login successful" && (
          <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-sm p-3 rounded-xl mb-4 text-center animate-fadeIn">
            {message}
          </div>
        )}

        <div className="w-full">
          <form className="space-y-4" onSubmit={handleForm}>
            <div className="flex flex-col space-y-1.5">
              <label className="font-semibold text-xs uppercase tracking-wider text-gray-700 dark:text-slate-300" htmlFor="userEmail">
                Email Address
              </label>
              <input
                id="userEmail"
                name="userEmail"
                type="email"
                required
                value={formData.userEmail}
                onChange={handleInput}
                className="bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition"
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-semibold text-xs uppercase tracking-wider text-gray-700 dark:text-slate-300" htmlFor="userPassword">
                Password
              </label>
              <input
                id="userPassword"
                name="userPassword"
                type="password"
                required
                value={formData.userPassword}
                onChange={handleInput}
                className="bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl py-3 font-bold text-sm text-center w-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2 hover-lift"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In to Account"}
            </button>
          </form>

          <div className="text-center pt-5 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 mt-6 space-y-2">
            <div>
              <span>Don't have an account? </span>
              <Link to="/signup" className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Sign up
              </Link>
            </div>
            <div>
              <span>Have a kitchen invite code? </span>
              <Link to="/registertokitchen" className="font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300">
                Join Kitchen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
