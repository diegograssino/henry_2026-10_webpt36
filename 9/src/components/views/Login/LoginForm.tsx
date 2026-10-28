import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import Button from "../../../components/ui/Button/Button";
import { login, loginWithGoogle } from "../../../helpers/auth";
import { getAuthErrorMessage } from "../../../helpers/errors";
import { delayNavigate } from "../../../helpers/navigation";
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
      await login(values.email, values.password);
      toast.success(`Logueado con éxito:\nEmail: ${values.email}`);
      setValues(INITIAL_VALUES);
      setTouched(INITIAL_TOUCHED);
      setErrors(INITIAL_ERRORS);
      await delayNavigate(navigate, "/");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await loginWithGoogle();
      toast.success("Logueado con éxito con Google");
      await delayNavigate(navigate, "/");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
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

        <Button
          type="submit"
          disabled={isFormInvalid || isSubmitting || isGoogleLoading}
        >
          {isSubmitting ? "Enviando..." : "Ingresar"}
        </Button>

        <Button
          type="button"
          variant="google"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
        >
          {isGoogleLoading ? "Cargando..." : "Ingresar con Google"}
        </Button>
      </form>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default LoginForm;
