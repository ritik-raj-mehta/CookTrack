import { FaArrowRightLong } from "react-icons/fa6";
import Header from "../components/Header";
import kitchenhero from "../assets/kitchen-hero.jpg";
import { FiCodesandbox } from "react-icons/fi";
import { FaRegClock } from "react-icons/fa";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";

const Home = () => {
  const { isAuthenticated, kitchenId } = useSelector((state: RootState) => state.auth);
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-16">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center pt-6 lg:pt-14">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-emerald-100/70 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Smart Kitchen & Pantry Assistant
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                Your Kitchen,{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                  Organized
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-gray-600 max-w-xl font-normal leading-relaxed pt-1 sm:pt-2">
                Never run out of ingredients again. Track pantry supplies in real-time,
                plan shopping with automated lists, and prevent food waste with smart expiry reminders.
              </p>
            </div>

            {/* Metrics Highlight Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 grid grid-cols-3 gap-1 sm:gap-4 hover-lift w-full">
              <div className="text-center border-r border-gray-100 last:border-0 pr-1 sm:pr-2">
                <p className="text-lg sm:text-3xl font-extrabold text-emerald-600">40%</p>
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium mt-0.5">Less Waste</p>
              </div>

              <div className="text-center border-r border-gray-100 last:border-0 px-1 sm:px-2">
                <p className="text-lg sm:text-3xl font-extrabold text-emerald-600">2.5x</p>
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium mt-0.5">Planning</p>
              </div>

              <div className="text-center pl-1 sm:pl-2">
                <p className="text-lg sm:text-3xl font-extrabold text-emerald-600">15m</p>
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium mt-0.5">Weekly Save</p>
              </div>
            </div>

            {/* CTA Buttons */}
            {isAuthenticated && kitchenId ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white font-bold py-3.5 px-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover-lift group w-full sm:w-auto"
                >
                  <span>Go to Kitchen Hub</span>
                  <FaArrowRightLong className="group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
                <Link
                  to="/kitchenitems"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 active:scale-95 border border-emerald-300/80 text-emerald-900 font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 hover-lift w-full sm:w-auto"
                >
                  View Pantry
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white font-bold py-3.5 px-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover-lift group w-full sm:w-auto"
                >
                  <span>Create a Kitchen</span>
                  <FaArrowRightLong className="group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
                <Link
                  to="/registertokitchen"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-amber-50 active:scale-95 border border-amber-300/80 text-amber-900 font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 hover-lift w-full sm:w-auto"
                >
                  Join Existing Kitchen
                </Link>
              </div>
            )}

            {/* Feature Badges */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 sm:gap-6 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left min-w-0">
                <div className="bg-emerald-100 text-emerald-700 text-sm sm:text-base p-2 rounded-xl shrink-0">
                  <FiCodesandbox />
                </div>
                <span className="text-[11px] sm:text-sm font-semibold text-gray-700 truncate w-full">Smart Tracking</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left min-w-0">
                <div className="bg-orange-100 text-orange-600 text-sm sm:text-base p-2 rounded-xl shrink-0">
                  <FaRegClock />
                </div>
                <span className="text-[11px] sm:text-sm font-semibold text-gray-700 truncate w-full">Expiry Alerts</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left min-w-0">
                <div className="bg-blue-100 text-blue-600 text-sm sm:text-base p-2 rounded-xl shrink-0">
                  <MdOutlineFamilyRestroom />
                </div>
                <span className="text-[11px] sm:text-sm font-semibold text-gray-700 truncate w-full">Family Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Animated Badges */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft decorative glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-green-300 rounded-3xl blur-2xl opacity-30"></div>

              {/* Main Visual Image */}
              <div
                className="relative rounded-3xl shadow-2xl h-[280px] sm:h-[400px] lg:h-[480px] w-full overflow-hidden border-4 border-white"
                style={{
                  backgroundImage: `url(${kitchenhero})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Floating Badge 1: Total items */}
                <div className="absolute right-2 sm:right-5 top-2 sm:top-5 bg-white/95 backdrop-blur-md p-2 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-lg border border-white/60 flex items-center gap-1.5 sm:gap-3 animate-float max-w-[48%] sm:max-w-none">
                  <div className="bg-gradient-to-tr from-emerald-600 to-green-500 text-sm sm:text-xl p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-white shadow-xs shrink-0">
                    <FiCodesandbox />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs sm:text-sm leading-tight truncate">140+ Items</p>
                    <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium truncate block">In Pantry Stock</span>
                  </div>
                </div>

                {/* Floating Badge 2: Expiring Soon */}
                <div className="absolute left-2 sm:left-5 bottom-2 sm:bottom-5 bg-white/95 backdrop-blur-md p-2 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-lg border border-white/60 flex items-center gap-1.5 sm:gap-3 animate-float [animation-delay:2s] max-w-[48%] sm:max-w-none">
                  <div className="bg-gradient-to-tr from-orange-500 to-amber-400 text-sm sm:text-xl p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-white shadow-xs shrink-0">
                    <FaRegClock />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs sm:text-sm leading-tight truncate">Fresh Alerts</p>
                    <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium truncate block">Zero Waste</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;