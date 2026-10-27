import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
// FASE 2 - Importar funciones de autenticación de Firebase
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
// FASE 2 - Importar instancias de auth y googleProvider configuradas en Fase 1
import { auth, googleProvider } from "../../../firebase/config";
// FASE 5 - Función que traduce el error de Firebase a un mensaje en español
import { getAuthErrorMessage } from "../../../utils/firebaseErrors.ts";

export interface RegisterFormValues {
  email: string;
  password: string;
}

export interface RegisterFormErrors {
  email: string | null;
  password: string | null;
}

export interface RegisterFormTouched {
  email: boolean;
  password: boolean;
}

const INITIAL_VALUES: RegisterFormValues = {
  email: "",
  password: "",
};

const INITIAL_ERRORS: RegisterFormErrors = {
  email: null,
  password: null,
};

const INITIAL_TOUCHED: RegisterFormTouched = {
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

export const RegisterForm: React.FC = () => {
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterFormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<RegisterFormTouched>(INITIAL_TOUCHED);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // FASE 2 - Estado separado para el registro con Google, para no mezclar el
  // texto del botón del form con el del popup
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  // FASE 2 - Hook de navegación para redirigir tras el registro exitoso
  const navigate = useNavigate();

  const isFormInvalid = Boolean(
    validateEmail(values.email) || validatePassword(values.password),
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
      // FASE 2 - Crear usuario con email y contraseña en Firebase Auth
      // FASE 2 - Crear usuario con email y contraseña en Firebase Auth
      await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // FASE 2 - Redirigir al inicio tras registro exitoso
      navigate("/");
    } catch (error) {
      console.error("Error en el registro:", error);
      // FASE 5 - Mostrar el mensaje según el código de error de Firebase
      alert(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // FASE 2 - Handler para registro con Google via popup
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      // FASE 2 - Redirigir al inicio tras login con Google exitoso
      navigate("/");
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
      <h2>Registrarse</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="register-email">Email:</label>
          <br />
          <input
            id="register-email"
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
          <label htmlFor="register-password">Contraseña:</label>
          <br />
          <input
            id="register-password"
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
          {isSubmitting ? "Registrando..." : "Registrarme"}
        </button>
      </form>

      {/* FASE 2 - Botón alternativo de registro con Google */}
      <hr />
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || isGoogleLoading}
      >
        {isGoogleLoading ? "Conectando con Google..." : "Registrarse con Google"}
      </button>

      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
};

export default RegisterForm;
