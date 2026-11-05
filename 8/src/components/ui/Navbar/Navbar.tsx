import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext.tsx";
import Button from "../Button/Button";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <nav>
        <ul className="navbar-links">
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/protected">Protegido</Link>
          </li>
        </ul>
      </nav>

      <div>
        {isAuthenticated ? (
          <Button variant="danger" onClick={() => void logout()}>
            Cerrar sesión
          </Button>
        ) : (
          <Button variant="default" onClick={() => navigate("/login")}>
            Iniciar sesión
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
