import { Outlet } from "react-router";
import Footer from "../components/ui/Footer/Footer";
import Navbar from "../components/ui/Navbar/Navbar";

interface LayoutProps {
  isAuthenticated: boolean;
  handleAuthenticated: () => void;
}

const Layout = ({ isAuthenticated, handleAuthenticated }: LayoutProps) => {
  return (
    <>
      {/* Esto es prop drilling, paso componente a comoponente una prop, es complejo de mantener y lo resolvemos luego context */}
      <Navbar
        isAuthenticated={isAuthenticated}
        handleAuthenticated={handleAuthenticated}
      />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
