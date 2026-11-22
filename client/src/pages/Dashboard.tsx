import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineRise } from "react-icons/ai";
import { FaCartPlus, FaStore } from "react-icons/fa";
import { FiAlertTriangle, FiCheck, FiCodesandbox, FiCopy, FiPlus, FiTrendingUp } from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
import type { AppDispatch, RootState } from "../stores/store";
import { fetchKitchenData } from "../stores/slices/KitchenSlice";
import type { KitchenItem } from "../types/KitchenTypes";

const Dashboard = () => {
  const { kitchenData } = useSelector((state: RootState) => state.kitchen);
  const { kitchenId, userId, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (kitchenId && userId) {
      dispatch(fetchKitchenData());
    }
  }, [dispatch, kitchenId, userId, isAuthenticated]);

  const handleCopyCode = () => {
    if (kitchenId) {
      navigator.clipboard.writeText(kitchenId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddedDate = (dateStr?: string) => {
    if (!dateStr) return "Recently added";
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Added today";
    if (diffDays === 1) return "Added yesterday";
    return `Added ${diffDays} days ago`;
  };

  // Kitchen items calculations
  const items: KitchenItem[] = (kitchenData?.kitchenItemIds as KitchenItem[]) || [];
  const totalItems = items.length;

  // Low stock
  const lowStockCount = items.filter((item: KitchenItem) => item.quantity <= 2).length;

  // Expiring soon (within 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const expiringSoonCount = items.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    return expiry >= now && expiry <= sevenDaysFromNow;
  }).length;

  // Added this week
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const addedThisWeekCount = items.filter((item) => {
    if (!item.createdAt) return false;
    const created = new Date(item.createdAt);
    return created >= sevenDaysAgo && created <= now;
  }).length;

  // Last 10 items added
  const recentItems: KitchenItem[] = [...items]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 10);

  return (
    <div className="w-full max-w-full bg-slate-50 dark:bg-slate-950 min-h-screen overflow-x-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 py-4 border-b border-gray-100 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors">
        <div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
            {kitchenData?.kitchenName ? `${kitchenData.kitchenName} Hub` : "Kitchen Hub"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium mt-0.5">
            Welcome back! Here's a live overview of your kitchen inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          {kitchenId && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs max-w-full">
              <span className="text-[11px] sm:text-xs font-semibold text-amber-900 dark:text-amber-300 shrink-0">Code:</span>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-400 text-xs sm:text-sm tracking-wider truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                {kitchenId}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[11px] sm:text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-2 sm:px-2.5 py-1 rounded-lg transition font-medium cursor-pointer shadow-xs shrink-0"
                title="Copy kitchen invite code"
              >
                {copied ? <FiCheck className="text-xs sm:text-sm" /> : <FiCopy className="text-xs sm:text-sm" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
          <Link
            to="/"
            className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 px-3 sm:px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition shadow-2xs cursor-pointer hover-lift shrink-0"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-8 animate-fadeIn">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Total Products */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 hover-lift active:scale-[0.98]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  Total Products
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5 sm:mt-1">{totalItems}</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">in pantry stock</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xl sm:text-2xl p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 self-end sm:self-start">
                <FiCodesandbox />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200 hover-lift active:scale-[0.98]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider truncate">
                  Low Stock
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mt-0.5 sm:mt-1">{lowStockCount}</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">need refill</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400 text-xl sm:text-2xl p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 self-end sm:self-start">
                <FiAlertTriangle />
              </div>
            </div>
          </div>

          {/* Added This Week */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-200 hover-lift active:scale-[0.98]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider truncate">
                  Added Week
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-800 dark:text-amber-300 mt-0.5 sm:mt-1">
                  {addedThisWeekCount}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">recent additions</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xl sm:text-2xl p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 self-end sm:self-start">
                <AiOutlineRise />
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-200 hover-lift active:scale-[0.98]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider truncate">
                  Expiring Soon
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-0.5 sm:mt-1">
                  {expiringSoonCount}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">next 7 days</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/60 text-orange-500 dark:text-orange-400 text-xl sm:text-2xl p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 self-end sm:self-start">
                <SlCalender />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 dark:border-slate-800 transition-colors">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 mb-4 sm:mb-5">
            Common actions to organize and track your kitchen inventory.
          </p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-4">
            <Link
              to="/additemstokitchen"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 py-3 sm:py-2.5 px-3 sm:px-5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-sm transition hover-lift active:scale-95 text-center"
            >
              <FiPlus className="text-base shrink-0" />
              <span>Restock Pantry</span>
            </Link>

            <Link
              to="/kitchenitems"
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-semibold py-3 sm:py-2.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm transition shadow-2xs hover-lift active:scale-95 text-center"
            >
              <FaStore className="text-base text-amber-600 dark:text-amber-400 shrink-0" />
              <span>View Pantry</span>
            </Link>

            <Link
              to="/additemstoshoppingcart"
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300 font-semibold py-3 sm:py-2.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm transition shadow-2xs hover-lift active:scale-95 text-center"
            >
              <FaCartPlus className="text-base text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Market List</span>
            </Link>

            <Link
              to="/insights"
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-300 font-semibold py-3 sm:py-2.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm transition shadow-2xs hover-lift active:scale-95 text-center"
            >
              <FiTrendingUp className="text-base text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Kitchen Insights</span>
            </Link>
          </div>
        </div>

        {/* Recent Products Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Recent Products</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Your latest inventory entries and stock levels.
              </p>
            </div>
            {recentItems.length > 0 && (
              <Link
                to="/kitchenitems"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 active:underline shrink-0 ml-2"
              >
                View all ({totalItems}) →
              </Link>
            )}
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {recentItems.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                <FiCodesandbox className="text-3xl text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">No products added yet</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  Start stocking your kitchen by adding items to your inventory.
                </p>
                <Link
                  to="/additemstokitchen"
                  className="inline-flex items-center gap-1.5 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition active:scale-95"
                >
                  <FiPlus /> Add First Item
                </Link>
              </div>
            ) : (
              recentItems.map((k, idx) => (
                <div
                  key={k._id || `${k.productName}-${idx}`}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 rounded-xl transition duration-150 hover-lift gap-2.5 sm:gap-3"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-base sm:text-lg rounded-xl p-2 sm:p-2.5 shrink-0">
                      <FiCodesandbox />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">{k.productName}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                        <span className="text-gray-700 dark:text-slate-300 font-semibold shrink-0">
                          {k.quantity} {k.unit}
                        </span>
                        <span>•</span>
                        <span className="truncate">{formatAddedDate(k.createdAt)}</span>
                        {k.category && (
                          <>
                            <span className="hidden xs:inline">•</span>
                            <span className="hidden xs:inline text-gray-400 dark:text-slate-500 truncate max-w-[100px] sm:max-w-[120px]">{k.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {k.quantity > 2 ? (
                      <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-2xs whitespace-nowrap">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-2xs whitespace-nowrap">
                        Low Stock
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
