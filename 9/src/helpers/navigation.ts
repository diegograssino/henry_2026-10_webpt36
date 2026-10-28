import type { NavigateFunction } from "react-router";

// Tiempo de espera antes de redirigir, para que el toast se vea
const REDIRECT_DELAY_MS = 2000;

/**
 * Redirige a una ruta después de una demora.
 * Permite que el toast se muestre antes de que cambie la pantalla.
 */
export const delayNavigate = async (
  navigate: NavigateFunction,
  path: string
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, REDIRECT_DELAY_MS));
  navigate(path);
};
