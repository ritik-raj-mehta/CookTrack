import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaCartPlus, FaHome } from "react-icons/fa";
import { FiActivity, FiCodesandbox, FiCopy, FiCheck, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { FaPeopleGroup, FaCrown } from "react-icons/fa6";
import { LuChefHat } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";
import { logout } from "../stores/slices/AuthSlice";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const { Sider } = Layout;

const NavBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const { isDark } = useTheme();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { kitchenId, role, user } = useSelector((state: RootState) => state.auth);
  const { kitchenData } = useSelector((state: RootState) => state.kitchen);

  const isSuperAdmin =
    role === "SuperAdmin" ||
    (user?.email && user.email.toLowerCase() === "ritikmehta9835@gmail.com");

  const pathToKey: Record<string, string> = {
    "/dashboard": "1",
    "/kitchenitems": "2",
    "/additemstokitchen": "3",
    "/additemstoshoppingcart": "4",
    "/kitchenmembers": "5",
    "/insights": "6",
  };

  const selectedKey = pathToKey[location.pathname] || "1";

  const handleCopyInvite = () => {
    if (kitchenId) {
      navigator.clipboard.writeText(kitchenId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  const mobileBottomNav = [
    { to: "/dashboard", icon: <FaHome className="text-xl" />, label: "Hub" },
    { to: "/kitchenitems", icon: <FiCodesandbox className="text-xl" />, label: "Pantry" },
    { to: "/additemstokitchen", icon: <IoMdAdd className="text-2xl" />, label: "Restock", isAction: true },
    { to: "/additemstoshoppingcart", icon: <FaCartPlus className="text-xl" />, label: "Market" },
    { to: "/insights", icon: <FiActivity className="text-xl" />, label: "Insights" },
  ];

  const fullNavItems = [
    { to: "/dashboard", icon: <FaHome className="text-lg text-emerald-500" />, label: "Kitchen Hub" },
    { to: "/kitchenitems", icon: <FiCodesandbox className="text-lg text-amber-500" />, label: "Pantry" },
    { to: "/additemstokitchen", icon: <IoMdAdd className="text-lg text-green-500" />, label: "Restock" },
    { to: "/additemstoshoppingcart", icon: <FaCartPlus className="text-lg text-blue-500" />, label: "Market List" },
    { to: "/insights", icon: <FiActivity className="text-lg text-teal-500" />, label: "Insights" },
    { to: "/kitchenmembers", icon: <FaPeopleGroup className="text-lg text-indigo-500" />, label: "Kitchen Crew" },
  ];

  return (
    <>
      {/* ==================================================================== */}
      {/* 1. DESKTOP & TABLET SIDEBAR (VISIBLE ON md: SCREEN AND ABOVE)       */}
      {/* ==================================================================== */}
      <div className="hidden md:block shrink-0">
        <Sider
          style={{
            background: colorBgContainer,
            minHeight: "100vh",
            boxShadow: isDark
              ? "1px 0 12px 0 rgba(0, 0, 0, 0.4)"
              : "1px 0 12px 0 rgba(0, 0, 0, 0.04)",
            zIndex: 20,
            borderRight: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={230}
          collapsedWidth={80}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Top Header Row with Logo & Collapse Button */}
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center" : "justify-between"
                } px-4 py-4 border-b border-gray-100 dark:border-slate-800/80 min-h-[68px] transition-all`}
              >
                {!collapsed ? (
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="bg-gradient-to-tr from-green-600 to-emerald-400 text-white p-2 rounded-xl text-xl shadow-xs">
                      <LuChefHat />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-lg font-bold font-serif text-gray-900 dark:text-white tracking-tight truncate flex items-center">
                        CookTrack
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-400 font-semibold uppercase tracking-wider">
                        Kitchen System
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-tr from-green-600 to-emerald-400 text-white p-2 rounded-xl text-xl shadow-xs">
                    <LuChefHat />
                  </div>
                )}

                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                  style={{ fontSize: "16px" }}
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                />
              </div>

              {/* Navigation Menu */}
              <div className="py-3">
                <Menu
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    borderRight: 0,
                    background: "transparent",
                  }}
                  theme={isDark ? "dark" : "light"}
                  mode="inline"
                  selectedKeys={[selectedKey]}
                  items={[
                    {
                      key: "1",
                      icon: <FaHome className="text-lg text-emerald-500" />,
                      label: <NavLink to="/dashboard">Kitchen Hub</NavLink>,
                    },
                    {
                      key: "2",
                      icon: <FiCodesandbox className="text-lg text-amber-500" />,
                      label: <NavLink to="/kitchenitems">Pantry</NavLink>,
                    },
                    {
                      key: "3",
                      icon: <IoMdAdd className="text-lg text-green-500" />,
                      label: <NavLink to="/additemstokitchen">Restock</NavLink>,
                    },
                    {
                      key: "4",
                      icon: <FaCartPlus className="text-lg text-blue-500" />,
                      label: <NavLink to="/additemstoshoppingcart">Market List</NavLink>,
                    },
                    {
                      key: "5",
                      icon: <FaPeopleGroup className="text-lg text-indigo-500" />,
                      label: <NavLink to="/kitchenmembers">Kitchen Crew</NavLink>,
                    },
                    {
                      key: "6",
                      icon: <FiActivity className="text-lg text-teal-500" />,
                      label: <NavLink to="/insights">Insights</NavLink>,
                    },
                  ]}
                />
              </div>
            </div>

            <div>
              {/* Super Admin Controls */}
              {isSuperAdmin && (
                <div className="p-3 border-t border-gray-100 dark:border-slate-800/80">
                  <NavLink
                    to="/superadmin"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs transition shadow-xs"
                  >
                    <FaCrown className="text-sm shrink-0" />
                    {!collapsed && <span className="truncate">Super Admin</span>}
                  </NavLink>
                </div>
              )}

              {/* Bottom status badge */}
              {!collapsed && (
                <div className="p-4 border-t border-gray-100 dark:border-slate-800/80 space-y-2">
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl p-3 flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <div className="text-xs">
                      <p className="font-semibold text-emerald-900 dark:text-emerald-300">Inventory Live</p>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/70">Cloud Sync Active</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Sider>
      </div>

      {/* ==================================================================== */}
      {/* 2. MOBILE TOP APP BAR (ONLY ON md:hidden)                           */}
      {/* ==================================================================== */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-2xs transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-green-600 to-emerald-400 text-white p-1.5 rounded-xl text-lg shadow-xs">
            <LuChefHat />
          </div>
          <div>
            <span className="text-base font-bold font-serif text-gray-900 dark:text-white tracking-tight flex items-center">
              CookTrack
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
            </span>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[150px]">
              {kitchenData?.kitchenName || "Kitchen"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <ThemeToggle />

          {kitchenId && (
            <button
              type="button"
              onClick={handleCopyInvite}
              className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/90 dark:border-amber-800 text-amber-900 dark:text-amber-300 px-2 py-1 rounded-lg text-xs font-mono font-bold active:scale-95 transition"
              title="Copy Invite Code"
            >
              {copiedCode ? <FiCheck className="text-emerald-600 dark:text-emerald-400" /> : <FiCopy className="text-xs" />}
              <span>{copiedCode ? "Copied" : kitchenId}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            aria-label="Open mobile menu"
          >
            <FiMenu className="text-xl" />
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 3. MOBILE SLIDE-OUT DRAWER MENU                                     */}
      {/* ==================================================================== */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMobileDrawerOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-slideIn border-r border-gray-100 dark:border-slate-800 transition-colors">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-gradient-to-tr from-green-600 to-emerald-400 text-white p-2 rounded-xl text-xl shadow-xs">
                    <LuChefHat />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-serif text-gray-900 dark:text-white">CookTrack</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-400 uppercase tracking-wider font-semibold">
                      Mobile Menu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* Kitchen Badge Card */}
              {kitchenData && (
                <div className="p-4 pb-2">
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                      Active Kitchen
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">
                      {kitchenData.kitchenName}
                    </p>
                    {kitchenId && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-100/80 dark:border-emerald-900/60 text-xs">
                        <span className="text-gray-500 dark:text-slate-400 font-mono text-[11px]">Code: {kitchenId}</span>
                        <button
                          type="button"
                          onClick={handleCopyInvite}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          {copiedCode ? "Copied!" : "Copy Code"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nav Links */}
              <nav className="p-3 space-y-1">
                {fullNavItems.map((item, idx) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={idx}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-2xs"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-700"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Super Admin Drawer Link */}
              {isSuperAdmin && (
                <div className="px-4 py-2">
                  <NavLink
                    to="/superadmin"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition shadow-xs"
                  >
                    <FaCrown className="text-base" />
                    <span>👑 Super Admin Command Center</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Bottom Actions: Sign-out */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold text-xs transition active:scale-95 cursor-pointer border border-red-200/60 dark:border-red-900/60"
              >
                <FiLogOut className="text-sm" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. MOBILE BOTTOM APP BAR (THUMB-FRIENDLY QUICK NAVIGATION)           */}
      {/* ==================================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-200/90 dark:border-slate-800 shadow-lg px-2 py-1.5 flex items-center justify-around transition-colors">
        {mobileBottomNav.map((tab, idx) => {
          const isActive = location.pathname === tab.to;
          if (tab.isAction) {
            return (
              <NavLink
                key={idx}
                to={tab.to}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 active:scale-90 transition transform">
                  {tab.icon}
                </div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
                  {tab.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={idx}
              to={tab.to}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[54px] ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 active:scale-95"
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default NavBar;
