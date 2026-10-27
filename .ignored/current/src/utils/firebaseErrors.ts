import { FirebaseError } from "firebase/app";

// FASE 5 - Mapa de códigos de error de Firebase a mensajes en español
const ERROR_MESSAGES: Record<string, string> = {
  // FASE 5 - Login con email/password: el email no existe o la contraseña no coincide
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  // FASE 5 - Registro: el email ya está registrado
  "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
  // FASE 5 - El usuario cerró la ventana del popup de Google
  "auth/popup-closed-by-user": "Cerraste la ventana de inicio de sesión.",
  // FASE 5 - Falló la comunicación con Firebase
  "auth/network-request-failed": "Error de red. Revisa tu conexión.",
};

// FASE 5 - Mensaje por defecto para los códigos que no están en el mapa
const DEFAULT_MESSAGE = "Ocurrió un error. Intenta de nuevo.";

// FASE 5 - Convierte el error de Firebase en un mensaje claro en español
export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return ERROR_MESSAGES[error.code] ?? DEFAULT_MESSAGE;
  }

  return DEFAULT_MESSAGE;
};
