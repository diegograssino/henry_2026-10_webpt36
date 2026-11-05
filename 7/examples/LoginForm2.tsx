import React, { useState } from "react";

export interface LoginFormValues {
  email: string;
  password: string;
}

const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

export const LoginForm2: React.FC = () => {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);

  // CAMBIO RESPECTO A v1:
  // En vez de tener handleEmailChange y handlePasswordChange por separado,
  // unificamos en un único handler genérico.
  // Usamos e.target.name dinámicamente ([name]: value) para actualizar
  // cualquier campo del formulario sin repetir lógica.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    alert(`Formulario enviado con éxito:\nEmail: ${values.email}`);
    setValues(INITIAL_VALUES);
  };

  return (
    <div>
      <h2>Iniciar Sesión (v2)</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <br />
          {/* CAMBIO: Ambos inputs ahora comparten el mismo onChange={handleChange} */}
          <input
            id="email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
          />
        </div>
        <br />

        <div>
          <label htmlFor="password">Contraseña:</label>
          <br />
          {/* CAMBIO: Se vincula al mismo handleChange gracias a su atributo name="password" */}
          <input
            id="password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>
        <br />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};
