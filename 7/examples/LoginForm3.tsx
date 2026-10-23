import React, { useState } from "react";

export interface LoginFormValues {
  email: string;
  password: string;
}

// CAMBIO RESPECTO A v2:
// Agregamos el shape de errores con la misma estructura que values.
// Si no hay error, el valor es null.
export interface LoginFormErrors {
  email: string | null;
  password: string | null;
}

const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

const INITIAL_ERRORS: LoginFormErrors = {
  email: null,
  password: null,
};

// CAMBIO: Funciones puras de validación por campo.
// Retornan el mensaje de error o null si es válido.
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

export const LoginForm3: React.FC = () => {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);

  // CAMBIO: Nuevo estado para guardar los errores calculados por campo.
  const [errors, setErrors] = useState<LoginFormErrors>(INITIAL_ERRORS);

  // CAMBIO: Deshabilitar el botón validando los valores actuales con las funciones de validación.
  // Si cualquiera de las validaciones retorna un error (distinto de null), el formulario es inválido.
  const isFormInvalid = Boolean(
    validateEmail(values.email) || validatePassword(values.password)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });

    // CAMBIO: Evaluamos la validación en tiempo real al escribir y guardamos el error en el estado.
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

  // CAMBIO: Al estar el botón deshabilitado con disabled={isFormInvalid},
  // handleSubmit solo se ejecutará cuando el formulario sea 100% válido.
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    alert(`Formulario enviado con éxito:\nEmail: ${values.email}`);
    setValues(INITIAL_VALUES);
    setErrors(INITIAL_ERRORS);
  };

  return (
    <div>
      <h2>Iniciar Sesión (v3)</h2>

      {/* CAMBIO: noValidate evita las alertas por defecto del navegador para usar nuestras validaciones */}
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
            placeholder="ejemplo@correo.com"
          />
          {/* CAMBIO: Se muestra el error directo en UI tan pronto como existe en el estado.
              PROBLEMA VISUAL A MOSTRAR EN CLASE: El error se ve apenas el usuario empieza a escribir (mala UX). */}
          {errors.email && (
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
            placeholder="••••••••"
          />
          {/* CAMBIO: Muestra el error de password directo sin esperar a que el usuario termine de interactuar */}
          {errors.password && (
            <div>
              <small>{errors.password}</small>
            </div>
          )}
        </div>
        <br />

        {/* CAMBIO: disabled={isFormInvalid} bloquea el botón si las validaciones no pasan */}
        <button type="submit" disabled={isFormInvalid}>
          Ingresar
        </button>
      </form>
    </div>
  );
};
