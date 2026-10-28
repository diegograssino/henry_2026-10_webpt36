import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/config";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Listener propio del guard: espera a que Firebase responda si hay sesion
  // antes de decidir si redirige o deja pasar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsAuthenticated(Boolean(currentUser));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Todavia no sabemos si hay sesion: todavia no redirigir
  if (loading) {
    return <p>Cargando...</p>;
  }

  // Sin sesion: mandar al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
