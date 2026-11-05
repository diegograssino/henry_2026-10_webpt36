import React, { useState } from "react";

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

export const LoginForm5: React.FC = () => {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<LoginFormTouched>(INITIAL_TOUCHED);

  // CAMBIO RESPECTO A v4:
  // Agregamos un estado booleano isSubmitting para controlar la carga/envío asíncrono
  // y bloquear los inputs o el botón mientras se procesa la petición.
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // CAMBIO: handleSubmit ahora es asíncrono (async).
  // Activamos isSubmitting a true, simulamos 2 segundos de demora en un try/catch,
  // y en el finally restauramos isSubmitting a false pase lo que pase.
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Simula petición con demora de 2 segundos (a ningún lado por ahora)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(`Formulario enviado con éxito:\nEmail: ${values.email}`);
      setValues(INITIAL_VALUES);
      setTouched(INITIAL_TOUCHED);
      setErrors(INITIAL_ERRORS);
    } catch {
      // Manejo de error vacío por ahora
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión (v5)</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email">Email:</label>
          <br />
          {/* CAMBIO: disabled={isSubmitting} evita que el usuario altere datos durante el envío */}
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
          {/* CAMBIO: disabled={isSubmitting} */}
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

        {/* CAMBIO: disabled se activa si el form es inválido O si ya se está enviando.
            El texto del botón cambia según isSubmitting */}
        <button type="submit" disabled={isFormInvalid || isSubmitting}>
          {isSubmitting ? "Enviando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};
