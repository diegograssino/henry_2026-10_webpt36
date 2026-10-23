import React, { useState } from "react";

// ==========================================
// 1. Tipos e Initial Values
// ==========================================

export interface LoginFormValues {
  email: string;
  password: string;
}

const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

// ==========================================
// 2. Componente LoginForm
// ==========================================

export const LoginForm: React.FC = () => {
  // Estado de los valores del formulario
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);

  // Manejador específico para el campo email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      email: e.target.value,
    });
  };

  // Manejador específico para el campo password
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      password: e.target.value,
    });
  };

  // Manejo del envío del formulario
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    alert(`Formulario enviado con éxito:\nEmail: ${values.email}`);
    setValues(INITIAL_VALUES);
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>

      <form onSubmit={handleSubmit}>
        {/* Campo Email */}
        <div>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            id="email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleEmailChange}
            placeholder="ejemplo@correo.com"
          />
        </div>
        <br />

        {/* Campo Password */}
        <div>
          <label htmlFor="password">Contraseña:</label>
          <br />
          <input
            id="password"
            type="password"
            name="password"
            value={values.password}
            onChange={handlePasswordChange}
            placeholder="••••••••"
          />
        </div>
        <br />

        {/* Botón de Envío */}
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};
