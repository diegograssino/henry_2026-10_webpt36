export const validateEmail = (value: string): string | null => {
  if (!value.trim()) {
    return "El email es requerido";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "El formato de email no es válido";
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
