# Plan de Clase: Autenticación con Firebase en React + TypeScript

## Fases del Proyecto
- [x] **Fase 1: Crear proyecto en Firebase y configurar el SDK**
- [x] **Fase 2: Primer registro y login con Google**
- [x] **Fase 3: Construir el Authenticator y onAuthStateChanged**
- [x] **Fase 4: Conectar las rutas protegidas con Firebase**
- [x] **Fase 5: Manejo de errores**
- [ ] **Fase 6: Verificación completa**

---

## Fase 1: Crear proyecto en Firebase y configurar el SDK

### 1. Crear el proyecto en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com/).
2. Crear un proyecto:
   - **Nombre:** `henry-auth-demo` (o el nombre que corresponda).
   - **Gemini in Firebase:** **Sí / Habilitar**.
   - **Google Analytics:** **No**.
3. Clic en **Crear proyecto** y esperar.
4. En **Overview**, clic en el ícono Web `</>`.
5. Apodo: `web-app`. **No** tildar Firebase Hosting.
6. Clic en **Registrar app**.
7. En **"Agrega el SDK de Firebase"**, elegir la pestaña **"Usar npm"**.
8. Copiar el bloque de configuración que muestra Firebase.

### 2. Habilitar los métodos de autenticación

1. Menú lateral → **Seguridad → Authentication** (o **Build → Authentication** en inglés).
2. Clic en **Comenzar**.
3. Pestaña **Sign-in method**:
   - **Correo electrónico/Contraseña** → activar **Habilitar** → **Guardar**.
   - **Agregar nuevo proveedor** → **Google** → activar **Habilitar** → elegir el correo de soporte → **Guardar**.

### 3. Instalar Firebase en el proyecto

```bash
npm install firebase
```

### 4. Crear `src/firebase/config.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

### 5. Mover las credenciales a `.env`

1. En `.gitignore`, agregar:
   ```gitignore
   # Environment variables
   .env
   .env.*
   !.env.example
   ```
2. Crear `.env` en la raíz, con prefijo `VITE_`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
   ```
3. Crear `.env.example` con los mismos nombres y valores de ejemplo:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```
4. Refactorizar `src/firebase/config.ts` para leer del `.env`:
   ```typescript
   import { initializeApp } from "firebase/app";
   import { getAuth, GoogleAuthProvider } from "firebase/auth";

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };

   export const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const googleProvider = new GoogleAuthProvider();
   ```
5. Reiniciar `npm run dev` para que Vite tome el `.env`.

### 6. Verificar

1. `npm run lint` → sin errores.
2. `npx tsc --noEmit` → sin errores.
3. `npm run dev` → `http://localhost:5173` muestra la app con routing:
   - `/` → Home
   - `/login` → formulario de login
   - `/register` → formulario de registro
   - `/protected` → bloqueado por la ruta protegida

---

## Fase 2: Primer registro y login con Google

> Los formularios `LoginForm` y `RegisterForm` ya existen en el template. Solo se les conecta Firebase.

### 1. Registro con email y contraseña

**Archivo:** `src/components/views/Register/RegisterForm.tsx`

1. Importar:
   ```typescript
   import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
   import { auth, googleProvider } from "../../../firebase/config";
   ```
2. En `handleSubmit`, reemplazar el `await new Promise(...)` del template por:
   ```typescript
   try {
     // FASE 2 - Crear usuario con email y contraseña en Firebase Auth
     await createUserWithEmailAndPassword(
       auth,
       values.email,
       values.password
     );

     // FASE 2 - Redirigir al inicio tras registro exitoso
     navigate("/");
   } catch (error) {
     console.error("Error en el registro:", error);
     alert("Ocurrió un error al registrarse. Intenta de nuevo.");
   } finally {
     setIsSubmitting(false);
   }
   ```
3. Verificar:
   - `/register` → email + contraseña (mínimo 6 caracteres) → enviar → redirige a `/`.
   - Firebase Console → **Authentication → Users** → el usuario aparece listado.

### 2. Login con email y contraseña

**Archivo:** `src/components/views/Login/LoginForm.tsx`

1. Importar `useNavigate` y la función de login:
   ```typescript
   import { Link, useNavigate } from "react-router";
   import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
   import { auth, googleProvider } from "../../../firebase/config";
   ```
2. Agregar el hook de navegación:
   ```typescript
   // FASE 2 - Hook de navegación para redirigir tras el login exitoso
   const navigate = useNavigate();
   ```
3. En `handleSubmit`, reemplazar el `await new Promise(...)` del template por:
   ```typescript
   try {
     // FASE 2 - Autenticar al usuario con email y contraseña en Firebase Auth
     await signInWithEmailAndPassword(auth, values.email, values.password);

     // FASE 2 - Redirigir al inicio tras login exitoso
     navigate("/");
   } catch (error) {
     console.error("Error en el login:", error);
     alert("Email o contraseña incorrectos. Intenta de nuevo.");
   } finally {
     setIsSubmitting(false);
   }
   ```
