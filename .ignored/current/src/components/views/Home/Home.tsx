// FASE 3 - Home consume el estado de sesión del Context
import { useAuth } from "../../../context/AuthContext.tsx";

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      <h1>Home</h1>
      <p>Bienvenido a la aplicación de demostración de Autenticación.</p>

      {/* FASE 3 - El estado de sesión llega desde el Context, sin props */}
      {isAuthenticated ? (
        <p>Sesión activa: {user?.email}</p>
      ) : (
        <p>No hay sesión activa.</p>
      )}
    </div>
  );
};

export default Home;
