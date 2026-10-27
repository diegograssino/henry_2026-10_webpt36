import { Navigate, Outlet, useLocation } from "react-router";
// FASE 4 - El guard consulta el estado de sesión al Context
import { useAuth } from "../../../context/AuthContext.tsx";

const ProtectedRoute = () => {
  // FASE 4 - Única fuente de verdad: el Context
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // FASE 4 - Sin sesión: redirigir guardando el destino
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
