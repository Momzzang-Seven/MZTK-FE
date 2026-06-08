import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@store";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute = ({
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const accessToken = useUserStore((state) => state.accessToken);
  const user = useUserStore((state) => state.user);

  if (!isAuthenticated || !accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
