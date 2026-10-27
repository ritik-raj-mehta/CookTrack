import { Navigate } from "react-router-dom";
//import { useAuth } from "../stores/AuthContext";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, kitchenId } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!kitchenId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
