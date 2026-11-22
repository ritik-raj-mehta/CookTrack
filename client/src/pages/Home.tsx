import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";
import Header from "../components/Header";

// React Icons
import {
  FaArrowRightLong,
  FaLeaf,
  FaPeopleGroup,
  FaCheck,
  FaFilePdf,
} from "react-icons/fa6";
import {
  FiCodesandbox,
  FiActivity,
  FiShoppingCart,
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
} from "react-icons/fi";
import { LuChefHat } from "react-icons/lu";
import { IoSparklesOutline } from "react-icons/io5";

const Home = () => {
  const { isAuthenticated, kitchenId } = useSelector((state: RootState) => state.auth);

  // State for Interactive Feature Showcase Tabs
  const [activeTab, setActiveTab] = useState<"pantry" | "shopping" | "insights" | "crew">("pantry");

  // State for Kitchen Savings Calculator
  const [familySize, setFamilySize] = useState<number>(3);

  // State for FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic savings calculations based on household size
  const savingsData = {
    1: { money: 1800, items: 8, hours: 4 },
    2: { money: 3400, items: 15, hours: 7 },
    3: { money: 4850, items: 22, hours: 10 },
    4: { money: 6400, items: 29, hours: 13 },
    5: { money: 8200, items: 36, hours: 16 },
    6: { money: 9800, items: 44, hours: 20 },
  }[familySize] || { money: 4850, items: 22, hours: 10 };

  const faqs = [
    {
      q: "Can multiple roommates or family members share the same kitchen?",
      a: "Yes! Every kitchen created in CookTrack receives a unique 6-character Kitchen Invite Code. Family members and roommates can choose 'Join Existing Kitchen' during signup to instantly share real-time access to the same pantry inventory and grocery cart.",
    },
    {
      q: "How do expiration date alerts and stock badges work?",
      a: "When you add or restock an item, CookTrack logs its expiration date and quantity. The system automatically categorizes items into color-coded status badges: In Stock (green), Low Stock (amber/red), and Expiring Soon alerts within 7 days to eliminate food waste.",
    },
    {
      q: "Can I download or print our grocery shopping list?",
      a: "Yes! CookTrack's Collaborative Shopping Cart includes a built-in 1-click 'Export PDF' feature powered by jsPDF. You can generate and download a clean, formatted, printable grocery checklist complete with quantities, units, and brand notes to take to the store.",
    },
    {
      q: "What happens when I buy an item from the shopping list?",
      a: "When you mark an item as bought in your shopping cart, CookTrack triggers an intelligent 1-tap Restock Prompt. It asks if you'd like to immediately transfer the item into your pantry inventory, eliminating the need to enter details twice.",
    },
    {
      q: "What analytics and insights does CookTrack track?",
      a: "The Kitchen Insights dashboard features an executive 2x2 KPI grid showing money saved vs. wasted, monthly food consumption trends across 6 months, category distribution, storage location breakdowns (Fridge, Freezer, Pantry), and an Eco-Score rating.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 overflow-x-hidden w-full max-w-full text-gray-800">
      {/* ----------------- SECTION 1: HEADER & HERO ----------------- */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-6 sm:pt-10 lg:pt-14">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200/90 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Collaborative Kitchen & Pantry System</span>
            </div>

            {/* Headline */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.12]">
                Your Kitchen,{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                  Organized
                </span>
                <br />
                <span className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
                  Zero Waste. Shared Effort.
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-gray-600 max-w-xl font-normal leading-relaxed pt-1">
                Track pantry supplies across <strong>Fridge, Freezer, and Pantry</strong> zones.
                Collaborate on a real-time grocery list with family, get automated expiry radar alerts, and export PDF shopping checklists in 1 click.
              </p>
            </div>

            {/* Impact Metrics Ribbon */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 grid grid-cols-3 gap-2 sm:gap-4 w-full">
              <div className="text-center border-r border-gray-100 last:border-0 pr-2">
                <p className="text-xl sm:text-3xl font-black text-emerald-600">40%</p>
                <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Less Waste</p>
              </div>

              <div className="text-center border-r border-gray-100 last:border-0 px-2">
                <p className="text-xl sm:text-3xl font-black text-emerald-600">2.5x</p>
                <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Faster Shopping</p>
              </div>

              <div className="text-center pl-2">
                <p className="text-xl sm:text-3xl font-black text-emerald-600">₹4.8k+</p>
                <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Saved Monthly</p>
              </div>
            </div>

            {/* CTA Buttons */}
            {isAuthenticated && kitchenId ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white font-bold py-3.5 px-7 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
                >
                  <span>Go to Kitchen Hub</span>
                  <FaArrowRightLong />
                </Link>
                <Link
                  to="/kitchenitems"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 active:scale-95 border border-emerald-300 text-emerald-900 font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
                >
                  <FiCodesandbox className="text-emerald-600 text-lg" />
                  <span>View Pantry Inventory</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1">
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white font-bold py-3.5 px-7 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-sm sm:text-base group"
                >
                  <span>Create a Kitchen</span>
                  <FaArrowRightLong className="group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
                <Link
                  to="/registertokitchen"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-amber-50 active:scale-95 border border-amber-300 text-amber-900 font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
                >
                  <FaPeopleGroup className="text-amber-600 text-lg" />
                  <span>Join with Invite Code</span>
                </Link>
              </div>
            )}

            {/* Quick Capability Highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
                <div className="bg-emerald-100 text-emerald-700 text-sm sm:text-base p-2 rounded-xl shrink-0">
                  <FiCodesandbox />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">Pantry Radar</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Fridge, Freezer, Shelf</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
                <div className="bg-amber-100 text-amber-700 text-sm sm:text-base p-2 rounded-xl shrink-0">
                  <FiShoppingCart />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">Shared Cart</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">1-Click PDF Export</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
                <div className="bg-teal-100 text-teal-700 text-sm sm:text-base p-2 rounded-xl shrink-0">
                  <FiActivity />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">Waste Analytics</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">₹ Saved & Eco-Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Product Preview Mockup */}
          <div className="lg:col-span-5 relative w-full pt-4 lg:pt-0">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Soft glow background */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-400/30 to-green-300/20 rounded-3xl blur-2xl pointer-events-none"></div>

              {/* Main Simulated Kitchen Card */}
              <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header ribbon */}
                <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-5 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                      <LuChefHat />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">Main Family Kitchen</p>
                      <p className="text-[11px] text-emerald-100 font-mono">Code: CT-9481</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/80 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300/40">
                    Active Hub
                  </span>
                </div>

                {/* Simulated Real-Time Inventory Items */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Item 1: Milk (Expiring Alert) */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 hover:shadow-xs transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
                        🥛
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">Organic Whole Milk</p>
                        <p className="text-xs text-amber-800 font-semibold flex items-center gap-1 mt-0.5">
                          <FiClock className="shrink-0" />
                          <span>Expires in 2 days (Fridge)</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-xs">
                        1 liter
                      </span>
                    </div>
                  </div>

                  {/* Item 2: Basmati Rice (In Stock) */}
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 hover:shadow-xs transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                        🍚
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">Royal Basmati Rice</p>
                        <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                          <FiCheckCircle className="shrink-0" />
                          <span>Pantry Shelf • Well Stocked</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300/60">
                        10 kg
                      </span>
                    </div>
                  </div>

                  {/* Item 3: Vine Tomatoes (Low Stock) */}
                  <div className="bg-red-50/50 border border-red-200/70 rounded-2xl p-3 flex items-center justify-between gap-3 hover:shadow-xs transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg shrink-0">
                        🍅
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">Vine Tomatoes</p>
                        <p className="text-xs text-red-700 font-semibold flex items-center gap-1 mt-0.5">
                          <FiAlertTriangle className="shrink-0" />
                          <span>Low Stock • Auto-added to Cart</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-lg border border-red-200">
                        0.5 kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Quick Feature Status */}
                <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <FaLeaf />
                    <span>Eco-Score: Grade A</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <FaFilePdf className="text-red-500" />
                    <span>PDF Shopping List Ready</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge: Live Sync */}
              <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2.5 animate-bounce [animation-duration:3s]">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">Live Family Sync</p>
                  <p className="text-[10px] text-gray-500">Shared across 3 members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- SECTION 2: HOW IT WORKS (3 STEPS) ----------------- */}
      <section className="bg-slate-50 py-16 sm:py-24 border-y border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
              Seamless Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              How CookTrack Simplifies Your Kitchen
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Three simple steps that replace messy notes, forgotten groceries, and wasted food forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Organize Your Pantry
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Log items with custom units (kg, L, pieces, cans) and assign them to dedicated storage zones: <strong>Fridge, Freezer, or Pantry</strong> with quick expiry dates.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span>Multi-Category Sorting</span>
                <span>→</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Smart Expiry Radar
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dynamic badges alert you when items are <strong>In Stock</strong>, running <strong>Low Stock</strong>, or <strong>Expiring Soon</strong> so you cook them before they spoil.
              </p>
              <div className="pt-2 text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <span>Zero Waste Alerts</span>
                <span>→</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Shared Cart & Restock
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Collaborate on a live shopping cart with family, download a printable <strong>PDF shopping list</strong>, and 1-tap restock purchased items directly into your pantry.
              </p>
              <div className="pt-2 text-xs font-bold text-teal-700 flex items-center gap-1.5">
                <span>1-Click Restock Prompt</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 3: INTERACTIVE FEATURE SHOWCASE ----------------- */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
              Full Feature Tour
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Built Specifically for Your Real Kitchen Needs
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Explore the core modules built into CookTrack. Click any tab below to inspect features.
            </p>
          </div>

          {/* Feature Navigation Tabs */}
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-3 mb-8 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("pantry")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "pantry"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
              }`}
            >
              <FiCodesandbox />
              <span>Pantry Inventory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("shopping")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "shopping"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
              }`}
            >
              <FiShoppingCart />
              <span>Shared Shopping List & PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "insights"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
              }`}
            >
              <FiActivity />
              <span>Kitchen Insights & KPIs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("crew")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "crew"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
              }`}
            >
              <FaPeopleGroup />
              <span>Kitchen Crew Management</span>
            </button>
          </div>

          {/* Tab Content Display Card */}
          <div className="bg-slate-50 border border-gray-200/80 rounded-3xl p-6 sm:p-10 shadow-sm animate-fadeIn">
            {/* TAB 1: PANTRY INVENTORY */}
            {activeTab === "pantry" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    <span>Smart Inventory Management</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900">
                    Comprehensive Stock Tracking Across All Storage Zones
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Easily categorize items across 10 culinary groups (Produce, Dairy, Meat, Pantry, Baking, Beverages). Filter by custom units (kg, grams, liters, ml, cups, pieces) and instantly search by product title.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Zone Categorization:</strong> Refrigerator, Freezer, and Pantry Shelves.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Stock Badges:</strong> Green (In Stock), Red (Low Stock), Gray (Out of Stock).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Edit & Notes Modal:</strong> Fast inline updates for quantities and brand notes.</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Live Inventory Snapshot</span>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">Real-Time Search & Filters</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                      <p className="font-bold text-gray-900 text-sm">Farm Eggs</p>
                      <p className="text-gray-500 mt-0.5">Fridge • 12 Pieces</p>
                      <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">In Stock</span>
                    </div>
                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40">
                      <p className="font-bold text-gray-900 text-sm">Greek Yogurt</p>
                      <p className="text-gray-500 mt-0.5">Fridge • 1 cup</p>
                      <span className="inline-block mt-2 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Expires Tomorrow</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SHOPPING CART & PDF */}
            {activeTab === "shopping" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    <span>Collaborative Grocery List</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900">
                    Real-Time Shared Cart with 1-Click PDF Export
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Never buy duplicates again. All members of your kitchen share a live shopping cart. When anyone buys an item, a prompt lets them transfer it straight into the kitchen pantry with 1 tap.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Printable PDF Export:</strong> Download high-quality, formatted checklists for grocery trips.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>1-Tap Restock Modal:</strong> Marked an item as bought? It immediately offers to restock your pantry.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Quick Filters:</strong> View All, Pending purchases, or Completed purchases.</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Shopping List Sample</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                      <FaFilePdf /> Export PDF Available
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center"></span>
                        <span className="font-semibold text-gray-800">Brown Bread (2 packages)</span>
                      </div>
                      <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">Pending</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <div className="flex items-center gap-2 line-through text-gray-400">
                        <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                        <span>Olive Oil (1 bottle)</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Bought → Restocked</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: KITCHEN INSIGHTS & KPIS */}
            {activeTab === "insights" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
                    <span>Waste & Savings Intelligence</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900">
                    Executive 2x2 KPI Grid & 6-Month Usage Trends
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Gain deep visibility into food consumption habits. Track monetary savings in Rupees (₹), monitor food items diverted from the bin, and evaluate your kitchen's overall Eco-Score rating.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>₹ Savings Tracker:</strong> Quantify the actual financial impact of zero food waste.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Monthly Trend Chart:</strong> Compare consumed vs. wasted supplies across 6 months.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Consumption Radial Gauge:</strong> Visual percentage of inventory consumed fresh.</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                      <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Money Saved</p>
                      <p className="text-2xl font-black text-emerald-700 mt-1">₹4,850</p>
                    </div>
                    <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl">
                      <p className="text-xs text-teal-800 font-semibold uppercase tracking-wider">Eco-Score</p>
                      <p className="text-2xl font-black text-teal-700 mt-1">Grade A</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 text-center">
                    <p className="font-semibold text-gray-800">89% Consumed Ratio</p>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: "89%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: KITCHEN CREW */}
            {activeTab === "crew" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                    <span>Collaborative Kitchen Access</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900">
                    Shared Kitchen Invite Codes with Strict Safeguards
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Managing a family kitchen or living in a shared apartment? Share your unique 6-character kitchen invite code. Assign KitchenAdmin privileges, view active crew members, and safeguard kitchen security with password + phone verification.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>1-Click Invite Code Copy:</strong> Easily copy and share your kitchen code with roommates.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Role Hierarchy:</strong> Seamlessly promote trusted members to KitchenAdmin.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheck className="text-emerald-600 shrink-0" />
                      <span><strong>Security Safeguards:</strong> Removing members or deleting kitchens requires dual authentication.</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Kitchen Invite Code</p>
                      <p className="text-lg font-mono font-black tracking-widest text-emerald-800">CT-8492</p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-xs">
                      1-Click Copy
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">R</div>
                        <div>
                          <p className="font-bold text-gray-900">Chef Ritik</p>
                          <p className="text-[10px] text-gray-500">ritik@cooktrack.app</p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">KitchenAdmin</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">A</div>
                        <div>
                          <p className="font-bold text-gray-900">Alex Sharma</p>
                          <p className="text-[10px] text-gray-500">alex@cooktrack.app</p>
                        </div>
                      </div>
                      <span className="bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px]">Member</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 4: INTERACTIVE KITCHEN SAVINGS CALCULATOR ----------------- */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest bg-emerald-900/60 border border-emerald-500/30 px-3.5 py-1 rounded-full">
              Interactive Estimator
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Calculate Your Household's Monthly Savings
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              Select how many people share your kitchen to see the estimated money and food saved each month.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            {/* Household size selector buttons */}
            <div className="space-y-3 text-center">
              <label className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-300 block">
                Number of People in Your Kitchen
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFamilySize(num)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer ${
                      familySize === num
                        ? "bg-gradient-to-tr from-emerald-500 to-green-400 text-white shadow-lg shadow-emerald-500/30 scale-105"
                        : "bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10"
                    }`}
                  >
                    {num === 6 ? "6+" : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Impact Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Monthly Savings</p>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">
                  ₹{savingsData.money.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Direct reduction in spoiled grocery bills</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Food Items Rescued</p>
                <p className="text-3xl sm:text-4xl font-black text-amber-300 mt-1">
                  ~{savingsData.items} items
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Consumed before expiry dates expire</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Planning Time Saved</p>
                <p className="text-3xl sm:text-4xl font-black text-teal-300 mt-1">
                  {savingsData.hours} hrs/mo
                </p>
                <p className="text-[11px] text-gray-400 mt-1">With 1-click PDF lists & shared cart</p>
              </div>
            </div>

            {/* Direct CTA inside calculator */}
            <div className="text-center pt-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 active:scale-95 text-white font-extrabold py-3.5 px-8 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-300 text-sm sm:text-base cursor-pointer"
              >
                <span>{isAuthenticated ? "Open Your Kitchen Hub" : "Start Saving Today — Create Kitchen"}</span>
                <FaArrowRightLong />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 5: FREQUENTLY ASKED QUESTIONS (FAQ) ----------------- */}
      <section className="py-16 sm:py-24 bg-white border-b border-gray-100">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-14">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Everything you need to know about setting up your smart kitchen with CookTrack.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 font-bold text-sm sm:text-base text-gray-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 transition"
                >
                  <span>{faq.q}</span>
                  <FiChevronDown
                    className={`text-lg text-emerald-600 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 6: HIGH-IMPACT BOTTOM CTA BANNER ----------------- */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl text-center space-y-6 relative overflow-hidden">
            {/* Ambient decorative blobs */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-emerald-200">
              <IoSparklesOutline />
              <span>Ready in 30 Seconds</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold max-w-2xl mx-auto leading-tight">
              Transform How You Manage Food & Groceries
            </h2>

            <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto leading-relaxed">
              Join households and shared apartments keeping pantries fresh, organized, and budget-friendly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="flex items-center justify-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 font-extrabold py-3.5 px-8 rounded-xl shadow-md transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
              >
                <span>{isAuthenticated ? "Go to Dashboard" : "Create Your Kitchen"}</span>
                <FaArrowRightLong />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/registertokitchen"
                  className="flex items-center justify-center gap-2 bg-emerald-900/60 hover:bg-emerald-900/90 text-white border border-emerald-400/40 active:scale-95 font-bold py-3.5 px-7 rounded-xl transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
                >
                  <span>Join with Invite Code</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 7: MODERN COMPREHENSIVE FOOTER ----------------- */}
      <footer className="bg-white border-t border-gray-200 py-12 sm:py-16 text-gray-600 text-xs sm:text-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-gray-100">
            {/* Col 1: Brand & Description */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-lg shadow-sm">
                  <LuChefHat />
                </div>
                <span className="font-serif font-black text-2xl text-gray-900 tracking-tight">
                  CookTrack
                </span>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm max-w-sm leading-relaxed">
                Smart Kitchen & Pantry Management System built on MERN with real-time expiration tracking, collaborative grocery shopping, and zero food waste analytics.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1 font-mono">
                <span>React 19</span> • <span>Node.js</span> • <span>MongoDB</span> • <span>Tailwind v4</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="md:col-span-3 space-y-2.5">
              <p className="font-bold text-gray-900 text-xs uppercase tracking-wider">Kitchen Modules</p>
              <ul className="space-y-1.5 text-xs sm:text-sm">
                <li>
                  <Link to="/kitchenitems" className="hover:text-emerald-600 transition">Pantry Inventory</Link>
                </li>
                <li>
                  <Link to="/additemstoshoppingcart" className="hover:text-emerald-600 transition">Shopping List & PDF</Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-emerald-600 transition">Kitchen Hub Dashboard</Link>
                </li>
                <li>
                  <Link to="/kitchenmembers" className="hover:text-emerald-600 transition">Crew Management</Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Authentication & Quick Access */}
            <div className="md:col-span-4 space-y-2.5">
              <p className="font-bold text-gray-900 text-xs uppercase tracking-wider">Get Started</p>
              <ul className="space-y-1.5 text-xs sm:text-sm">
                <li>
                  <Link to="/signup" className="hover:text-emerald-600 transition">Create New Kitchen (Admin)</Link>
                </li>
                <li>
                  <Link to="/registertokitchen" className="hover:text-emerald-600 transition">Join Kitchen (Invite Code)</Link>
                </li>
                <li>
                  <Link to="/signin" className="hover:text-emerald-600 transition">Sign In to Your Account</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} CookTrack MERN. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span>Designed with</span>
              <span className="text-emerald-600 font-bold">♥</span>
              <span>for smart, sustainable kitchens</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
