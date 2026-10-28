import { useAuth } from "../../../contexts/AuthContext.tsx";

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      <h1>Inicio</h1>
      <p>Bienvenido a la aplicación de demostración de Autenticación.</p>

      {isAuthenticated && <p>Sesión activa: {user?.email}</p>}
    </div>
  );
};

export default Home;
