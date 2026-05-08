import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@store";

const ProtectedRoute = () => {
  // Check for authentication token in store
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const accessToken = useUserStore((state) => state.accessToken);

  // Debug log
  console.log("[ProtectedRoute] Check:", {
    isAuthenticated,
    hasToken: !!accessToken,
    token: accessToken,
  });

  // Trust token existence as fallback if isAuthenticated is false
  if (!isAuthenticated && !accessToken) {
    console.log("[ProtectedRoute] No auth & no token. Redirecting...");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
