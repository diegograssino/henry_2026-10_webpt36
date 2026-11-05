import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
}

const ProtectedRoute = ({ isAuthenticated }: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    //   Otra opcion a useNavigate
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
