// FASE 1 - Importar funciones del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// FASE 1 - Configuración del proyecto leída desde variables de entorno (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// FASE 1 - Inicializar Firebase con la configuración del proyecto
export const app = initializeApp(firebaseConfig);

// FASE 1 - Inicializar el servicio de autenticación
export const auth = getAuth(app);

// FASE 1 - Inicializar el proveedor de Google (para login con popup en Fase 2)
export const googleProvider = new GoogleAuthProvider();
