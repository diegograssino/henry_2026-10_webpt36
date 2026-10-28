import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { auth } from "../../../firebase/config.ts";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Listener para saber si alguien se logea o deslogea
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsAuthenticated(Boolean(currentUser));
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Mientras espera que se resuelva la promesa de la autenticacion, muestra loading
  if (isLoading) {
    return <p>Cargando...</p>;
  }

  // Si no esta autenticado, redirecciona a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
