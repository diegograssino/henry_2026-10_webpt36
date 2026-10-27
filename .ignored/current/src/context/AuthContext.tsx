import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../firebase/config";

// FASE 3 - Estado de sesión que expone el Context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// FASE 3 - El Context agrega las acciones de login y logout
export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// FASE 3 - Contexto: única fuente de verdad sobre el estado de sesión
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// FASE 3 - Provider: envuelve la app y centraliza el estado de sesión
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // FASE 3 - El listener: avisa a toda la app cada vez que cambia la sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // FASE 3 - Cleanup: evita listeners duplicados en StrictMode
    return unsubscribe;
  }, []);

  // FASE 3 - Login: autentica y actualiza el estado
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // FASE 3 - Logout: cierra la sesión y actualiza el estado
  const logout = async () => {
    await signOut(auth);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// FASE 3 - Hook: única forma de consumir el estado de sesión
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};
