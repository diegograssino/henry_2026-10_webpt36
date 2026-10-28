import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import Button from "../../../components/ui/Button/Button";
import { register } from "../../../helpers/auth";
import { getAuthErrorMessage } from "../../../helpers/errors";
import { delayNavigate } from "../../../helpers/navigation";
import { validateEmail, validatePassword } from "../../../helpers/validations";
import type {
  RegisterFormErrors,
  RegisterFormTouched,
  RegisterFormValues,
} from "../../../types/types";
import {
  INITIAL_ERRORS,
  INITIAL_TOUCHED,
  INITIAL_VALUES,
} from "./RegisterForm.const";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterFormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<RegisterFormTouched>(INITIAL_TOUCHED);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      await register(values.email, values.password);
      toast.success(`Registro con éxito:\nEmail: ${values.email}`);
      setValues(INITIAL_VALUES);
      setTouched(INITIAL_TOUCHED);
      setErrors(INITIAL_ERRORS);
      await delayNavigate(navigate, "/login");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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

        <Button type="submit" disabled={isFormInvalid || isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrarme"}
        </Button>
      </form>

      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
};
