import { FirebaseError } from "firebase/app";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
  "auth/popup-closed-by-user": "Cerraste la ventana de inicio de sesión.",
  "auth/network-request-failed": "Error de red. Revisa tu conexión.",
};

const DEFAULT_MESSAGE = "Ocurrió un error. Intenta de nuevo.";

export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return ERROR_MESSAGES[error.code] || DEFAULT_MESSAGE;
  }

  return DEFAULT_MESSAGE;
};

// FASE 6 - True si Firebase rechazo la operacion por falta de permisos
export const isPermissionDenied = (error: unknown): boolean =>
  error instanceof FirebaseError && error.code === "permission-denied";