4. Verificar:
   - `/login` → email + contraseña → enviar → redirige a `/`.
   - Con credenciales incorrectas → `alert` de error y los campos conservan lo tipeado.

### 3. Validaciones de los formularios

Las validaciones vienen del template. Se dejan **iguales en login y register**:

| Campo | Regla | Mensaje |
|-------|-------|---------|
| Email | Requerido + formato válido | "El email es requerido" / "El formato de email no es válido" |
| Contraseña | Requerida + mínimo 6 caracteres | "La contraseña es requerida" / "La contraseña debe tener al menos 6 caracteres" |

En `LoginForm.tsx` y `RegisterForm.tsx`, el `validatePassword` queda así en los dos archivos:

```typescript
const validatePassword = (value: string): string | null => {
  if (!value) {
    return "La contraseña es requerida";
  }
  if (value.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  return null;
};
```

> **Nota:** los 6 caracteres coinciden con la política de contraseñas por defecto de Firebase
> (**Authentication → Settings → Password Policy → Minimum password length = 6**). Si se cambia uno, hay que cambiar el otro.

### 4. Login con Google

**Archivo:** `src/components/views/Login/LoginForm.tsx`

1. Importar:
   ```typescript
   import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
   import { auth, googleProvider } from "../../../firebase/config";
   ```
2. Agregar el handler:
   ```typescript
   // FASE 2 - Handler para login con Google via popup
   const handleGoogleSignIn = async () => {
     setIsGoogleLoading(true);

     try {
       await signInWithPopup(auth, googleProvider);
       // FASE 2 - Redirigir al inicio tras login con Google exitoso
       navigate("/");
     } catch (error) {
       console.error("Error en el login con Google:", error);
       alert("Ocurrió un error al iniciar sesión con Google. Intenta de nuevo.");
     } finally {
       // FASE 2 - Liberar el botón también cuando el login con Google falla
       setIsGoogleLoading(false);
     }
   };
   ```
3. Agregar el botón debajo del formulario:
   ```typescript
   {/* FASE 2 - Botón alternativo de login con Google */}
   <hr />
   <button
     type="button"
     onClick={handleGoogleSignIn}
     disabled={isSubmitting || isGoogleLoading}
   >
     {isGoogleLoading ? "Conectando con Google..." : "Iniciar sesión con Google"}
   </button>
   ```
4. Agregar el mismo botón en `RegisterForm` (como "Registrarse con Google"), usando el mismo `googleProvider`.
5. Verificar:
   - `/login` → "Iniciar sesión con Google" → popup de Google → elegir cuenta → redirige a `/`.
   - Firebase Console → **Authentication → Users** → el usuario de Google aparece listado.

### 5. Estado de carga del botón de Google

1. Agregar un estado separado en `LoginForm` y `RegisterForm`:
   ```typescript
   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
   // FASE 2 - Estado separado para el login con Google, para no mezclar el
   // texto del botón del form con el del popup
   const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
   ```
2. El `finally` del `handleGoogleSignIn` debe resetear `isGoogleLoading`. Sin ese `finally`, el botón queda deshabilitado para siempre si el popup falla o se cierra.

### 6. Verificar

| Prueba | Resultado esperado |
|--------|--------------------|
| Registrar usuario nuevo con email/password | Redirige a `/` y el usuario aparece en Console → Users |
| Iniciar sesión con el mismo usuario | Redirige a `/` |
| Login con Google vía popup | Popup → elegir cuenta → redirige a `/` |
| Login con email inexistente | `alert` de error, el formulario sigue operativo |
| Recargar la página | Vuelve al estado deslogueado (se resuelve en la Fase 3) |

`npm run lint` y `npx tsc --noEmit` sin errores.

---

## Fase 3: Construir el Authenticator y onAuthStateChanged

> El registro, el login y Google **dejan la sesión activa**, pero ninguna de esas funciones le avisa a la app cuándo cambia
> la sesión. Solo devuelven un resultado a quien las llamó. Sin un listener, cada pantalla tendría que preguntar por su
> cuenta si hay alguien logueado.
>
> El **Authenticator** se construye con un **Context** y un hook personalizado **`useAuth`**, y es la **única fuente de
> verdad** sobre el estado de sesión.

### 1. Crear `src/context/AuthContext.tsx`

Un solo archivo con el Context, el Provider y el hook:

```typescript
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
```

> El `AuthContext` **no se exporta**: es interno del archivo.

### 2. Implementar el `AuthProvider`

En el mismo archivo:

```typescript
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
```

