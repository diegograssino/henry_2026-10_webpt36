import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ToastContainer } from "react-toastify";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
