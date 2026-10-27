import { useEffect, useState } from "react";
import { LuChefHat } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";
import { register, clearError, clearMessage } from "../stores/slices/AuthSlice";
import { Link, useNavigate } from "react-router-dom";

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
  const { loading, error, message } = useSelector((state: RootState) => state.auth);

  const [inputData, setInputData] = useState<SignUpType>({
    userName: "",
    userEmail: "",
    userPassword: "",
    kitchenName: "",
    phoneNumber: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

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

    try {
      await dispatch(register(inputData)).unwrap();
      navigate("/signin");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center py-10 px-4">
      <div className="flex items-center flex-col bg-white px-8 md:px-10 py-8 w-full max-w-[530px] rounded-2xl shadow-xl">
        <div className="text-4xl bg-green-100 rounded-full text-green-600 p-3 mb-3">
          <LuChefHat />
        </div>

        <h2 className="text-3xl font-bold text-amber-950">Join CookTrack</h2>
        <p className="opacity-80 text-sm pb-4 text-center">
          Create your account to start managing your kitchen inventory efficiently
        </p>

        <div className="w-full">
          <form className="space-y-3.5" onSubmit={handleForm}>
            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm text-gray-700" htmlFor="userName">Full Name</label>
              <input
                id="userName"
                type="text"
                required
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                placeholder="Enter your name"
                name="userName"
                value={inputData.userName}
                onChange={handleInputData}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm text-gray-700" htmlFor="userEmail">Email Address</label>
              <input
                id="userEmail"
                type="email"
                required
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                placeholder="Enter your email"
                name="userEmail"
                value={inputData.userEmail}
                onChange={handleInputData}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm text-gray-700" htmlFor="userPassword">Password (8-20 characters)</label>
              <input
                id="userPassword"
                type="password"
                required
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                placeholder="Create a password"
                name="userPassword"
                value={inputData.userPassword}
                onChange={handleInputData}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                placeholder="Re-enter your password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setLocalError(null);
                }}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm text-gray-700" htmlFor="kitchenName">Kitchen Name</label>
              <input
                id="kitchenName"
                type="text"
                required
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                placeholder="e.g. My Home, Smith Family Kitchen"
                name="kitchenName"
                value={inputData.kitchenName}
                onChange={handleInputData}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm text-gray-700" htmlFor="phoneNumber">Phone Number (optional)</label>
              <input
                id="phoneNumber"
                type="text"
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                placeholder="Enter your phone number"
                name="phoneNumber"
                value={inputData.phoneNumber}
                onChange={handleInputData}
              />
            </div>

            {/* Feedback */}
            {localError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{localError}</p>}
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
            {message && <p className="text-green-600 text-sm bg-green-50 p-2 rounded">{message}</p>}

            <div>
              <button
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 font-medium text-center w-full transition cursor-pointer disabled:opacity-50 mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account & Kitchen"}
              </button>
            </div>
          </form>

          <div className="text-center pt-4 text-sm">
            <span className="opacity-70">Already have an account? </span>
            <Link to="/signin" className="font-bold text-green-600 hover:underline">Sign In</Link>
          </div>

          <div className="text-center pt-2 text-sm">
            <span className="opacity-70">Joining someone else's kitchen? </span>
            <Link to="/registertokitchen" className="font-bold text-amber-700 hover:underline">Join with Invite Code</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;