# Plan de Clase: Autenticación con Firebase en React + TypeScript

## Contexto general

Proyecto base: Vite + React 19 + TypeScript (plantilla en `8_template`), copia de trabajo en `current`.
Objetivo de la clase: configurar un proyecto Firebase desde cero y conectarlo a una app React + TypeScript, implementar
registro/login con email/password y con Google, construir el `Authenticator` con Context API y `onAuthStateChanged`,
proteger rutas conectando el `ProtectedRoute` del template con el estado de sesión real, y mapear errores de
autenticación a mensajes claros en español.

El paso a paso de lo ya realizado vive en [README.md](file:///Users/diegograssino/repos/henry/m4_webpt36_2026_10/.ignored/current/README.md).
Este documento es el **plan maestro** de fases: define el objetivo, los archivos involucrados y el criterio de verificación
de cada fase. El README se completa al mismo tiempo con el detalle de implementación de cada fase.

### Metodología de trabajo: el template es la base

La clase parte del template heredado ([8_template](file:///Users/diegograssino/repos/henry/m4_webpt36_2026_10/.ignored/8_template)),
que ya trae: routing con React Router, layout con Navbar/Footer, vistas (`Home`, `Login`, `Register`, `Protected`), un guard
de rutas y los formularios con validación.

Sobre esa base **se agrega el código de autenticación, fase por fase**. Cada fase:
1. **Arranca desde el template** — no se reescribe la base.
2. **Agrega lo mínimo** — solo los archivos que la fase necesita.
3. **Verifica** — `npm run lint` + `npx tsc --noEmit` limpios.
4. **Documenta en el README** — el paso a paso de lo implementado.

#### Delta acumulado template → `current`

| Cambio | Estado | Fase |
|--------|--------|------|
| `src/firebase/config.ts` | ✅ Hecho | 1 |
| `.env` / `.env.example` / `.gitignore` | ✅ Hecho | 1 |
| `src/components/views/Login/LoginForm.tsx` | ✅ Hecho | 2 |
| `src/components/views/Register/RegisterForm.tsx` | ✅ Hecho | 2 |
| `src/context/AuthContext.tsx` (Context + Provider + hook) | ✅ Hecho | 3 |
| `eslint.config.js` (permitir `useAuth` junto al provider) | ✅ Hecho | 3 |
| `src/components/ui/ProtectedRoute/ProtectedRoute.tsx` | ✅ Hecho (conectado, no reescrito) | 4 |
| `src/utils/firebaseErrors.ts` | ✅ Hecho | 5 |
| `src/App.tsx`, `src/main.tsx`, `src/layout.tsx`, `Navbar`, `Home`, `Protected` | ✅ Hecho | 3 y 4 |

> Todo lo demás es **idéntico al template**. La clase es un agregado incremental, no un rewrite.

### Hilo conductor: el portal de la clínica

Marco narrativo para explicar el *porqué* de cada pieza. **No se implementa.**

| Pantalla | Rol |
|----------|-----|
| **Panel de recepción** | Personal administrativo |
| **Formulario de turnos** | Paciente |
| **Pantalla de profesionales** | Profesionales de la clínica |

---

## Fases del Proyecto

| Fase | Estado | Objetivo |
|------|--------|-----------|
| 1 | ✅ Completada | Crear proyecto en Firebase y configurar el SDK |
| 2 | ✅ Completada | Primer registro y login con Google |
| 3 | ✅ Completada | Construir el Authenticator y onAuthStateChanged |
| 4 | ✅ Completada | Conectar las rutas protegidas con Firebase |
| 5 | ✅ Completada | Manejo de errores |
| 6 | ⬜ Pendiente | Verificación completa |

---

## Fase 1: Crear proyecto en Firebase y configurar el SDK ✅

**Estado:** Completada. Documentada en detalle en el README (sección "Fase 1").

**Resumen de lo hecho:**
- Proyecto creado en Firebase Console con los proveedores **Correo electrónico/Contraseña** y **Google** habilitados.
- Dependencia `firebase` instalada; inicialización en [src/firebase/config.ts](file:///Users/diegograssino/repos/henry/m4_webpt36_2026_10/.ignored/current/src/firebase/config.ts).
- Credenciales migradas a variables de entorno (`VITE_FIREBASE_*`) con [.env.example](file:///Users/diegograssino/repos/henry/m4_webpt36_2026_10/.ignored/current/.env.example) como plantilla.
- `auth` y `googleProvider` exportados desde `config.ts` para ser usados en la Fase 2.

**Archivos:** `src/firebase/config.ts`, `.env`, `.env.example`, `.gitignore`, `src/App.tsx`

---

## Fase 2: Primer registro y login con Google ✅

### Contexto
Observamos de manera aislada el registro con email/password y el login con Google, **antes** de construir el `Authenticator`.
Todavía no hay persistencia de sesión: cada recarga pierde el estado.

> **Punto de partida:** los formularios `LoginForm` y `RegisterForm` **ya existen en el template** con su propia validación
> de campos. En esta fase **no se reescriben**: se les conecta Firebase encima.

### Estado: completada
- ✅ `LoginForm` llama a `signInWithEmailAndPassword(auth, ...)` y a `signInWithPopup(auth, googleProvider)`.
- ✅ `RegisterForm` llama a `createUserWithEmailAndPassword(auth, ...)` y a `signInWithPopup(...)`.
- ✅ `navigate("/")` tras login/registro exitosos.
- ✅ Estados de carga separados (`isSubmitting` / `isGoogleLoading`) con `finally` que los libera siempre.
- ✅ El registro usa **solo email y contraseña** (sin campo `displayName`): el nombre se simplifica para no agregar
  complejidad a los estudiantes. El perfil del usuario queda con el email como dato principal.
- ✅ Sección completa documentada en el README.

### Criterio de verificación
- [x] Se puede registrar un usuario nuevo con email/password y el mismo usuario aparece en **Console → Authentication → Users**.
- [x] Se puede iniciar sesión con Google mediante popup (sin errores en consola).
- [x] El login con email/password falla de forma controlada con un usuario inexistente (mensaje temporal `alert`).
- [x] `npm run lint` y `npx tsc --noEmit` sin errores.

> **Pendiente para fases siguientes:** los `alert()` son genéricos (Fase 5 los reemplaza por el mapeo de errores) y la
> sesión no sobrevive a un refresh (Fase 3 lo resuelve con `onAuthStateChanged`).

---

## Fase 3: Construir el Authenticator y onAuthStateChanged ⬜

### Contexto

Lo visto hasta ahora (registro, login y Google) **deja la sesión activa**, pero ninguna de esas funciones le avisa a la app
cuándo cambia la sesión. Login, registro y logout solo devuelven un resultado a **quien los llamó**. Nadie les avisa a las
demás pantallas.

Sin un listener, cada pantalla tendría que preguntar por su cuenta si hay alguien logueado.

En el portal de la clínica:

| Situación | Qué se rompe |
|-----------|--------------|
| Un profesional cierra sesión | El **panel de recepción sigue mostrando datos** |
| El paciente recarga la página | Firebase **recuerda al usuario**, pero la UI no puede reflejarlo |

> La del **logout** se rompe primero: es una fuga de datos.

### El Authenticator es un Context

El Authenticator se construye con un **Context** y un hook personalizado **`useAuth`**, y es la **única fuente de verdad**
sobre el estado de sesión. Todas las pantallas le preguntan a ese mismo lugar.

**Cada pantalla por su cuenta** — lógica duplicada:

```tsx
// PanelRecepcion.tsx
const user = auth.currentUser;

// FormularioTurnos.tsx
const user = auth.currentUser;

// Profesionales.tsx
const user = auth.currentUser;
```

**Un Context compartido**:

```tsx
// PanelRecepcion.tsx
const { user } = useAuth();

// FormularioTurnos.tsx
const { user } = useAuth();

// Profesionales.tsx
const { user } = useAuth();
```

Si la sesión cambia, **cambia para todas a la vez**.

### Objetivo

Crear un componente `Authenticator` que:
- Use **Context API** (`createContext` + `useContext`) para exponer el estado de autenticación a toda la app.
- Se suscriba a `onAuthStateChanged` para **persistir la sesión** entre recargas y **notificar los cambios**.
- Exponga `user`, `isAuthenticated` y las acciones `login`, `logout`.

### Pasos
1. **Crear el contexto** — `src/context/AuthContext.tsx` (un solo archivo)
   - `interface AuthState { user: User | null; isAuthenticated: boolean }`
   - `interface AuthContextValue extends AuthState { login(email, password): Promise<void>; logout(): Promise<void> }`
   - `const AuthContext = createContext<AuthContextValue | undefined>(undefined)` — **no se exporta**, es interno.
2. **Implementar `AuthProvider`** en el mismo archivo.
   - `useEffect` con `onAuthStateChanged(auth, (user) => setUser(user))`.
   - Cleanup: `return unsubscribe` en el `useEffect` (evita listeners duplicados en StrictMode).
   - `login` → `signInWithEmailAndPassword` + `setUser`.
   - `logout` → `signOut(auth)` + `setUser(null)`.
3. **Exportar el hook `useAuth`** desde el mismo archivo.
   - `useAuth()` para consumir el contexto sin repetir `useContext(AuthContext)`.
   - Falla con un error claro si se usa fuera del provider.
4. **Ajustar el lint** — `eslint.config.js`, para permitir que `useAuth` se exporte junto al provider:
   ```javascript
   rules: {
     'react-refresh/only-export-components': ['error', {
       allowConstantExport: true,
       allowCompoundComponents: true,
       allowExportNames: ['useAuth'],
     }],
   },
   ```
   > Sin esta opción, la regla `react-refresh/only-export-components` del template obliga a separar el hook
   > en otro archivo. Con ella, el contexto completo vive en un único archivo.
5. **Montar el provider** — envolver `<App />` en `main.tsx`:
   ```tsx
   <StrictMode>
     <BrowserRouter>
       <AuthProvider>
         <App />
       </AuthProvider>
     </BrowserRouter>
   </StrictMode>
   ```
6. **Consumir el contexto** en `Layout` / `Navbar` / `Home` en lugar de la prop `isAuthenticated` de `App.tsx`.
7. **Mostrar el estado del usuario** en el Navbar (email) y un botón "Cerrar sesión".

### Archivos (a crear / modificar)
- 🆕 `src/context/AuthContext.tsx` — Context + `AuthProvider` + `useAuth` (un solo archivo)
- ✏️ `eslint.config.js` — permitir `useAuth` junto al provider
- ✏️ `src/main.tsx` — montar `AuthProvider`
- ✏️ `src/layout.tsx` — dejar de recibir `isAuthenticated` por props
- ✏️ `src/components/ui/Navbar/Navbar.tsx` — usar `useAuth()`
- ✏️ `src/components/views/Home/Home.tsx` — mostrar el estado de sesión
- ✏️ `src/components/views/Login/LoginForm.tsx` — el login va por el Context
- ✏️ `src/App.tsx` — eliminar el `useState(false)` provisional

### Criterio de verificación
- [ ] Al iniciar sesión y **recargar** la página, la app sigue mostrando al usuario como autenticado (sesión persistida).
- [ ] Al cerrar sesión y recargar, la app vuelve al estado deslogueado.
- [ ] Un logout en una pestaña refleja el cambio en las demás pantallas (no quedan "datos visibles" sin sesión).
- [ ] La consola del navegador no muestra errores de `onAuthStateChanged` y no hay suscripciones duplicadas (StrictMode).

---

## Fase 4: Rutas protegidas conectadas con Firebase ⬜

### Contexto
A continuación vamos a proteger rutas y observaremos la redirección.

> **Alcance:** el template ya tiene un guard
> ([src/components/ui/ProtectedRoute/ProtectedRoute.tsx](file:///Users/diegograssino/repos/henry/m4_webpt36_2026_10/.ignored/current/src/components/ui/ProtectedRoute/ProtectedRoute.tsx)).
> **No se reescribe.** Solo se **conecta con Firebase**: deja de usar el `useState(false)` de `App.tsx` y pasa a leer el
> estado de sesión real del Authenticator (Fase 3).

### Estado actual del guard (plantilla)

```typescript
interface ProtectedRouteProps {
  isAuthenticated: boolean;
}

const ProtectedRoute = ({ isAuthenticated }: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
```

Funciona, pero el `isAuthenticated` no viene de Firebase: es un `useState(false)` fijo en `App.tsx`, así que la ruta
protegida nunca deja pasar a nadie.

### Objetivo
- La ruta protegida se abre **solo** con sesión activa.
- Sin sesión → redirige a `/login`.
- **Recuerda el destino** para volver allí tras el login.

### Pasos
1. **Cambiar la fuente del estado** — el guard lee del Context:
   ```typescript
   import { Navigate, Outlet, useLocation } from "react-router";
   import { useAuth } from "../../../context/useAuth.ts";

   const ProtectedRoute = () => {
     const { isAuthenticated } = useAuth();
     const location = useLocation();

     // FASE 4 - Sin sesión: redirigir guardando el destino
     if (!isAuthenticated) {
       return <Navigate to="/login" state={{ from: location }} replace />;
     }

     return <Outlet />;
   };
   ```
2. **Actualizar `App.tsx`** — quitar el `useState(false)` y la prop:
   ```typescript
   <Route element={<ProtectedRoute />}>
     <Route path="protected" element={<Protected />} />
   </Route>
   ```
   El `Layout` también deja de recibir `isAuthenticated` por props.
3. **Login que respeta el destino** — en `LoginForm`:
   ```typescript
   const location = useLocation();
   const from = (location.state as { from?: Location })?.from;

   // ...tras un login exitoso:
   navigate(from?.pathname ?? "/");
   ```
4. **Probar el flujo:**
   - `/protected` sin sesión → redirige a `/login`.
   - Login exitoso → vuelve a `/protected`.
   - Sesión iniciada → `/protected` renderiza el contenido.

> **Nota sobre el primer render:** `onAuthStateChanged` responde de forma asíncrona, así que en el primer render
> `isAuthenticated` todavía es `false`. Un usuario con sesión válida que entre directo a `/protected` puede ver un
> rebote al login antes de quedar en la ruta correcta. Es el tradeoff de no tener un estado `loading` en el Context.

### Archivos
- ✏️ [src/components/ui/ProtectedRoute/ProtectedRoute.tsx](file:///Users/diegograssino/repos/henry/m4_webpt36_2026_10/.ignored/current/src/components/ui/ProtectedRoute/ProtectedRoute.tsx) — conectar con `useAuth()`
- ✏️ `src/App.tsx` — quitar el `useState(false)` y la prop `isAuthenticated`
- ✏️ `src/layout.tsx` — dejar de recibir `isAuthenticated` por props
- ✏️ `src/components/views/Login/LoginForm.tsx` — `useLocation()` + redirección a `from`

### Criterio de verificación
- [ ] `/protected` sin sesión redirige a `/login`.
- [ ] Tras el login, el usuario aterriza en `/protected` (destino respetado).
- [ ] Con sesión activa, `/protected` renderiza el contenido protegido.
- [ ] El Navbar cambia entre "Iniciar sesión" / "Cerrar sesión" según el estado real.

---

## Fase 5: Manejo de errores ✅

### Contexto
Firebase devuelve un código de error (por ejemplo `auth/invalid-credential`). Cada código significa algo distinto.
Esta fase los traduce a **mensajes claros en español**.

### Objetivo
Sustituir los `alert()` genéricos por un mapeo centralizado de `FirebaseError.code` → mensaje en español.

### Pasos
1. **Crear la función de mapeo** — `src/utils/firebaseErrors.ts`
   ```ts
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
       return ERROR_MESSAGES[error.code] ?? DEFAULT_MESSAGE;
     }
     return DEFAULT_MESSAGE;
   };
   ```
2. **Integrar en `LoginForm` / `RegisterForm`** — reemplazar el `alert()` con texto fijo por `alert(getAuthErrorMessage(error))`.
   Se hace en los 4 `catch`: login con email, login con Google, registro con email, registro con Google.
3. **El popup cerrado** — `signInWithPopup` rechaza cuando el usuario cierra la ventana; el mensaje debe ser
   informativo, no un error genérico.

### Archivos
- 🆕 `src/utils/firebaseErrors.ts`
- ✏️ `src/components/views/Login/LoginForm.tsx`
- ✏️ `src/components/views/Register/RegisterForm.tsx`

### Criterio de verificación
- [x] Login con contraseña incorrecta → "Email o contraseña incorrectos."
- [x] Registro con email existente → "Ya existe una cuenta con ese email."
- [x] Popup de Google cerrado → "Cerraste la ventana de inicio de sesión."
- [x] Error de red → "Error de red. Revisa tu conexión."
- [x] Código no mapeado o error no-Firebase → mensaje genérico.
- [x] Ningún `alert()` queda con texto fijo en el código de la app.

---

## Fase 6: Verificación completa ⬜

### Objetivo
Prueba end-to-end de todos los flujos y cierre de la clase.

### Checklist de verificación
1. **Build limpio**
   - `npm run lint` → 0 errores.
   - `npx tsc --noEmit` → 0 errores de tipos.
   - `npm run build` → build de producción exitoso.
2. **Flujo email/password**
   - Registro nuevo → usuario creado → `navigate("/")`.
   - Logout → login con las mismas credenciales → sesión iniciada.
   - Recarga de página → la sesión persiste.
3. **Flujo Google**
   - Login con Google vía popup → sesión iniciada.
   - Recarga → la sesión persiste.
   - Logout con Google → vuelve al estado deslogueado.
4. **Rutas protegidas**
   - `/protected` sin sesión → `/login`.
   - `/protected` con sesión → contenido visible.
   - `/ruta-inexistente` → 404.
5. **Errores**
   - Todos los códigos de Firebase relevantes mapegan a un mensaje en español.
6. **Console de Firebase**
   - La pestaña **Users** muestra los usuarios creados en la clase.

### Comandos
```bash
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

---

## Fuera de alcance (esta clase)

- Persistencia con `localStorage` / IndexedDB (Redux persist, Zustand persist).
- Verificación de email (`sendEmailVerification`) y recuperação de contraseña (`sendPasswordResetEmail`).
- Roles/permisos y Custom Claims.
- Firebase Hosting / deploy a producción.
- Tests automatizados (unitarios o E2E).

---

## Comandos de referencia

```bash
# Instalar dependencias de la clase
npm install firebase react-router-dom

# Desarrollo
npm run dev

# Verificación (al cerrar cada fase)
npm run lint
npx tsc --noEmit
npm run build
```

### Regenerar `current` desde el template (si hace falta volver atrás)

```bash
cd /Users/diegograssino/repos/henry/m4_webpt36_2026_10/.ignored

# Copiar la base limpia del template
cp -R 8_template current

# Reinstalar dependencias
cd current && npm install
```

> ⚠️ **Advertencia:** este comando **borra** el trabajo acumulado en `current` (Fases 1 y 2).
> Solo usarlo si se decide volver a empezar desde cero de forma deliberada.
