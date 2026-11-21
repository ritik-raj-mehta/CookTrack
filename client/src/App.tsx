import { Route, Routes, Outlet } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NavBar from "./components/NavBar";
import AddItemsToKitchen from "./pages/AddItemsToKitchen";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterToKitchen from "./pages/RegisterToKitchen";
import KitchenMembers from "./pages/KitchenMembers";
import AddItemsToShoppingCart from "./pages/AddItemsToShoppingCart";
import KitchenItem from "./pages/KitchenItem";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMe, clearError, clearMessage } from "./stores/slices/AuthSlice";
import type { AppDispatch } from "./stores/store";

const Layout = () => (
  <div className="flex min-h-screen w-full bg-gray-100">
    <NavBar />
    <main className="flex-1 min-w-0 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

const App = () => {
   const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
    dispatch(getMe()); // validate session from cookie
  }, [dispatch]);
  return (
    
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
      </Route>
    </Routes>
    
  );
};

export default App;