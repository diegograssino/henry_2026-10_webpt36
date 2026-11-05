import { Link } from "react-router";

interface NavbarProps {
  isAuthenticated: boolean;
  handleAuthenticated: () => void;
}

const Navbar = ({ isAuthenticated, handleAuthenticated }: NavbarProps) => {
  return (
    <header>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/protected">Protected</Link>
        </li>
      </ul>
      <button onClick={handleAuthenticated}>
        {isAuthenticated ? "Logout" : "Login"}
      </button>
    </header>
  );
};

export default Navbar;
