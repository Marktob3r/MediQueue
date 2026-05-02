import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import AutoLogout from "./AutoLogout";

interface PrivateRouteProps {
  allowedRoles?: ("patient" | "staff" | "admin")[];
  children: ReactNode;
}

export default function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const { isAuthenticated, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, instantly redirect to the landing page.
    // This perfectly handles the browser back button scenario.
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole as any)) {
    // User doesn't have the right role (e.g., patient trying to access staff page)
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {/* AutoLogout sits invisibly at the layout level of all protected routes */}
      <AutoLogout />
      {children}
    </>
  );
}
