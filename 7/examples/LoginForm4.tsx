import React, { useState } from "react";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email: string | null;
  password: string | null;
}

// CAMBIO RESPECTO A v3:
// Agregamos el shape de "touched" (booleanos) para registrar si el usuario
// ya interactuó (hizo foco y desenfocó) en cada input.
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

export const LoginForm4: React.FC = () => {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>(INITIAL_ERRORS);

  // CAMBIO: Estado touched para evitar mostrar errores prematuros antes de que el usuario termine de escribir.
  const [touched, setTouched] = useState<LoginFormTouched>(INITIAL_TOUCHED);

  // Mantenemos la validación del botón heredada de v3
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

  // CAMBIO: Nuevo handler que se dispara en el onBlur (cuando el input pierde el foco),
  // marcando ese campo específico como "touched: true".
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;

    setTouched({
      ...touched,
      [name]: true,
    });
  };

  // Al igual que en v3, al tener el botón deshabilitado con disabled={isFormInvalid},
  // handleSubmit no necesita revalidar internamente.
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    alert(`Formulario enviado con éxito:\nEmail: ${values.email}`);
    setValues(INITIAL_VALUES);
    setTouched(INITIAL_TOUCHED);
    setErrors(INITIAL_ERRORS);
  };

  return (
    <div>
      <h2>Iniciar Sesión (v4)</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email">Email:</label>
          <br />
          {/* CAMBIO: Se agrega onBlur={handleBlur} para registrar cuándo se abandona el campo */}
          <input
            id="email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="ejemplo@correo.com"
          />
          {/* CAMBIO: Condición combinada: solo se muestra el error SI el campo fue tocado Y tiene error */}
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
          {/* CAMBIO: Se agrega onBlur={handleBlur} */}
          <input
            id="password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="••••••••"
          />
          {/* CAMBIO: Condición combinada: touched.password && errors.password */}
          {touched.password && errors.password && (
            <div>
              <small>{errors.password}</small>
            </div>
          )}
        </div>
        <br />

        <button type="submit" disabled={isFormInvalid}>
          Ingresar
        </button>
      </form>
    </div>
  );
};
