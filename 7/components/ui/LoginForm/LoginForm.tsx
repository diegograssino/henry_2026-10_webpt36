import { useState } from "react";

interface LoginForm {
  user: string;
  password: string;
}

interface LoginFormErrors {
  user: string | null;
  password: string | null;
}

const INIITAL_VALUES: LoginForm = {
  user: "",
  password: "",
};

const INIITAL_ERRORS: LoginForm = {
  user: null,
  password: null,
};

const LoginForm = () => {
  const [formData, setFormData] = useState<LoginForm>(INIITAL_VALUES);
  const [formErrors, setFormErrors] = useState<LoginFormErrors>(INIITAL_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    // Con esto ya me evito que se recargue la página
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Esto simula una llamada a una API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Enviado");
    } catch (error) {
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const { value, name } = e.target;
    setFormData({ ...formData, [name]: value });

    let errorMessage: string | null = null;

    if (name === "user") {
      errorMessage = validateUser(value);
    } else if (name === "password") {
      errorMessage = validatePassword(value);
    }

    setFormErrors({ ...formErrors, [name]: errorMessage });

    // switch (name) {
    //   case "user":
    //     errorMessage = validateUser(value);
    //     break;
    //   case "password":
    //     errorMessage = validatePassword(value);
    //     break;
    // }

    setFormErrors({ ...formErrors, [name]: errorMessage });
  };

  const validateUser = (value: string): string | null => {
    if (value.length === 0) return "El usuario es requerido";

    if (value.length < 4) return "El usuario debe tener al menos 4 caracteres";

    const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
    if (!emailRegex.test(value)) return "El usuario debe ser un email valido";

    return null;
  };

  const validatePassword = (value: string): string | null => {
    if (value.length === 0) return "El password es requerido";

    if (value.length < 4) return "El password debe tener al menos 4 caracteres";

    //   Contraseña fuerte: mín. 8 caracteres, mayúsculas, minúsculas, dígito, especial
    //   ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;
    if (!passwordRegex.test(value))
      return "El password debe tener al menos una letra y un número";

    return null;
  };

  const isFormInvalid = (): boolean => {
    return !!(
      validateUser(formData.user) || validatePassword(formData.password)
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="user">User:</label>
      <br />
      <input
        id="user"
        type="text"
        name="user"
        value={formData.user}
        onChange={handleChange}
        placeholder="some@email.com"
        disabled={isSubmitting}
      />
      <br />
      {formErrors.user && <p>{formErrors.user}</p>}
      <br />
      <label htmlFor="password">Password:</label>
      <br />
      <input
        id="password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="*******"
        disabled={isSubmitting}
      />
      <br />
      {formErrors.password && <p>{formErrors.password}</p>}
      <br />
      <button type="submit" disabled={isFormInvalid() || isSubmitting}>
        {isSubmitting ? "Enviando..." : "Submit"}
      </button>
    </form>
  );
};

export default LoginForm;
