import { AiOutlineRise } from "react-icons/ai"
import { FaStore } from "react-icons/fa"
import { FiAlertTriangle, FiCodesandbox } from "react-icons/fi"
import { SlCalender } from "react-icons/sl"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../stores/store"
import { useEffect } from "react"
import { fetchKitchenData } from "../stores/slices/KitchenSlice"
import type { KitchenItem } from "../types/KitchenTypes"


import { useState } from "react"
import { FiCopy, FiCheck } from "react-icons/fi"

const Dashboard = () => {
  const { kitchenData, message } = useSelector((state: RootState) => state.kitchen)
  const dispatch = useDispatch<AppDispatch>()
  const [copied, setCopied] = useState(false)

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
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Added today";
    if (diffDays === 1) return "Added 1 day ago";
    return `Added ${diffDays} days ago`;
  };

  console.log("kitchenData at dashboard", kitchenData, message)

  const { kitchenId, userId, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && kitchenId && userId) {
      dispatch(fetchKitchenData());
    }
  }, [dispatch, isAuthenticated, kitchenId, userId]);

  // kitchen's total items number
  const items: KitchenItem[] = (kitchenData?.kitchenItemIds as KitchenItem[]) || [];
  const totalItems = items.length;

  // kitchen's low stock number
  const lowStockCount = items.filter((item: KitchenItem) => item.quantity <= 2).length;

  // kitchen's items count expiring soon (within 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const expiringSoonCount = items.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    return expiry >= now && expiry <= sevenDaysFromNow;
  }).length;

  // kitchen items added this week
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const addedThisWeekCount = items.filter((item) => {
    if (!item.createdAt) return false;
    const created = new Date(item.createdAt);
    return created >= sevenDaysAgo && created <= now;
  }).length;

  // last 10 items added in the kitchen
  const recentItems: KitchenItem[] = [...items]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 10);

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <div className="bg-white py-3 border-b border-black/10 px-8 flex justify-between items-center">
        <div className="space-y-[-2px]">
          <h1 className="text-3xl font-serif font-semibold text-amber-950">
            {kitchenData?.kitchenName || "Dashboard"}
          </h1>
          <p className="text-sm font-medium opacity-85">Welcome back! Here's your kitchen overview.</p>
        </div>
        <div className="flex items-center gap-4">
          {kitchenId && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-semibold text-amber-900">Kitchen Code:</span>
              <span className="font-mono font-bold text-amber-800 text-sm">{kitchenId}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs flex items-center gap-1 bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 cursor-pointer"
                title="Copy code for others to join"
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
          <Link className="bg-blue-500 text-white px-4 py-1.5 rounded-lg font-medium text-sm hover:bg-blue-600" to="/">Home</Link>
        </div>
      </div>

      <div className="px-8">


        <div className="grid grid-cols-4  gap-10 py-10">

          <div className="bg-white px-8 py-7 rounded-lg  shadow-2xl">
            <div className="flex justify-between">
              <p className="font-medium">Total Products</p>
              <div className="bg-green-100 text-2xl p-2 rounded-[100%]">
                <FiCodesandbox />
              </div>

            </div>
            <h3 className="text-2xl font-semibold opacity-90 ">{totalItems}</h3>
            <p className="opacity-70">items in your kitchen</p>

          </div>

          <div className="bg-white px-8 py-7 rounded-lg  shadow-2xl">
            <div className="flex justify-between">
              <p className="font-medium">Low Stock</p>
              <div className="bg-red-100 text-red-500 text-2xl p-2 rounded-[100%]">
                <FiAlertTriangle />
              </div>

            </div>
            <h3 className="text-2xl font-semibold opacity-90 ">{lowStockCount}</h3>
            <p className="opacity-70">items running low</p>

          </div>

          <div className="bg-white px-8 py-7 rounded-lg  shadow-2xl">
            <div className="flex justify-between">
              <p className="font-medium">This Week</p>
              <div className="bg-yellow-100 text-2xl p-2 text-yellow-500 rounded-[100%]">
                <AiOutlineRise />
              </div>

            </div>
            <h3 className="text-2xl font-semibold opacity-90 ">{addedThisWeekCount}</h3>
            <p className="opacity-70">items added</p>

          </div>

          <div className="bg-white px-8 py-7 rounded-lg shadow-2xl">
            <div className="flex justify-between">
              <p className="font-medium">Expiring Soon</p>
              <div className="bg-red-100 text-red-500 text-2xl p-2 rounded-[100%]">
                <SlCalender />
              </div>

            </div>
            <h3 className="text-2xl font-semibold opacity-90 ">{expiringSoonCount}</h3>
            <p className="opacity-70">Within 7 days</p>

          </div>
        </div>



        <div className="bg-white rounded-lg px-8 py-6 shadow-2xl">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <p className="opacity-70 font-medium pb-5">Common tasks to manage your inventory.</p>

          <div className="space-x-5 flex">
            <Link to="/additemstokitchen" className="bg-green-500 py-2 px-4 rounded-lg text-white font-semibold hover:bg-green-600 transition">+ Add New Items</Link>
            <Link to="/kitchenitems" className="flex text-orange-400 border-orange-400/50 border items-center px-4 rounded-lg bg-amber-50 gap-5 hover:bg-amber-100 transition"><FaStore />View All Products</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg px-8 py-6 shadow-2xl my-10">
          <h2 className="text-xl font-bold">Recent Products</h2>
          <p className="opacity-70 font-medium pb-5">Your latest inventory additions.</p>

          <div className="space-y-4">
            {recentItems.length === 0 ? (
              <p className="text-gray-500 italic">No products added to this kitchen yet.</p>
            ) : (
              recentItems.map((k, idx) => (
                <div key={k._id || `${k.productName}-${idx}`} className="flex px-5 bg-green-50 border border-green-200 py-3 rounded-lg shadow-sm mb-3 justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="bg-green-200 text-xl rounded-full p-2 text-green-800">
                      <FiCodesandbox />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">{k.productName}</h3>
                      <div className="space-x-2 text-sm opacity-75 font-medium">
                        <span>{k.quantity} {k.unit}</span>
                        <span>•</span>
                        <span>{formatAddedDate(k.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {k.quantity > 2 ? (
                    <span className="bg-green-500 rounded-xl my-auto px-3 py-1 text-white text-xs font-bold shadow">In Stock</span>
                  ) : (
                    <span className="bg-red-500 rounded-xl my-auto px-3 py-1 text-white text-xs font-bold shadow">Low Stock</span>
                  )}
                </div>
              ))
            )}



            {/* <div className="flex px-5 bg-green-100 py-3 rounded-lg shadow-xl mb-6 justify-between">

          <div className="flex gap-5">
            <div className="bg-green-300 text-xl rounded-[100%] m-auto p-2">
              <FiCodesandbox />
            </div>
          
            <div className="space-y-[-6px]">
              <h3 className="text-lg font-semibold">Rice</h3>
              <div className="space-x-2 opacity-75 font-medium">
                <span>2Kg</span>
                <span>Add 1 Day ago</span>
              </div>
            </div>
            </div>

            <span className="bg-green-500 rounded-xl my-auto px-3 py-1 text-white font-bold shadow-lg">In Stock</span>
        </div> */}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

