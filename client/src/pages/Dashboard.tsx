import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineRise } from "react-icons/ai";
import { FaCartPlus, FaStore } from "react-icons/fa";
import { FiAlertTriangle, FiCheck, FiCodesandbox, FiCopy, FiPlus } from "react-icons/fi";
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
    if (isAuthenticated && kitchenId && userId) {
      dispatch(fetchKitchenData());
    }
  }, [dispatch, isAuthenticated, kitchenId, userId]);

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
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Top Header Bar */}
      <div className="bg-white py-4 border-b border-gray-100 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            {kitchenData?.kitchenName || "Kitchen Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Welcome back! Here's a live overview of your kitchen inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {kitchenId && (
            <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-amber-900">Code:</span>
              <span className="font-mono font-bold text-amber-800 text-sm tracking-wider">
                {kitchenId}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition font-medium cursor-pointer shadow-xs"
                title="Copy kitchen invite code"
              >
                {copied ? <FiCheck className="text-sm" /> : <FiCopy className="text-sm" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
          <Link
            to="/"
            className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-3.5 py-1.5 rounded-xl font-semibold text-sm transition shadow-2xs cursor-pointer hover-lift"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8 animate-fadeIn">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Products */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:border-emerald-200 transition-all duration-200 hover-lift">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Products
                </p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalItems}</h3>
                <p className="text-xs text-gray-400 mt-0.5">items stored in pantry</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 text-2xl p-3 rounded-2xl">
                <FiCodesandbox />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:border-red-200 transition-all duration-200 hover-lift">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  Low Stock
                </p>
                <h3 className="text-3xl font-extrabold text-red-600 mt-1">{lowStockCount}</h3>
                <p className="text-xs text-gray-400 mt-0.5">items need refill</p>
              </div>
              <div className="bg-red-50 text-red-500 text-2xl p-3 rounded-2xl">
                <FiAlertTriangle />
              </div>
            </div>
          </div>

          {/* Added This Week */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:border-amber-200 transition-all duration-200 hover-lift">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Added This Week
                </p>
                <h3 className="text-3xl font-extrabold text-amber-800 mt-1">
                  {addedThisWeekCount}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">recent pantry additions</p>
              </div>
              <div className="bg-amber-50 text-amber-600 text-2xl p-3 rounded-2xl">
                <AiOutlineRise />
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:border-orange-200 transition-all duration-200 hover-lift">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                  Expiring Soon
                </p>
                <h3 className="text-3xl font-extrabold text-orange-600 mt-1">
                  {expiringSoonCount}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">within the next 7 days</p>
              </div>
              <div className="bg-orange-50 text-orange-500 text-2xl p-3 rounded-2xl">
                <SlCalender />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-5">
            Common actions to organize and track your kitchen inventory.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/additemstokitchen"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 py-2.5 px-5 rounded-xl text-white font-semibold text-sm shadow-sm transition hover-lift"
            >
              <FiPlus className="text-base" /> Add New Items
            </Link>

            <Link
              to="/kitchenitems"
              className="inline-flex items-center gap-2 bg-white hover:bg-amber-50/70 border border-amber-300 text-amber-900 font-semibold py-2.5 px-5 rounded-xl text-sm transition shadow-2xs hover-lift"
            >
              <FaStore className="text-base text-amber-600" /> View All Products
            </Link>

            <Link
              to="/additemstoshoppingcart"
              className="inline-flex items-center gap-2 bg-white hover:bg-blue-50/70 border border-blue-200 text-blue-800 font-semibold py-2.5 px-5 rounded-xl text-sm transition shadow-2xs hover-lift"
            >
              <FaCartPlus className="text-base text-blue-600" /> Shopping List
            </Link>
          </div>
        </div>

        {/* Recent Products Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Products</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Your latest inventory entries and stock levels.
              </p>
            </div>
            {recentItems.length > 0 && (
              <Link
                to="/kitchenitems"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View all ({totalItems}) →
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {recentItems.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                <FiCodesandbox className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">No products added yet</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Start stocking your kitchen by adding items to your inventory.
                </p>
                <Link
                  to="/additemstokitchen"
                  className="inline-flex items-center gap-1.5 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                >
                  <FiPlus /> Add First Item
                </Link>
              </div>
            ) : (
              recentItems.map((k, idx) => (
                <div
                  key={k._id || `${k.productName}-${idx}`}
                  className="flex items-center justify-between p-4 bg-gray-50/70 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition duration-150 hover-lift"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="bg-emerald-100 text-emerald-700 text-lg rounded-xl p-2.5">
                      <FiCodesandbox />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{k.productName}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                        <span className="text-gray-700 font-semibold">
                          {k.quantity} {k.unit}
                        </span>
                        <span>•</span>
                        <span>{formatAddedDate(k.createdAt)}</span>
                        {k.category && (
                          <>
                            <span>•</span>
                            <span className="text-gray-400">{k.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {k.quantity > 2 ? (
                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                      In Stock
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                      Low Stock
                    </span>
                  )}
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
