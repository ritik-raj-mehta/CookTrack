import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe, clearError, clearMessage } from "./stores/slices/AuthSlice";
import type { AppDispatch } from "./stores/store";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";

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

const PageLoader = () => (
  <div className="flex min-h-[60vh] h-full w-full items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent shadow-xs"></div>
      <p className="text-xs font-medium text-slate-400 tracking-wide animate-pulse">
        Loading...
      </p>
    </div>
  </div>
);

const Layout = () => (
  <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50">
    <NavBar />
    <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
      <Outlet />
    </main>
  </div>
);

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
    dispatch(getMe()); // validate session from cookie / silent token refresh
  }, [dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/registertokitchen" element={<RegisterToKitchen />} />

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
  );
};

export default App;
