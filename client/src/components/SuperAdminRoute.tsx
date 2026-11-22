import { type ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

type SuperAdminRouteProps = {
  children: ReactNode;
};

const SuperAdminRoute = ({ children }: SuperAdminRouteProps) => {
  const { isAuthenticated, role, user, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-400 font-mono text-sm tracking-wide">
            Verifying Super Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const isOwnerEmail =
    user?.email && user.email.toLowerCase() === "ritikmehta9835@gmail.com";
  const isSuperAdmin = role === "SuperAdmin" || isOwnerEmail;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/40 rounded-2xl flex items-center justify-center text-red-400 text-3xl">
            <FiAlertTriangle />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Super Admin Access Restricted
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This command center requires root platform administrator privileges.
              Your account (<span className="text-amber-400 font-mono">{user?.email || "User"}</span>) is registered as{" "}
              <span className="font-semibold text-slate-200">{role || "Standard User"}</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm"
            >
              <FiArrowLeft />
              <span>Return to Kitchen Hub</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default SuperAdminRoute;
