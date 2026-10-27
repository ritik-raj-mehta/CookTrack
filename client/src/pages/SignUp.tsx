import { useEffect, useState } from "react";
import { LuChefHat } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";
import { register, clearError, clearMessage } from "../stores/slices/AuthSlice";
import { Link, Navigate, useNavigate } from "react-router-dom";

import OtpVerificationModal from "../components/OtpVerificationModal";

export type SignUpType = {
  userName: string;
  userEmail: string;
  userPassword: string;
  kitchenName: string;
  phoneNumber: string;
};

const SignUp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, message, isAuthenticated, kitchenId } = useSelector(
    (state: RootState) => state.auth
  );

  if (isAuthenticated && kitchenId) {
    return <Navigate to="/dashboard" replace />;
  }

  const [inputData, setInputData] = useState<SignUpType>({
    userName: "",
    userEmail: "",
    userPassword: "",
    kitchenName: "",
    phoneNumber: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  const handleInputData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError(null);
    if (error) dispatch(clearError());
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (inputData.userPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (inputData.userPassword.length < 8 || inputData.userPassword.length > 20) {
      setLocalError("Password must be between 8 and 20 characters.");
      return;
    }

    if (!inputData.phoneNumber.trim()) {
      setLocalError("Mobile number is required.");
      return;
    }

    try {
      const res = await dispatch(register(inputData)).unwrap();
      if (res?.requiresOtp) {
        setShowOtpModal(true);
        if (res.previewUrl) setPreviewUrl(res.previewUrl);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-amber-50/30 flex justify-center items-center py-12 px-4 relative overflow-hidden">
      {/* Soft ambient decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none"></div>

      {showOtpModal && (
        <OtpVerificationModal
          email={inputData.userEmail.trim()}
          previewUrl={previewUrl}
          onBack={() => setShowOtpModal(false)}
        />
      )}

      <div className="relative flex items-center flex-col bg-white p-8 sm:p-10 w-full max-w-xl rounded-3xl shadow-xl border border-gray-100 animate-fadeIn">
        <Link
          to="/"
          className="text-3xl bg-gradient-to-tr from-emerald-600 to-green-500 rounded-2xl text-white p-3 mb-4 shadow-md hover:scale-105 transition-transform duration-300"
        >
          <LuChefHat />
        </Link>

        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 pb-1 text-center">
          Join CookTrack
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm pb-6 text-center">
          Create your account and set up a smart inventory for your kitchen
        </p>

        {/* Feedback alerts */}
        {localError && (
          <div className="w-full text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 p-3 rounded-xl mb-4 text-center animate-fadeIn">
            {localError}
          </div>
        )}
        {error && (
          <div className="w-full text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 p-3 rounded-xl mb-4 text-center animate-fadeIn">
            {error}
          </div>
        )}
        {message && (
          <div className="w-full text-emerald-800 text-xs sm:text-sm bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-4 text-center animate-fadeIn">
            {message}
          </div>
        )}

        <div className="w-full">
          <form className="space-y-4" onSubmit={handleForm}>
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="font-semibold text-xs uppercase tracking-wider text-gray-700" htmlFor="userName">
                  Full Name
                </label>
                <input
                  id="userName"
                  type="text"
                  required
                  className="bg-gray-50/80 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                  placeholder="e.g. John Doe"
                  name="userName"
                  value={inputData.userName}
                  onChange={handleInputData}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="font-semibold text-xs uppercase tracking-wider text-gray-700" htmlFor="userEmail">
                  Email Address
                </label>
                <input
                  id="userEmail"
                  type="email"
                  required
                  className="bg-gray-50/80 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                  placeholder="name@example.com"
                  name="userEmail"
                  value={inputData.userEmail}
                  onChange={handleInputData}
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="font-semibold text-xs uppercase tracking-wider text-gray-700" htmlFor="userPassword">
                  Password (8-20 chars)
                </label>
                <input
                  id="userPassword"
                  type="password"
                  required
                  className="bg-gray-50/80 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                  placeholder="Create password"
                  name="userPassword"
                  value={inputData.userPassword}
                  onChange={handleInputData}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="font-semibold text-xs uppercase tracking-wider text-gray-700" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="bg-gray-50/80 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                  placeholder="Repeat password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setLocalError(null);
                  }}
                />
              </div>
            </div>

            {/* Kitchen Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="font-semibold text-xs uppercase tracking-wider text-gray-700" htmlFor="kitchenName">
                  Kitchen Name
                </label>
                <input
                  id="kitchenName"
                  type="text"
                  required
                  className="bg-gray-50/80 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                  placeholder="e.g. My Home Kitchen"
                  name="kitchenName"
                  value={inputData.kitchenName}
                  onChange={handleInputData}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1" htmlFor="phoneNumber">
                  <span>Mobile Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  className="bg-gray-50/80 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                  placeholder="e.g. 9876543210"
                  name="phoneNumber"
                  value={inputData.phoneNumber}
                  onChange={handleInputData}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl py-3 font-bold text-sm text-center w-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 hover-lift"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account & Kitchen"}
              </button>
            </div>
          </form>

          <div className="text-center pt-5 text-xs text-gray-500 border-t border-gray-100 mt-6 space-y-2">
            <div>
              <span>Already have an account? </span>
              <Link to="/signin" className="font-bold text-emerald-600 hover:text-emerald-700">
                Sign In
              </Link>
            </div>
            <div>
              <span>Joining someone else's kitchen? </span>
              <Link to="/registertokitchen" className="font-bold text-amber-700 hover:text-amber-800">
                Join with Invite Code
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;