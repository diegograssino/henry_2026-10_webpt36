import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";

// Interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Instancia del context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider con el codigo para compartir los datos
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Aca incluyo la logica a compartir
  const [user, setUser] = useState<User | null>(null);

  // Listener para saber si alguien se logea o deslogea
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAuthenticated = Boolean(user);

  // Esto crea el provider para que lo encerremos en toda la app
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Creo el hook custom
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};
