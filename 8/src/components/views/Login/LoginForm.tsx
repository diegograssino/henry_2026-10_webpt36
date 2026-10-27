import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { auth, googleProvider } from "../../../firebase/config";
import { getAuthErrorMessage } from "../../../helpers/errors";
import { validateEmail, validatePassword } from "../../../helpers/validations";
import type {
  LoginFormErrors,
  LoginFormTouched,
  LoginFormValues,
} from "../../../types/types";
import {
  INITIAL_ERRORS,
  INITIAL_TOUCHED,
  INITIAL_VALUES,
} from "./LoginForm.const";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<LoginFormTouched>(INITIAL_TOUCHED);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

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
      await signInWithEmailAndPassword(auth, values.email, values.password);
      alert(`Logueado con éxito:\nEmail: ${values.email}`);
      setValues(INITIAL_VALUES);
      setTouched(INITIAL_TOUCHED);
      setErrors(INITIAL_ERRORS);
      navigate("/");
    } catch (error) {
      alert(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithPopup(auth, googleProvider);
      alert(`Logueado con éxito con Google`);
      navigate("/");
    } catch (error) {
      alert(getAuthErrorMessage(error));
    } finally {
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

        <button
          type="submit"
          disabled={isFormInvalid || isSubmitting || isGoogleLoading}
        >
          {isSubmitting ? "Enviando..." : "Ingresar"}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
        >
          {isGoogleLoading ? "Cargando..." : "Ingresar con Google"}
        </button>
      </form>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default LoginForm;
