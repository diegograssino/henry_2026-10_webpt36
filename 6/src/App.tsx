import { useState } from "react";
import { Route, Routes } from "react-router";
import ProtectedRoute from "../components/ui/ProtectedRoute/ProtectedRoute";
import About from "../components/views/About/About";
import Home from "../components/views/Home/Home";
import Params from "../components/views/Params/Params";
import Protected from "../components/views/Protected/Protected";
import Layout from "./layout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticated = () => {
    setIsAuthenticated((prev) => !prev);
  };

  return (
    <>
      <Routes>
        <Route
          element={
            <Layout
              isAuthenticated={isAuthenticated}
              handleAuthenticated={handleAuthenticated}
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="params" element={<Params />} />
          <Route path="params/:id" element={<Params />} />
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="protected" element={<Protected />} />
          </Route>
          <Route path="*" element={<h1>404 - Pagina no encontrada</h1>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