> El `return unsubscribe` del `useEffect` es obligatorio: sin él, el listener queda activo al desmontar el componente.

### 3. Exportar el hook `useAuth`

En el mismo archivo:

```typescript
// FASE 3 - Hook: única forma de consumir el estado de sesión
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};
```

### 4. Ajustar el lint

En `eslint.config.js`, agregar el bloque `rules`:

```javascript
rules: {
  // FASE 3 - allowExportNames: permite que useAuth se exporte junto al
  // AuthProvider en el mismo archivo (src/context/AuthContext.tsx)
  'react-refresh/only-export-components': ['error', {
    allowConstantExport: true,
    allowCompoundComponents: true,
    allowExportNames: ['useAuth'],
  }],
},
```

> Sin esta opción, la regla `react-refresh/only-export-components` del template obliga a separar el hook en otro archivo.

### 5. Montar el Provider

En `src/main.tsx`:

```typescript
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

### 6. Conectar el login al Context

En `src/components/views/Login/LoginForm.tsx`:

1. Importar el hook:
   ```typescript
   import { useAuth } from "../../../context/AuthContext.tsx";
   ```
2. Sacar `signInWithEmailAndPassword` del import de `firebase/auth` (ya no se usa acá).
3. En el componente:
   ```typescript
   // FASE 3 - El login se pide al Context
   const { login } = useAuth();
   ```
4. En el `handleSubmit`:
   ```typescript
   try {
     // FASE 3 - Autenticar al usuario con email y contraseña a través del Context
     await login(values.email, values.password);

     // FASE 2 - Redirigir al inicio tras login exitoso
     navigate("/");
   } catch (error) {
     console.error("Error en el login:", error);
     alert("Email o contraseña incorrectos. Intenta de nuevo.");
   } finally {
     setIsSubmitting(false);
   }
   ```

### 7. Consumir el Context en el Navbar

En `src/components/ui/Navbar/Navbar.tsx`:

1. Importar el hook:
   ```typescript
   import { useAuth } from "../../../context/AuthContext.tsx";
   ```
2. Sacar la prop `isAuthenticated` de la interfaz y del componente:
   ```typescript
   const Navbar = () => {
     // FASE 3 - Única fuente de verdad: el Context
     const { user, isAuthenticated, logout } = useAuth();
   ```
3. Cambiar el bloque de la derecha por:
   ```typescript
   <div>
     {isAuthenticated ? (
       <>
         <span>{user?.email}</span>
         {/* FASE 3 - Botón para cerrar la sesión */}
         <button type="button" onClick={() => void logout()}>
           Cerrar sesión
         </button>
       </>
     ) : (
       <Link to="/login">Iniciar sesión</Link>
     )}
   </div>
   ```

### 8. Actualizar el Layout y el Home

**`src/layout.tsx`** — sacar la prop `isAuthenticated`:

```typescript
const Layout = () => {
  return (
    <div className="layout-container">
      {/* FASE 3 - El Navbar ya no necesita recibir isAuthenticated por props */}
      <Navbar />
      <main>
        <Outlet />
      </main>
      <div className="layout-footer">
        <Footer />
      </div>
    </div>
  );
};
```

**`src/components/views/Home/Home.tsx`** — mostrar el estado de sesión:

```typescript
import { useAuth } from "../../../context/AuthContext.tsx";

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      <h1>Home</h1>
      <p>Bienvenido a la aplicación de demostración de Autenticación.</p>

      {/* FASE 3 - El estado de sesión llega desde el Context, sin props */}
      {isAuthenticated ? (
        <p>Sesión activa: {user?.email}</p>
      ) : (
        <p>No hay sesión activa.</p>
      )}
    </div>
  );
};
```

### 9. Verificar

| Prueba | Resultado esperado |
|--------|--------------------|
| Iniciar sesión | El Navbar muestra el email y el botón "Cerrar sesión" |
| Home | Muestra "Sesión activa: {email}" |
| **Recargar la página** | **La sesión sigue activa** — esta es la prueba clave de la fase |
| "Cerrar sesión" | El Navbar vuelve a "Iniciar sesión" y Home muestra "No hay sesión activa" |
| Cerrar sesión y recargar | Sigue deslogueado |
| Login con Google y recargar | La sesión sigue activa |

`npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.

> **Pendiente para fases siguientes:**
> - Los `alert()` son genéricos. La **Fase 5** los reemplaza por el mapeo de `FirebaseError.code` a mensajes en español.

---

## Fase 4: Conectar las rutas protegidas con Firebase

> El template ya tiene un guard de rutas (`ProtectedRoute`). Esta fase **no lo reescribe**: solo lo **conecta con
> Firebase**, para que deje de usar el `useState(false)` de `App.tsx` y pase a leer la sesión del Context.

