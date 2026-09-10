import { Navigate } from "react-router-dom";
//import { useAuth } from "../stores/AuthContext";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const {role} = useSelector((state:RootState) => state.auth)
  console.log(role);
  

  if (!role) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
