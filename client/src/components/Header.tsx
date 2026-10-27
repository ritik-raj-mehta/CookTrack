import { FaArrowRightLong } from "react-icons/fa6";
import { LuChefHat } from "react-icons/lu";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState, persistor } from "../stores/store";
import { logout } from "../stores/slices/AuthSlice";

const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, kitchenId } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      await persistor.purge();
      navigate("/");
    } catch {
      await persistor.purge();
      navigate("/");
    }
  };

  return (
    <header className="py-4 sm:py-5 flex justify-between items-center animate-fadeIn gap-2">
      <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group cursor-pointer min-w-0">
        <div className="bg-gradient-to-tr from-green-600 to-emerald-400 rounded-2xl text-white p-2 sm:p-2.5 text-xl sm:text-2xl shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0">
          <LuChefHat />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xl sm:text-2xl font-bold font-serif text-gray-900 tracking-tight flex items-center">
            CookTrack
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
          </span>
          <span className="text-[9px] sm:text-[10px] text-gray-400 font-semibold tracking-wider uppercase -mt-0.5 sm:-mt-1">
            Smart Inventory
          </span>
        </div>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {kitchenId && (
            <NavLink
              to="/dashboard"
              className="bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm hover:bg-emerald-100 transition shadow-xs hover-lift"
            >
              Dashboard
            </NavLink>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 text-xs sm:text-sm transition cursor-pointer hover-lift shadow-xs"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/signin"
            className="font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 py-2 sm:py-2.5 px-3 sm:px-5 rounded-xl font-bold text-white text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover-lift group"
          >
            <span>Get Started</span>
            <FaArrowRightLong className="hidden sm:inline-block group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;