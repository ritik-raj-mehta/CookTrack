import { useEffect, useState } from "react";
import { LuChefHat } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../stores/store";
import { login, clearError, clearMessage } from "../stores/slices/AuthSlice";

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
    <div className="flex min-h-screen justify-center items-center bg-gradient-to-b from-green-600 to-orange-500 px-4 py-8">
      <div className="p-8 md:p-10 flex items-center flex-col bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-4xl bg-green-100 rounded-full text-green-600 p-3 mb-3">
          <LuChefHat />
        </div>

        <p className="font-bold opacity-80 text-2xl pb-1 text-amber-950">Welcome Back</p>
        <span className="opacity-70 text-sm text-center pb-5">
          Sign in to your CookTrack account to manage your kitchen inventory
        </span>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {!error && message && message !== "Login successful" && (
          <div className="w-full bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4 text-center">
            {message}
          </div>
        )}

        <div className="w-full">
          <form className="space-y-4" onSubmit={handleForm}>
            <div className="flex flex-col space-y-1.5">
              <label className="font-medium text-sm text-gray-700" htmlFor="userEmail">Email</label>
              <input
                id="userEmail"
                name="userEmail"
                type="email"
                required
                value={formData.userEmail}
                onChange={handleInput}
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-medium text-sm text-gray-700" htmlFor="userPassword">Password</label>
              <input
                id="userPassword"
                name="userPassword"
                type="password"
                required
                value={formData.userPassword}
                onChange={handleInput}
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 text-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 font-medium text-center w-full transition cursor-pointer disabled:opacity-50 mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center pt-4 text-sm">
            <span className="opacity-70">Don't have an account? </span>
            <Link to="/signup" className="font-bold text-green-600 hover:underline">Sign up</Link>
          </div>

          <div className="text-center pt-2 text-sm">
            <span className="opacity-70">Have a kitchen invite code? </span>
            <Link to="/registertokitchen" className="font-bold text-amber-700 hover:underline">Join Kitchen</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;