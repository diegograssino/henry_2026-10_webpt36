import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

// Login con email y contraseña
export const login = async (
  email: string,
  password: string
): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

// Registro con email y contraseña
export const register = async (
  email: string,
  password: string
): Promise<void> => {
  await createUserWithEmailAndPassword(auth, email, password);
};

// Login con Google vía popup
export const loginWithGoogle = async (): Promise<void> => {
  await signInWithPopup(auth, googleProvider);
};
