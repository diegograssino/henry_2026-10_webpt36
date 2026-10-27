import { Outlet } from "react-router";
import Footer from "./components/ui/Footer/Footer";
import Navbar from "./components/ui/Navbar/Navbar";
import "./layout.css";

const Layout = () => {
  return (
    <div className="layout-container">
      {/* FASE 3 - El Navbar ya no necesita recibir isAuthenticated por props */}
      <Navbar />
      <main>
        <Outlet />
      </main>
      <div className="layout-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
