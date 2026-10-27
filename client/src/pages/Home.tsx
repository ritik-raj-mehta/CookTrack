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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-8 lg:pt-14">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-emerald-100/70 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Smart Kitchen & Pantry Assistant
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                Your Kitchen,{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                  Organized
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-xl font-normal leading-relaxed pt-2">
                Never run out of ingredients again. Track pantry supplies in real-time,
                plan shopping with automated lists, and prevent food waste with smart expiry reminders.
              </p>
            </div>

            {/* Metrics Highlight Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-3 gap-4 hover-lift">
              <div className="text-center border-r border-gray-100 last:border-0 pr-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">40%</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Less Waste</p>
              </div>

              <div className="text-center border-r border-gray-100 last:border-0 px-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">2.5x</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Planning</p>
              </div>

              <div className="text-center pl-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">15m</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Weekly Save</p>
              </div>
            </div>

            {/* CTA Buttons */}
            {isAuthenticated && kitchenId ? (
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3.5 px-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover-lift group"
                >
                  <span>Go to Dashboard</span>
                  <FaArrowRightLong className="group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
                <Link
                  to="/kitchenitems"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 border border-emerald-300/80 text-emerald-900 font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 hover-lift"
                >
                  View Pantry Inventory
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3.5 px-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover-lift group"
                >
                  <span>Create a Kitchen</span>
                  <FaArrowRightLong className="group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
                <Link
                  to="/registertokitchen"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-amber-50 border border-amber-300/80 text-amber-900 font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 hover-lift"
                >
                  Join Existing Kitchen
                </Link>
              </div>
            )}

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="bg-emerald-100 text-emerald-700 text-base p-2 rounded-xl">
                  <FiCodesandbox />
                </div>
                <span className="text-sm font-semibold text-gray-700">Smart Tracking</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-orange-100 text-orange-600 text-base p-2 rounded-xl">
                  <FaRegClock />
                </div>
                <span className="text-sm font-semibold text-gray-700">Expiry Alerts</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 text-blue-600 text-base p-2 rounded-xl">
                  <MdOutlineFamilyRestroom />
                </div>
                <span className="text-sm font-semibold text-gray-700">Family Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Animated Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft decorative glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-green-300 rounded-3xl blur-2xl opacity-30"></div>

              {/* Main Visual Image */}
              <div
                className="relative rounded-3xl shadow-2xl h-[420px] sm:h-[480px] w-full overflow-hidden border-4 border-white"
                style={{
                  backgroundImage: `url(${kitchenhero})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Floating Badge 1: Total items */}
                <div className="absolute right-5 top-5 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/60 flex items-center gap-3 animate-float">
                  <div className="bg-gradient-to-tr from-emerald-600 to-green-500 text-xl p-2.5 rounded-xl text-white shadow-xs">
                    <FiCodesandbox />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">140+ Items</p>
                    <span className="text-[11px] text-gray-500 font-medium">In Pantry Stock</span>
                  </div>
                </div>

                {/* Floating Badge 2: Expiring Soon */}
                <div className="absolute left-5 bottom-5 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/60 flex items-center gap-3 animate-float [animation-delay:2s]">
                  <div className="bg-gradient-to-tr from-orange-500 to-amber-400 text-xl p-2.5 rounded-xl text-white shadow-xs">
                    <FaRegClock />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">Fresh Alerts</p>
                    <span className="text-[11px] text-gray-500 font-medium">Zero Food Waste</span>
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