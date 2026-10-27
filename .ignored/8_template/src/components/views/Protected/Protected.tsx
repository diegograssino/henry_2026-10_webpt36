// FASE 4 - La página protegida muestra que hay sesión activa
import { useAuth } from "../../../context/AuthContext.tsx";

const Protected = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Protected</h1>
      {/* FASE 4 - Solo se llega acá si hay sesión activa */}
      <p>Sesión activa: {user?.email}</p>
    </div>
  );
};

export default Protected;
