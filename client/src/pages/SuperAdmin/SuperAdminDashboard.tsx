import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../stores/store";
import {
  fetchPlatformStats,
  fetchAllKitchens,
  inspectKitchen,
  deleteKitchenSuperAdmin,
  fetchAllUsers,
  toggleUserSuspension,
  updateUserRole,
  fetchAuditLogs,
  updatePlatformSettings,
  runSystemCleanup,
  clearSuperAdminError,
  clearSuperAdminMessage,
  clearInspectedKitchen,
} from "../../stores/slices/SuperAdminSlice";

// Icons
import {
  FaCrown,
  FaIndianRupeeSign,
  FaLeaf,
  FaUsers,
  FaCheck,
} from "react-icons/fa6";
import {
  FiActivity,
  FiHome,
  FiBox,
  FiShoppingCart,
  FiSearch,
  FiTrash2,
  FiEye,
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle,
  FiX,
  FiClock,
  FiCopy,
  FiRadio,
  FiDatabase,
  FiUserX,
  FiUserCheck,
  FiLayers,
} from "react-icons/fi";

const SuperAdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    stats,
    settings,
    kitchens,
    kitchensTotal,
    users,
    usersTotal,
    logs,
    logsTotal,
    inspectedKitchen,
    loading,
    inspectLoading,
    actionLoading,
    error,
    message,
  } = useSelector((state: RootState) => state.superAdmin);

  // Active view tab: "overview" | "kitchens" | "users" | "logs"
  const [activeTab, setActiveTab] = useState<"overview" | "kitchens" | "users" | "logs">("overview");

  // Kitchen search & filter
  const [kitchenSearch, setKitchenSearch] = useState("");

  // User search & filter
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Audit log action filter
  const [logActionFilter, setLogActionFilter] = useState("all");

  // Announcement form state
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementLevel, setAnnouncementLevel] = useState<"info" | "warning" | "critical">("info");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Modal / Drawer state for inspecting kitchen
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectActiveSubTab, setInspectActiveSubTab] = useState<"items" | "shopping" | "crew" | "logs">("items");

  // Clipboard copy feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    dispatch(fetchPlatformStats());
    dispatch(fetchAllKitchens({ limit: 50 }));
    dispatch(fetchAllUsers({ limit: 50 }));
    dispatch(fetchAuditLogs({ limit: 50 }));

    return () => {
      dispatch(clearSuperAdminError());
      dispatch(clearSuperAdminMessage());
    };
  }, [dispatch]);

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setAnnouncementText(settings.announcementText || "");
      setAnnouncementActive(Boolean(settings.announcementActive));
      setAnnouncementLevel(settings.announcementLevel || "info");
      setMaintenanceMode(Boolean(settings.maintenanceMode));
    }
  }, [settings]);

  // Handle Kitchen Search
  const handleKitchenSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchAllKitchens({ search: kitchenSearch.trim(), limit: 50 }));
  };

  // Handle User Search
  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      fetchAllUsers({
        search: userSearch.trim(),
        role: userRoleFilter !== "all" ? userRoleFilter : undefined,
        limit: 50,
      })
    );
  };

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Deep inspect kitchen trigger
  const handleInspectKitchen = async (kitchenId: string) => {
    setInspectModalOpen(true);
    setInspectActiveSubTab("items");
    await dispatch(inspectKitchen(kitchenId));
  };

  // Delete kitchen trigger
  const handleDeleteKitchen = async (kitchenId: string, kitchenName: string) => {
    const confirmation = window.prompt(
      `⚠️ PERMANENT DELETION\n\nTo delete kitchen "${kitchenName}" and ALL of its pantry items, market lists, and member links, type "${kitchenId}" below:`
    );
    if (confirmation === kitchenId) {
      await dispatch(deleteKitchenSuperAdmin(kitchenId));
      dispatch(fetchPlatformStats());
    } else if (confirmation !== null) {
      alert("Verification code mismatch. Kitchen deletion canceled.");
    }
  };

  // Toggle user suspension
  const handleToggleUserSuspension = async (userId: string, userEmail: string, currentStatus: boolean) => {
    const action = currentStatus ? "ACTIVATE" : "SUSPEND";
    if (window.confirm(`Are you sure you want to ${action} user "${userEmail}"?`)) {
      await dispatch(toggleUserSuspension(userId));
    }
  };

  // Update user role
  const handleRoleChange = async (userId: string, newRole: string) => {
    await dispatch(updateUserRole({ userId, role: newRole }));
  };

  // Save Announcement & Maintenance Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      updatePlatformSettings({
        announcementText,
        announcementActive,
        announcementLevel,
        maintenanceMode,
      })
    );
  };

  // Trigger Database Cleanup
  const handleTriggerCleanup = async () => {
    if (window.confirm("Run system cleanup? This will safely prune expired OTPs (>10m) and clean orphaned items.")) {
      await dispatch(runSystemCleanup());
      dispatch(fetchPlatformStats());
    }
  };

  // Filtered audit logs
  const filteredLogs = useMemo(() => {
    if (logActionFilter === "all") return logs;
    return logs.filter((l) => l.action === logActionFilter);
  }, [logs, logActionFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* ==================================================================== */}
      {/* 1. TOP EXECUTIVE BAR                                                 */}
      {/* ==================================================================== */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 font-black">
            <FaCrown />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-lg sm:text-xl text-white tracking-tight">
                CookTrack
              </span>
              <span className="bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Super Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Root Platform Command Center & Fleet Telemetry
            </p>
          </div>
        </div>

        {/* User Info & Quick Links */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-white">{user?.username || "Ritik Mehta"}</p>
            <p className="text-[11px] font-mono text-amber-400/90">{user?.email || "Super Administrator"}</p>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <FiHome className="text-emerald-400" />
            <span className="hidden sm:inline">Kitchen Hub</span>
          </Link>
        </div>
      </header>

      {/* Feedback Notifications */}
      {message && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/40 text-emerald-300 px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-emerald-400 text-base shrink-0" />
            <span>{message}</span>
          </div>
          <button
            onClick={() => dispatch(clearSuperAdminMessage())}
            className="text-emerald-400 hover:text-emerald-200 p-1"
          >
            <FiX />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/15 border-b border-red-500/40 text-red-300 px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-red-400 text-base shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearSuperAdminError())}
            className="text-red-400 hover:text-red-200 p-1"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. NAVIGATION TABS                                                  */}
      {/* ==================================================================== */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-2 py-2.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FiActivity className="text-base" />
            <span>Overview & Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("kitchens")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === "kitchens"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FiHome className="text-base" />
            <span>Kitchen Fleet</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "kitchens" ? "bg-slate-950 text-amber-300" : "bg-slate-800 text-slate-300"
              }`}
            >
              {kitchensTotal || kitchens.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === "users"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FaUsers className="text-base" />
            <span>User Directory</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "users" ? "bg-slate-950 text-amber-300" : "bg-slate-800 text-slate-300"
              }`}
            >
              {usersTotal || users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === "logs"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FiClock className="text-base" />
            <span>Platform Audit Logs</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "logs" ? "bg-slate-950 text-amber-300" : "bg-slate-800 text-slate-300"
              }`}
            >
              {logsTotal || logs.length}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MAIN DASHBOARD CONTENT                                            */}
      {/* ==================================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================================================================ */}
        {/* TAB 1: OVERVIEW & TELEMETRY                                      */}
        {/* ================================================================ */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Total Kitchens */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Kitchens
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-lg">
                    <FiHome />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">
                  {stats?.totalKitchens ?? kitchensTotal ?? 0}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span>Avg.</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    {stats?.totalKitchens && stats?.totalUsers
                      ? (stats.totalUsers / stats.totalKitchens).toFixed(1)
                      : "1.0"}
                  </span>
                  <span>members / kitchen</span>
                </p>
              </div>

              {/* Card 2: Total Users */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Registered Users
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-lg">
                    <FaUsers />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">
                  {stats?.totalUsers ?? usersTotal ?? 0}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300 font-semibold font-mono">
                    {stats?.activeUsers24h ?? 0}
                  </span>
                  <span>active today</span>
                </p>
              </div>

              {/* Card 3: Food Rescued in ₹ */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Food Rescued
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-lg">
                    <FaIndianRupeeSign />
                  </div>
                </div>
                <p className="text-3xl font-black text-amber-400 mt-3 font-mono">
                  ₹{stats?.moneySaved?.toLocaleString() ?? "0"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="text-emerald-400 font-semibold font-mono">
                    {stats?.itemsConsumed ?? 0}
                  </span>{" "}
                  consumed vs{" "}
                  <span className="text-rose-400 font-semibold font-mono">
                    {stats?.itemsWasted ?? 0}
                  </span>{" "}
                  wasted
                </p>
              </div>

              {/* Card 4: Platform Eco-Score */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Platform Eco-Score
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center text-lg">
                    <FaLeaf />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <p className="text-3xl font-black text-teal-400 font-mono">
                    {stats?.platformEcoScore ?? 85}%
                  </p>
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wide">
                    Excellent
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Across{" "}
                  <span className="text-slate-200 font-semibold font-mono">
                    {stats?.totalItems ?? 0}
                  </span>{" "}
                  live pantry items
                </p>
              </div>
            </div>

            {/* Middle Row: Global Storage Breakdown & System Maintenance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Global Storage Distribution */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FiLayers className="text-amber-400" />
                    <span>Global Pantry Storage Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time distribution of supplies across Fridge, Freezer, and Shelf zones.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Fridge */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-blue-300 flex items-center gap-1.5">
                        <span>❄️ Refrigerator</span>
                      </span>
                      <span className="font-mono text-slate-300">
                        {stats?.storageDistribution?.fridge ?? 0} items
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((stats?.storageDistribution?.fridge ?? 0) /
                              Math.max(1, stats?.totalItems ?? 1)) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Freezer */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-cyan-300 flex items-center gap-1.5">
                        <span>🧊 Deep Freezer</span>
                      </span>
                      <span className="font-mono text-slate-300">
                        {stats?.storageDistribution?.freezer ?? 0} items
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((stats?.storageDistribution?.freezer ?? 0) /
                              Math.max(1, stats?.totalItems ?? 1)) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Pantry Shelf */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-300 flex items-center gap-1.5">
                        <span>🥫 Dry Pantry Shelf</span>
                      </span>
                      <span className="font-mono text-slate-300">
                        {stats?.storageDistribution?.pantry ?? 0} items
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((stats?.storageDistribution?.pantry ?? 0) /
                              Math.max(1, stats?.totalItems ?? 1)) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Micro Metrics Row */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Pantry Items</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{stats?.totalItems ?? 0}</p>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">Market Cart Items</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{stats?.totalShoppingItems ?? 0}</p>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Action Logs</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{stats?.totalLogs ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): System Health & Database Pruner */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FiDatabase className="text-emerald-400" />
                    <span>Platform Telemetry & Database Pruning</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live server runtime stats and database optimization controls.
                  </p>
                </div>

                <div className="space-y-3 bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      MongoDB Atlas (Online)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Server Runtime</span>
                    <span className="text-slate-200">Node {stats?.nodeVersion || "v20+"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Process Uptime</span>
                    <span className="text-slate-200">
                      {Math.floor((stats?.serverUptime ?? 120) / 60)} minutes
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTriggerCleanup}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 active:scale-95 text-white border border-slate-600 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <FiRefreshCw className={actionLoading ? "animate-spin text-amber-400" : "text-amber-400"} />
                    <span>Run Database Prune (OTPs & Orphaned Items)</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    Safely removes expired OTP tokens older than 10 mins and cleans deleted references.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Global Announcement & Maintenance Mode Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FiRadio className="text-amber-400" />
                    <span>Global Platform Announcement & Maintenance</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Broadcast a live banner to all logged-in household dashboards across the platform.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <span className={maintenanceMode ? "text-red-400 font-bold" : "text-slate-400"}>
                      Maintenance Mode Lock
                    </span>
                  </label>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Announcement Message
                  </label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="e.g. Scheduled maintenance tonight at 2:00 AM IST. All services will remain uninterrupted."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Active Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={announcementActive}
                        onChange={(e) => setAnnouncementActive(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                      <span className={announcementActive ? "text-amber-400 font-bold" : "text-slate-400"}>
                        {announcementActive ? "Active (Broadcasting)" : "Inactive (Draft)"}
                      </span>
                    </label>

                    {/* Level Picker */}
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      {(["info", "warning", "critical"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setAnnouncementLevel(lvl)}
                          className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition cursor-pointer ${
                            announcementLevel === lvl
                              ? lvl === "info"
                                ? "bg-emerald-600 text-white"
                                : lvl === "warning"
                                ? "bg-amber-600 text-white"
                                : "bg-red-600 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md shadow-amber-400/20 cursor-pointer"
                  >
                    Save & Broadcast
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: MASTER KITCHEN FLEET                                      */}
        {/* ================================================================ */}
        {activeTab === "kitchens" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiHome className="text-amber-400" />
                  <span>Master Kitchen Fleet ({kitchensTotal || kitchens.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect live pantries, check member crews, and manage kitchens across the platform.
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleKitchenSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={kitchenSearch}
                    onChange={(e) => setKitchenSearch(e.target.value)}
                    placeholder="Search by 6-char code or name..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-700 transition"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Kitchens Table (Desktop) / Cards (Mobile) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Invite Code</th>
                      <th className="py-3.5 px-4">Kitchen Name</th>
                      <th className="py-3.5 px-4">Admin Owner</th>
                      <th className="py-3.5 px-4 text-center">Crew</th>
                      <th className="py-3.5 px-4 text-center">Pantry Items</th>
                      <th className="py-3.5 px-4 text-center">Cart</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {kitchens.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          {loading ? "Loading kitchens fleet..." : "No kitchens found matching your search."}
                        </td>
                      </tr>
                    ) : (
                      kitchens.map((k) => (
                        <tr key={k._id} className="hover:bg-slate-800/40 transition">
                          {/* Code */}
                          <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-amber-400">
                            <button
                              type="button"
                              onClick={() => handleCopyCode(k.kitchenId)}
                              className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-amber-400/30 hover:border-amber-400 transition cursor-pointer"
                              title="Click to copy invite code"
                            >
                              <span>{k.kitchenId}</span>
                              {copiedCode === k.kitchenId ? (
                                <FaCheck className="text-emerald-400 text-xs" />
                              ) : (
                                <FiCopy className="text-slate-500 text-xs" />
                              )}
                            </button>
                          </td>

                          {/* Name */}
                          <td className="py-3.5 px-4 font-bold text-white max-w-[180px] truncate">
                            {k.kitchenName}
                          </td>

                          {/* Admin */}
                          <td className="py-3.5 px-4">
                            {k.admin ? (
                              <div>
                                <p className="font-semibold text-slate-200">{k.admin.name}</p>
                                <p className="text-[11px] text-slate-400 font-mono">{k.admin.email}</p>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">None</span>
                            )}
                          </td>

                          {/* Crew Count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2 py-0.5 rounded-full font-mono">
                              <FaUsers className="text-[10px]" />
                              <span>{k.membersCount}</span>
                            </span>
                          </td>

                          {/* Items Count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2 py-0.5 rounded-full font-mono">
                              <FiBox className="text-[10px]" />
                              <span>{k.itemsCount}</span>
                            </span>
                          </td>

                          {/* Shopping Count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold px-2 py-0.5 rounded-full font-mono">
                              <FiShoppingCart className="text-[10px]" />
                              <span>{k.shoppingItemsCount}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleInspectKitchen(k.kitchenId)}
                                className="inline-flex items-center gap-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                <FiEye />
                                <span>Inspect</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteKitchen(k.kitchenId, k.kitchenName)}
                                className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                                title="Delete kitchen and all contents"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: MASTER USER DIRECTORY                                     */}
        {/* ================================================================ */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaUsers className="text-amber-400" />
                  <span>Master User Directory ({usersTotal || users.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage accounts, suspend abusive logins, and promote trusted administrators.
                </p>
              </div>

              {/* Search & Filter Form */}
              <form onSubmit={handleUserSearchSubmit} className="flex flex-wrap items-center gap-2 max-w-md w-full">
                <div className="relative flex-1 min-w-[160px]">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    dispatch(
                      fetchAllUsers({
                        search: userSearch.trim(),
                        role: e.target.value !== "all" ? e.target.value : undefined,
                        limit: 50,
                      })
                    );
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 transition cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="User">User</option>
                  <option value="KitchenAdmin">KitchenAdmin</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>

                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-700 transition"
                >
                  Filter
                </button>
              </form>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">User</th>
                      <th className="py-3.5 px-4">Contact Phone</th>
                      <th className="py-3.5 px-4">Assigned Kitchen</th>
                      <th className="py-3.5 px-4">Platform Role</th>
                      <th className="py-3.5 px-4 text-center">Account Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          {loading ? "Loading users directory..." : "No users found matching query."}
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/40 transition">
                          {/* User info */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <p className="font-bold text-white">{u.userName}</p>
                            <p className="text-xs text-slate-400 font-mono">{u.userEmail}</p>
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {u.phoneNumber || <span className="text-slate-600">—</span>}
                          </td>

                          {/* Kitchen */}
                          <td className="py-3.5 px-4">
                            {u.kitchenId ? (
                              <span className="font-mono text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                {u.kitchenId}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">None</span>
                            )}
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role || "User"}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition cursor-pointer ${
                                u.role === "SuperAdmin"
                                  ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                                  : u.role === "KitchenAdmin"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              <option value="User">User</option>
                              <option value="KitchenAdmin">KitchenAdmin</option>
                              <option value="SuperAdmin">👑 SuperAdmin</option>
                            </select>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {u.isSuspended ? (
                              <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                Active
                              </span>
                            )}
                          </td>

                          {/* Moderation Actions */}
                          <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleUserSuspension(u._id, u.userEmail, u.isSuspended)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                u.isSuspended
                                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                              }`}
                            >
                              {u.isSuspended ? <FiUserCheck /> : <FiUserX />}
                              <span>{u.isSuspended ? "Unsuspend" : "Suspend"}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: PLATFORM AUDIT LOGS                                       */}
        {/* ================================================================ */}
        {activeTab === "logs" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiClock className="text-amber-400" />
                  <span>Platform Activity & Audit Logs ({logsTotal || logs.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live feed of food consumption, waste records, and pantry restock actions across kitchens.
                </p>
              </div>

              {/* Action Filter */}
              <div className="flex items-center gap-2">
                {(["all", "consumed", "wasted", "restocked"] as const).map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setLogActionFilter(act)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      logActionFilter === act
                        ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* Logs List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden shadow-sm">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs sm:text-sm">
                  No activity logs found for action "{logActionFilter}".
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                          log.action === "consumed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : log.action === "wasted"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {log.action === "consumed" ? "🍽️" : log.action === "wasted" ? "🗑️" : "📦"}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{log.productName}</span>
                          <span className="text-xs text-slate-400">
                            ({log.quantity} {log.unit})
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                              log.action === "consumed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : log.action === "wasted"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {log.action}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Logged by <span className="text-slate-200 font-semibold">{log.userName}</span> in kitchen{" "}
                          <span className="font-mono text-amber-400/90">{log.kitchenId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono text-xs text-slate-400">
                      <p className="text-amber-300 font-bold">
                        {log.action === "wasted" ? "-" : "+"}₹{log.estimatedCost || 150}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* 4. DEEP INSPECT KITCHEN MODAL / DRAWER                               */}
      {/* ==================================================================== */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center text-lg">
                  <FiEye />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {inspectedKitchen?.kitchen?.kitchenName || "Inspecting Kitchen"}
                    </h3>
                    <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-amber-400 font-bold border border-slate-700">
                      {inspectedKitchen?.kitchen?.kitchenId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Admin:{" "}
                    <span className="text-slate-200">
                      {inspectedKitchen?.kitchen?.kitchenAdminId?.userName || "N/A"}
                    </span>{" "}
                    ({inspectedKitchen?.kitchen?.kitchenAdminId?.userEmail || "N/A"})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInspectModalOpen(false);
                  dispatch(clearInspectedKitchen());
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="border-b border-slate-800 bg-slate-900 px-5 flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setInspectActiveSubTab("items")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
                  inspectActiveSubTab === "items"
                    ? "bg-slate-950 text-amber-400 border-t border-x border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🥫 Pantry Inventory ({inspectedKitchen?.items?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setInspectActiveSubTab("shopping")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
                  inspectActiveSubTab === "shopping"
                    ? "bg-slate-950 text-amber-400 border-t border-x border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🛒 Market List ({inspectedKitchen?.shoppingItems?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setInspectActiveSubTab("crew")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
                  inspectActiveSubTab === "crew"
                    ? "bg-slate-950 text-amber-400 border-t border-x border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                👥 Crew Members ({inspectedKitchen?.kitchen?.kitchenMembersIds?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setInspectActiveSubTab("logs")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
                  inspectActiveSubTab === "logs"
                    ? "bg-slate-950 text-amber-400 border-t border-x border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📜 Recent Activity ({inspectedKitchen?.logs?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-950">
              {inspectLoading ? (
                <div className="py-20 text-center flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400">Loading live kitchen data...</p>
                </div>
              ) : (
                <>
                  {/* Sub-tab 1: Pantry Items */}
                  {inspectActiveSubTab === "items" && (
                    <div className="space-y-3">
                      {inspectedKitchen?.items?.length === 0 ? (
                        <p className="text-slate-500 text-center py-12 text-xs">Pantry is currently empty.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {inspectedKitchen?.items?.map((item: any) => (
                            <div
                              key={item._id}
                              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-white text-sm">{item.productName}</h4>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                  {item.storageLocation || "Pantry"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono">
                                Quantity: <span className="text-amber-400 font-bold">{item.quantity} {item.unit}</span>
                              </p>
                              {item.expiryDate && (
                                <p className="text-[11px] text-slate-500">
                                  Expires: {new Date(item.expiryDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 2: Shopping Cart */}
                  {inspectActiveSubTab === "shopping" && (
                    <div className="space-y-2">
                      {inspectedKitchen?.shoppingItems?.length === 0 ? (
                        <p className="text-slate-500 text-center py-12 text-xs">Shopping list is empty.</p>
                      ) : (
                        inspectedKitchen?.shoppingItems?.map((s: any) => (
                          <div
                            key={s._id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                          >
                            <div>
                              <p className={`text-sm font-bold ${s.isBought ? "line-through text-slate-500" : "text-white"}`}>
                                {s.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                Needed: {s.neededQuantity} {s.unit}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                                s.isBought ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {s.isBought ? "Purchased" : "Pending"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Sub-tab 3: Crew */}
                  {inspectActiveSubTab === "crew" && (
                    <div className="space-y-2">
                      {inspectedKitchen?.kitchen?.kitchenMembersIds?.map((m: any) => (
                        <div
                          key={m._id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-bold text-white">{m.userName}</p>
                            <p className="text-xs text-slate-400 font-mono">{m.userEmail} • {m.phoneNumber}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                            {m.role || "Member"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-tab 4: Logs */}
                  {inspectActiveSubTab === "logs" && (
                    <div className="space-y-2">
                      {inspectedKitchen?.logs?.map((l: any) => (
                        <div
                          key={l._id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{l.productName}</span>{" "}
                            <span className="text-slate-400">was marked as {l.action}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">By {l.userName}</p>
                          </div>
                          <span className="font-mono text-slate-400">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
