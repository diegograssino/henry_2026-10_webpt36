import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ui/ProtectedRoute/ProtectedRoute";
import Home from "./components/views/Home/Home";
import Protected from "./components/views/Protected/Protected";
import { LoginForm } from "./components/views/Login/LoginForm";
import { RegisterForm } from "./components/views/Register/RegisterForm";
import Layout from "./layout";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegisterForm />} />
          {/* FASE 4 - El guard lee la sesión del Context, ya no recibe props */}
          <Route element={<ProtectedRoute />}>
            <Route path="protected" element={<Protected />} />
          </Route>
          <Route path="*" element={<h1>404 - Pagina no encontrada</h1>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