### 1. Conectar el `ProtectedRoute` con el Context

**Archivo:** `src/components/ui/ProtectedRoute/ProtectedRoute.tsx`

```typescript
import { Navigate, Outlet, useLocation } from "react-router";
// FASE 4 - El guard consulta el estado de sesión al Context
import { useAuth } from "../../../context/AuthContext.tsx";

const ProtectedRoute = () => {
  // FASE 4 - Única fuente de verdad: el Context
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // FASE 4 - Sin sesión: redirigir guardando el destino
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
```

Qué cambió respecto del template:
- Se saca la interfaz `ProtectedRouteProps` y la prop `isAuthenticated`: el estado viene del Context.
- Se agrega `useLocation()` para guardar la ruta de destino en `state.from`.

### 2. Actualizar `App.tsx`

Quitar la prop `isAuthenticated`:

```typescript
{/* FASE 4 - El guard lee la sesión del Context, ya no recibe props */}
<Route element={<ProtectedRoute />}>
  <Route path="protected" element={<Protected />} />
</Route>
```

### 3. El login vuelve a la ruta de destino

**Archivo:** `src/components/views/Login/LoginForm.tsx`

1. Importar `useLocation`:
   ```typescript
   import { Link, useLocation, useNavigate } from "react-router";
   ```
2. Leer el destino que dejó el guard:
   ```typescript
   // FASE 4 - Hook de ubicación: guarda la ruta de destino cuando el guard redirige
   const location = useLocation();
   // FASE 4 - Destino al que volver después del login (lo pasó el guard)
   const from = (location.state as { from?: Location })?.from;
   ```
3. Navegar al destino en los dos handlers (`handleSubmit` y `handleGoogleSignIn`):
   ```typescript
   // FASE 4 - Volver a la ruta de destino (o al inicio si no hubo redirect)
   navigate(from?.pathname ?? "/");
   ```

### 4. Mostrar la sesión en la página protegida

**Archivo:** `src/components/views/Protected/Protected.tsx`

```typescript
// FASE 4 - La página protegida muestra que hay sesión activa
import { useAuth } from "../../../context/AuthContext.tsx";

const Protected = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Protected</h1>
      {/* FASE 4 - Solo se llega acá si hay sesión activa */}
      <p>Sesión activa: {user?.email}</p>
    </div>
  );
};
```

### 5. Verificar

| Prueba | Resultado esperado |
|--------|--------------------|
| `/protected` sin sesión | Redirige a `/login` |
| Login exitoso desde ahí | Vuelve a `/protected` y muestra "Sesión activa: {email}" |
| `/protected` con sesión | Renderiza el contenido protegido |
| Login con Google desde `/protected` | Vuelve a `/protected` |
| Cerrar sesión y entrar a `/protected` | Redirige a `/login` |

`npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.

---

## Fase 5: Manejo de errores

> Firebase devuelve un código de error (por ejemplo `auth/invalid-credential`). Cada código significa algo distinto.
> Esta fase los traduce a **mensajes claros en español**.

### 1. Crear `src/utils/firebaseErrors.ts`

```typescript
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
```

Cómo funciona:
- `error instanceof FirebaseError` → True solo si el error viene de Firebase. Si es otro tipo de error, devuelve el mensaje por defecto.
- `error.code` → el código de Firebase (por ejemplo `"auth/invalid-credential"`).
- `ERROR_MESSAGES[error.code] ?? DEFAULT_MESSAGE` → busca el mensaje; si el código no está en el mapa, usa el genérico.

### 2. Usarlo en los formularios

**`src/components/views/Login/LoginForm.tsx`** y **`src/components/views/Register/RegisterForm.tsx`**:

1. Importar la función:
   ```typescript
   // FASE 5 - Función que traduce el error de Firebase a un mensaje en español
   import { getAuthErrorMessage } from "../../../utils/firebaseErrors.ts";
   ```
2. Reemplazar el `alert()` con texto fijo por la llamada a la función:
   ```typescript
   } catch (error) {
     console.error("Error en el login:", error);
     // FASE 5 - Mostrar el mensaje según el código de error de Firebase
     alert(getAuthErrorMessage(error));
   } finally {
   ```
3. Hacer lo mismo en los 4 `catch` (login con email, login con Google, registro con email, registro con Google).

### 3. Verificar

| Prueba | Mensaje esperado |
|--------|-------------------|
| Login con contraseña incorrecta | "Email o contraseña incorrectos." |
| Registro con email ya existente | "Ya existe una cuenta con ese email." |
| Cerrar el popup de Google | "Cerraste la ventana de inicio de sesión." |
| Sin conexión a internet | "Error de red. Revisa tu conexión." |
| Cualquier otro error | "Ocurrió un error. Intenta de nuevo." |

`npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.

