export const INVALID_ERROR_MESSAGE = "El formato de email no es válido";
export const REQUIRED_ERROR_MESSAGE = "El email es requerido";

export const validateEmail = (value: string): string | null => {
  if (!value.trim()) {
    return REQUIRED_ERROR_MESSAGE;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return INVALID_ERROR_MESSAGE;
  }
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) {
    return "La contraseña es requerida";
  }
  if (value.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  return null;
};
