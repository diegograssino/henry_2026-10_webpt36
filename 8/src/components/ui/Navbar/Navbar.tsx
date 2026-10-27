import { Link } from "react-router";
import { useAuth } from "../../../contexts/AuthContext.tsx";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

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
          <button onClick={logout}>Cerrar sesion</button>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
