import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckCircle,
  FiPieChart,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import { FaIndianRupeeSign, FaLeaf } from "react-icons/fa6";
import { IoSparklesOutline } from "react-icons/io5";
import type { AppDispatch, RootState } from "../stores/store";
import { fetchKitchenAnalytics } from "../stores/slices/KitchenSlice";
import type {
  AnalyticsData,
  MonthlyTrend,
  CategoryStat,
  StorageStat,
  ActivityLog,
} from "../types/KitchenTypes";

const KitchenInsights: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { analyticsData, analyticsLoading, kitchenData } = useSelector(
    (state: RootState) => state.kitchen
  );
  const { kitchenId } = useSelector((state: RootState) => state.auth);

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  useEffect(() => {
    if (kitchenId) {
      dispatch(fetchKitchenAnalytics());
    }
  }, [dispatch, kitchenId]);

  const handleRefresh = () => {
    dispatch(fetchKitchenAnalytics());
  };

  const effectiveData: AnalyticsData | null = analyticsData;
  const stats = effectiveData?.wasteStats;
  const health = effectiveData?.inventoryHealth;
  const trends: MonthlyTrend[] = effectiveData?.monthlyTrends || [];
  const categories: CategoryStat[] = effectiveData?.categoryDistribution || [];
  const storage: StorageStat[] = effectiveData?.storageDistribution || [];
  const topWasted: CategoryStat[] = effectiveData?.topWastedCategories || [];
  const activity: ActivityLog[] = effectiveData?.recentActivity || [];

  // Radial Donut stroke calculations
  const consumedRatio = stats?.consumedRatio ?? 100;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (consumedRatio / 100) * circumference;

  // Max value for bar chart scaling
  const maxBarValue = Math.max(
    ...trends.map((t) => Math.max(t.consumed, t.wasted, t.restocked, 1)),
    5
  );

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 py-4 border-b border-gray-100 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 text-white p-2.5 rounded-2xl text-2xl shadow-xs shrink-0">
            <FiActivity />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
                Kitchen Insights
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <IoSparklesOutline className="text-xs" /> Live Analytics
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              Food waste tracking, money saved, and pantry efficiency for{" "}
              {kitchenData?.kitchenName || "your kitchen"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={analyticsLoading}
            className="flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 active:scale-95 text-gray-700 dark:text-slate-200 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <FiRefreshCw className={`${analyticsLoading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/kitchenitems"
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white py-2.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <span>View Pantry</span>
            <FiArrowUpRight className="text-base" />
          </Link>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto space-y-6 sm:space-y-7 animate-fadeIn pb-24 sm:pb-12">
        {/* 4 PRIMARY KPI HIGHLIGHT CARDS: 2x2 grid on mobile/tablet, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* 1. Money Saved */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-2xs border border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all duration-200 relative overflow-hidden group hover-lift">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 dark:bg-emerald-950/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate">
                  Money Saved
                </p>
                <div className="flex items-baseline gap-1 mt-1 sm:mt-1.5 flex-wrap">
                  <span className="text-xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    ₹{stats?.moneySaved ?? 0}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300">saved</span>
                </div>
                <p className="hidden sm:block text-xs text-gray-400 dark:text-slate-500 mt-1 truncate">
                  Food consumed in time
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-lg sm:text-2xl p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xs shrink-0">
                <FaIndianRupeeSign />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs">
              <span className="text-gray-500 dark:text-slate-400 font-medium">Lost to Waste:</span>
              <span className="font-bold text-red-500 dark:text-red-400">₹{stats?.moneyWasted ?? 0}</span>
            </div>
          </div>

          {/* 2. Consumed vs Wasted Ratio */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-2xs border border-gray-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800/60 transition-all duration-200 relative overflow-hidden hover-lift">
            <div className="flex justify-between items-center gap-1">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate">
                  Consumption Rate
                </p>
                <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1 sm:mt-1.5">
                  {consumedRatio}%
                </h3>
                <p className="hidden sm:block text-xs text-gray-400 dark:text-slate-500 mt-1 truncate">
                  {100 - consumedRatio}% reported wasted
                </p>
              </div>

              {/* Radial Donut Gauge */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-red-100 dark:text-red-950/40"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[10px] sm:text-[11px] font-extrabold text-gray-800 dark:text-slate-200">
                  {consumedRatio}%
                </span>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span> Consumed ({stats?.totalConsumed ?? 0})
              </span>
              <span className="text-red-500 dark:text-red-400 flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span> Wasted ({stats?.totalWasted ?? 0})
              </span>
            </div>
          </div>

          {/* 3. Kitchen Eco Score */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-2xs border border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all duration-200 relative overflow-hidden hover-lift">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate">
                  Kitchen Eco Score
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                  <span className="text-xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-serif">
                    {stats?.ecoScore || "A"}
                  </span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-lg">
                    Grade
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-emerald-700/90 dark:text-emerald-300 font-medium mt-1 truncate">
                  {stats?.ecoLabel || "Eco Champion"}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-lg sm:text-2xl p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xs shrink-0">
                <FaLeaf />
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400">
              <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 text-xs" />
              <span className="truncate">Household grocery loss</span>
            </div>
          </div>

          {/* 4. Pantry Freshness Health */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 lg:p-6 rounded-2xl shadow-2xs border border-gray-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800/60 transition-all duration-200 relative overflow-hidden hover-lift">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate">
                  At-Risk Value
                </p>
                <div className="flex items-baseline gap-1 mt-1 sm:mt-1.5 flex-wrap">
                  <span className="text-xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                    ₹{health?.atRiskValue ?? 0}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-slate-500">at risk</span>
                </div>
                <p className="hidden sm:block text-xs text-amber-700/80 dark:text-amber-400 font-medium mt-1 truncate">
                  {health?.expiringSoonCount ?? 0} items expiring soon
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-lg sm:text-2xl p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xs shrink-0">
                <FiAlertTriangle />
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs">
              <span className="text-gray-500 dark:text-slate-400">Expired:</span>
              <span className="font-bold text-red-600 dark:text-red-400">{health?.expiredCount ?? 0} items</span>
            </div>
          </div>
        </div>

        {/* MAIN VISUAL SECTION: 2 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* LEFT 7 COLS: Monthly Trends Bar Chart */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 space-y-6 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-600 dark:text-emerald-400" /> Monthly Item Usage & Waste Trends
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Comparing consumed, wasted, and restocked groceries over the past 6 months
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold self-start sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-gray-600 dark:text-slate-300">Consumed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="text-gray-600 dark:text-slate-300">Wasted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span className="text-gray-600 dark:text-slate-300">Restocked</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Multi-Bar Chart with Horizontal Scroll Protection */}
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <div className="h-60 sm:h-64 min-w-[320px] flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 px-2">
                {trends.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 text-xs">
                    <FiPieChart className="text-3xl mb-2 stroke-1" />
                    <span>No monthly activity recorded yet. Start consuming or restocking items!</span>
                  </div>
                ) : (
                  trends.map((item, index) => {
                    const consumedHeight = Math.max(6, Math.round((item.consumed / maxBarValue) * 180));
                    const wastedHeight = Math.max(item.wasted > 0 ? 6 : 0, Math.round((item.wasted / maxBarValue) * 180));
                    const restockedHeight = Math.max(item.restocked > 0 ? 6 : 0, Math.round((item.restocked / maxBarValue) * 180));
                    const isHovered = hoveredBarIndex === index;

                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >
                        {/* Floating Tooltip */}
                        {isHovered && (
                          <div className="absolute -top-12 z-20 bg-gray-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap animate-fadeIn pointer-events-none">
                            <p className="font-bold border-b border-gray-700 pb-0.5 mb-0.5">
                              {item.month} {item.year}
                            </p>
                            <p className="text-emerald-300">🍽️ Consumed: {item.consumed}</p>
                            <p className="text-red-300">🗑️ Wasted: {item.wasted}</p>
                            <p className="text-blue-300">📦 Restocked: {item.restocked}</p>
                          </div>
                        )}

                        {/* Bar Group */}
                        <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                          {/* Consumed Bar */}
                          <div
                            style={{ height: `${consumedHeight}px` }}
                            className={`w-2.5 sm:w-3.5 lg:w-4 rounded-t-md transition-all duration-300 ${
                              isHovered
                                ? "bg-emerald-600 shadow-md shadow-emerald-200"
                                : "bg-emerald-500 hover:bg-emerald-600"
                            }`}
                          ></div>

                          {/* Wasted Bar */}
                          {item.wasted > 0 && (
                            <div
                              style={{ height: `${wastedHeight}px` }}
                              className={`w-2.5 sm:w-3.5 lg:w-4 rounded-t-md transition-all duration-300 ${
                                isHovered
                                  ? "bg-red-500 shadow-md shadow-red-200"
                                  : "bg-red-400 hover:bg-red-500"
                              }`}
                            ></div>
                          )}

                          {/* Restocked Bar */}
                          {item.restocked > 0 && (
                            <div
                              style={{ height: `${restockedHeight}px` }}
                              className={`w-2.5 sm:w-3.5 lg:w-4 rounded-t-md transition-all duration-300 ${
                                isHovered
                                  ? "bg-blue-500 shadow-md shadow-blue-200"
                                  : "bg-blue-400 hover:bg-blue-500"
                              }`}
                            ></div>
                          )}
                        </div>

                        {/* Month Label */}
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mt-2 truncate">
                          {item.month}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Chart Footer / Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3.5 border border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 dark:text-slate-300 gap-2">
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  <strong>Tip:</strong> Consuming items within 3 days of expiration saves up to ₹2,500/month on grocery waste.
                </span>
              </span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-400 shrink-0">
                Total Saved: ₹{stats?.moneySaved ?? 0}
              </span>
            </div>
          </div>

          {/* RIGHT 5 COLS: Current Inventory Health Breakdown */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 space-y-6 flex flex-col justify-between transition-colors">
            <div>
              <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiPieChart className="text-amber-600 dark:text-amber-400" /> Current Stock Freshness
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Real-time status of items currently on your shelves
                </p>
              </div>

              {/* Progress bars for Fresh vs Expiring vs Expired */}
              <div className="space-y-4 pt-5">
                {/* Safe & Fresh */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Fresh & Safe
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {health?.freshCount ?? 0} items
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${
                          health?.totalProducts
                            ? Math.round(((health.freshCount || 0) / health.totalProducts) * 100)
                            : 100
                        }%`,
                      }}
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    ></div>
                  </div>
                </div>

                {/* Expiring Soon */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Expiring Soon (&le; 7d)
                    </span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">
                      {health?.expiringSoonCount ?? 0} items
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${
                          health?.totalProducts
                            ? Math.round(((health.expiringSoonCount || 0) / health.totalProducts) * 100)
                            : 0
                        }%`,
                      }}
                      className="bg-amber-500 h-full rounded-full transition-all duration-700"
                    ></div>
                  </div>
                </div>

                {/* Expired */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Expired
                    </span>
                    <span className="text-red-700 dark:text-red-400 font-bold">
                      {health?.expiredCount ?? 0} items
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${
                          health?.totalProducts
                            ? Math.round(((health.expiredCount || 0) / health.totalProducts) * 100)
                            : 0
                        }%`,
                      }}
                      className="bg-red-500 h-full rounded-full transition-all duration-700"
                    ></div>
                  </div>
                </div>
              </div>

              {/* Storage Locations Split */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Storage Location Split
                </h4>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {storage.slice(0, 3).map((s, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-xl p-2.5">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{s.count}</p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        {s.location}
                      </p>
                    </div>
                  ))}
                  {storage.length === 0 && (
                    <p className="col-span-3 text-xs text-gray-400 dark:text-slate-500 py-2">No storage locations logged</p>
                  )}
                </div>
              </div>
            </div>

            <Link
              to="/kitchenitems"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition hover-lift"
            >
              <span>Manage Shelf Expiry Dates</span>
              <FiArrowUpRight />
            </Link>
          </div>
        </div>

        {/* BOTTOM SECTION: CATEGORY BREAKDOWN & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Category Distribution (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 space-y-5 transition-colors">
            <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiPieChart className="text-indigo-600 dark:text-indigo-400" /> Pantry Category Distribution
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Top food categories stored in your kitchen
              </p>
            </div>

            <div className="space-y-3">
              {categories.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700 dark:text-slate-300">{cat.category}</span>
                    <span className="text-gray-500 dark:text-slate-400">
                      <strong className="text-gray-800 dark:text-white">{cat.count}</strong> items ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.percentage || 10}%` }}
                      className="bg-indigo-500 h-full rounded-full"
                    ></div>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-slate-500 py-6 text-center">
                  No inventory categories added yet.
                </p>
              )}
            </div>

            {/* Waste Risk Insight */}
            {topWasted.length > 0 && (
              <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
                <FiAlertCircle className="text-red-500 dark:text-red-400 text-base shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900 dark:text-red-300">Highest Waste Category</p>
                  <p className="text-red-800/80 dark:text-slate-300 mt-0.5">
                    <strong>{topWasted[0]?.category}</strong> has the most reported expired items ({topWasted[0]?.count} items). Consider buying smaller packs!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Feed (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiActivity className="text-emerald-600 dark:text-emerald-400" /> Recent Consumption & Waste Log
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Timeline of food consumed, restocked, or discarded by crew
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">
                {activity.length} recent events
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-80 overflow-y-auto pr-1">
              {activity.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-xs">
                  <p className="font-semibold text-gray-600 dark:text-slate-300">No activity logged yet</p>
                  <p className="mt-1">
                    When you finish or discard items in your Pantry, they will be logged here.
                  </p>
                </div>
              ) : (
                activity.map((act) => {
                  const isConsumed = act.action === "consumed";
                  const isWasted = act.action === "wasted";
                  const dateStr = new Date(act.loggedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={act._id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                            isConsumed
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                              : isWasted
                              ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
                              : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400"
                          }`}
                        >
                          {isConsumed ? "🍽️" : isWasted ? "🗑️" : "📦"}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {act.productName}{" "}
                            <span className="font-normal text-gray-500 dark:text-slate-400">
                              ({act.quantity} {act.unit})
                            </span>
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">
                            by {act.userName} &bull; {act.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                            isConsumed
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                              : isWasted
                              ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900/60"
                              : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                          }`}
                        >
                          {act.action}
                        </span>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">{dateStr}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenInsights;
