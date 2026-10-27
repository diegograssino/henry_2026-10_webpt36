import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
// FASE 2 - Importar función de login con email/password de Firebase
import { signInWithPopup } from "firebase/auth";
// FASE 2 - Importar instancias de auth y googleProvider configuradas en Fase 1
import { auth, googleProvider } from "../../../firebase/config";
// FASE 3 - El login se hace a través del Context
import { useAuth } from "../../../context/AuthContext.tsx";
// FASE 5 - Función que traduce el error de Firebase a un mensaje en español
import { getAuthErrorMessage } from "../../../utils/firebaseErrors.ts";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email: string | null;
  password: string | null;
}

export interface LoginFormTouched {
  email: boolean;
  password: boolean;
}

const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

const INITIAL_ERRORS: LoginFormErrors = {
  email: null,
  password: null,
};

const INITIAL_TOUCHED: LoginFormTouched = {
  email: false,
  password: false,
};

const validateEmail = (value: string): string | null => {
  if (!value.trim()) {
    return "El email es requerido";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "El formato de email no es válido";
  }
  return null;
};

const validatePassword = (value: string): string | null => {
  if (!value) {
    return "La contraseña es requerida";
  }
  if (value.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  return null;
};

export const LoginForm: React.FC = () => {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<LoginFormTouched>(INITIAL_TOUCHED);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // FASE 2 - Estado separado para el login con Google, para no mezclar el
  // texto del botón del form con el del popup
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  // FASE 2 - Hook de navegación para redirigir tras el login exitoso
  const navigate = useNavigate();
  // FASE 4 - Hook de ubicación: guarda la ruta de destino cuando el guard redirige
  const location = useLocation();
  // FASE 3 - El login se pide al Context
  const { login } = useAuth();

  // FASE 4 - Destino al que volver después del login (lo pasó el guard)
  const from = (location.state as { from?: Location })?.from;

  const isFormInvalid = Boolean(
    validateEmail(values.email) || validatePassword(values.password)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });

    let errorMsg: string | null = null;
    switch (name) {
      case "email":
        errorMsg = validateEmail(value);
        break;
      case "password":
        errorMsg = validatePassword(value);
        break;
      default:
        break;
    }

    setErrors({
      ...errors,
      [name]: errorMsg,
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;

    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // FASE 3 - Autenticar al usuario con email y contraseña a través del Context
      await login(values.email, values.password);

      // FASE 4 - Volver a la ruta de destino (o al inicio si no hubo redirect)
      navigate(from?.pathname ?? "/");
    } catch (error) {
      console.error("Error en el login:", error);
      // FASE 5 - Mostrar el mensaje según el código de error de Firebase
      alert(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // FASE 2 - Handler para login con Google via popup
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      // FASE 4 - Volver a la ruta de destino (o al inicio si no hubo redirect)
      navigate(from?.pathname ?? "/");
    } catch (error) {
      console.error("Error en el login con Google:", error);
      // FASE 5 - Mostrar el mensaje según el código de error de Firebase
      alert(getAuthErrorMessage(error));
    } finally {
      // FASE 2 - Liberar el botón también cuando el login con Google falla
      setIsGoogleLoading(false);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            id="email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="ejemplo@correo.com"
          />
          {touched.email && errors.email && (
            <div>
              <small>{errors.email}</small>
            </div>
          )}
        </div>
        <br />

        <div>
          <label htmlFor="password">Contraseña:</label>
          <br />
          <input
            id="password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="••••••••"
          />
          {touched.password && errors.password && (
            <div>
              <small>{errors.password}</small>
            </div>
          )}
        </div>
        <br />

        <button type="submit" disabled={isFormInvalid || isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {/* FASE 2 - Botón alternativo de login con Google */}
      <hr />
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || isGoogleLoading}
      >
        {isGoogleLoading ? "Conectando con Google..." : "Iniciar sesión con Google"}
      </button>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default LoginForm;
