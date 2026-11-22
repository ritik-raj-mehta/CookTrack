import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ConfigProvider, theme as antdTheme } from "antd";
import { getMe, clearError, clearMessage } from "./stores/slices/AuthSlice";
import type { AppDispatch } from "./stores/store";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import NavBar from "./components/NavBar";
import GlobalAnnouncement from "./components/GlobalAnnouncement";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Lazy-loaded route pages for code-splitting and faster initial page loads
const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const RegisterToKitchen = lazy(() => import("./pages/RegisterToKitchen"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddItemsToKitchen = lazy(() => import("./pages/AddItemsToKitchen"));
const KitchenItem = lazy(() => import("./pages/KitchenItem"));
const KitchenMembers = lazy(() => import("./pages/KitchenMembers"));
const AddItemsToShoppingCart = lazy(() => import("./pages/AddItemsToShoppingCart"));
const KitchenInsights = lazy(() => import("./pages/KitchenInsights"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdmin/SuperAdminDashboard"));

const PageLoader = () => (
  <div className="flex min-h-[60vh] h-full w-full items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent shadow-xs"></div>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wide animate-pulse">
        Loading CookTrack...
      </p>
    </div>
  </div>
);

const Layout = () => (
  <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
    <NavBar />
    <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
      <Outlet />
    </main>
  </div>
);

const ThemedApp = () => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#10b981", // emerald-500
          borderRadius: 12,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          colorBgContainer: isDark ? "#0f172a" : "#ffffff",
          colorBgElevated: isDark ? "#1e293b" : "#ffffff",
          colorBorder: isDark ? "#334155" : "#e2e8f0",
          colorText: isDark ? "#f1f5f9" : "#1f2937",
          colorTextSecondary: isDark ? "#94a3b8" : "#64748b",
        },
      }}
    >
      <GlobalAnnouncement />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/registertokitchen" element={<RegisterToKitchen />} />

          {/* Super Admin Command Center Route */}
          <Route
            path="/superadmin"
            element={
              <SuperAdminRoute>
                <SuperAdminDashboard />
              </SuperAdminRoute>
            }
          />

          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/additemstokitchen"
              element={
                <ProtectedRoute>
                  <AddItemsToKitchen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchenitems"
              element={
                <ProtectedRoute>
                  <KitchenItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchenmembers"
              element={
                <ProtectedRoute>
                  <KitchenMembers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/additemstoshoppingcart"
              element={
                <ProtectedRoute>
                  <AddItemsToShoppingCart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <KitchenInsights />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </ConfigProvider>
  );
};

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
    dispatch(getMe()); // validate session from cookie / silent token refresh
  }, [dispatch]);

  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

export default App;
