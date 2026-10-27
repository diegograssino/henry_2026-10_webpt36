import { Link } from "react-router";
import "./Navbar.css";
// FASE 3 - El Navbar consulta el estado de sesión al Context
import { useAuth } from "../../../context/AuthContext.tsx";

const Navbar = () => {
  // FASE 3 - Única fuente de verdad: el Context
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <nav>
        <ul className="navbar-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/protected">Protected</Link>
          </li>
        </ul>
      </nav>

      <div>
        {isAuthenticated ? (
          <>
            <span>{user?.email}</span>
            {/* FASE 3 - Botón para cerrar la sesión */}
            <button type="button" onClick={() => void logout()}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
