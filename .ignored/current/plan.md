# Plan de Clase: Persistencia en la nube con Cloud Firestore

## Contexto general

**Objetivo de la clase:** migrar la persistencia de una TO-DO App desde `localStorage` hacia Cloud Firestore, con un
**service layer** tipado y una UI que maneja los estados de loading, error y data.

**Base:** la app de la clase 8 (autenticación con Firebase + React Router + Context). La TODO app entra como **ruta
protegida**: el `userId` sale del `useAuth()` que ya existe.

**El hilo de la clase:** la app **nunca** habla con el almacenamiento directamente — siempre pasa por el service. Eso
permite migrar de `localStorage` a Firestore **sin tocar ni el componente ni el `useEffect`**. Es la demostración
práctica de la separación de responsabilidades.

### Reglas de la clase

- **Sin estilos.** HTML plano.
- **El código en inglés, los textos en español** (misma convención que la clase 8).
- **Ejemplo simple.** La TODO app es la evolución del ejemplo de persistencia de la clase 5.

### El filtro no reemplaza las reglas

Un `permission-denied` aparece cuando Firestore rechaza una lectura o escritura porque las **reglas de seguridad** no
lo permiten. La forma más directa de provocarlo es pedir datos de otro usuario, o escribir cuando las reglas bloquean
el acceso.

**El filtro por `userId` en la consulta no reemplaza a esas reglas:** la consulta pide lo tuyo, y las reglas son las que
realmente impiden ver lo ajeno.

> Las reglas de seguridad en detalle se ven más adelante en la clase, en «Blindaje de datos».

### De `localStorage` a la nube: por qué

Guardar tareas con `localStorage` funciona hasta que aparecen los primeros límites:

- Si se borra el navegador, se pierde todo.
- Si se usa la app en otro dispositivo, el historial no viaja.
- Compartir la lista con alguien más es imposible sin complicarse.
- No hay forma sencilla de garantizar que cada usuario vea solo sus tareas, ni de proteger los datos de miradas ajenas.

**Persistir en la nube es dejar de pensar en "mi navegador" para diseñar alrededor de "mi usuario".**

> Con `localStorage` la libreta de tareas está en tu mochila: si perdés la mochila, perdés la libreta.
> En la nube, está en un archivo con tu nombre, y la ves desde cualquier lado después de identificarte.

### El modelo mental: de SQL a NoSQL

| Concepto SQL | Concepto NoSQL (Firestore) | En esta app |
|---|---|---|
| Tabla | Colección | `tasks` |
| Fila / Registro | Documento | cada tarea |
| Columna | Campo (Field) | `title`, `completed`, `userId`, `createdAt` |
| Primary Key | Document ID | lo genera Firestore |
| Join / Foreign Key | Referencia / ID Manual | el `userId` va **dentro** del documento |

**No hay tabla `users` ni join.** La tarea "sabe" a quién pertenece porque lleva el `userId` adentro. Eso permite
filtrar por usuario en una sola query.

**Firestore favorece el diseño "consulta primero"**: primero se define qué datos va a mostrar la interfaz, y recién
después se estructura el documento para que esa consulta sea posible y eficiente. La consulta central de esta app es
*"dame todas las tareas de este usuario, ordenadas por fecha de creación"* — eso define los campos.

> **Consecuencia del esquema flexible:** Firestore no se va a quejar si un documento tiene `userId` como número en vez
> de string. La consistencia depende del código que escribe los datos, no de la base.

---

## Fases del Proyecto

| Fase | Estado | Objetivo |
|------|--------|-----------|
| 0 | ✅ Completada | Carpeta `9`: la clase 8 completa, funcionando |
| 1 | ✅ Completada | Base de trabajo: `current` = copia de `9` |
| 2 | ✅ Completada | Tipado de las tareas |
| 3 | ✅ Completada | `taskService.ts` con localStorage (delay de 2 segundos) |
| 4 | ✅ Completada | `Tasks.tsx` con estados de loading, error y data |
| 5 | ✅ Completada | `ProtectedRoute`: que no expulse al usuario al recargar |
| 6 | ⬜ Pendiente | Migrar el service a Firestore: `where` + `addDoc` |
| 7 | ⬜ Pendiente | Verificación completa |

---

## Fase 0: Carpeta `9` con la clase 8 completa ✅

### Objetivo
Dejar el proyecto **tal como está en la clase 8**, pero en la carpeta `9`, con todo funcionando.

> Esta fase no agrega nada nuevo. Es el punto de partida de la clase 9: la misma app de la clase 8, lista para
> empezar a construir la TODO app encima.

### Pasos
1. **Copiar `/8` a `/9`:**
   ```bash
   cd /Users/diegograssino/repos/henry/m4_webpt36_2026_10
   rsync -a --exclude node_modules --exclude dist ./8/ ./9/
   cp ./8/.env ./9/.env
   ```
2. **Actualizar el nombre del proyecto** en `9/package.json` → `"name": "clase-9"`.
3. **Instalar dependencias:**
   ```bash
   cd 9 && npm install
   ```
4. **Verificar que todo funciona:**
   - `npm run lint` → sin errores.
   - `npx tsc --noEmit` → sin errores.
   - `npm run build` → build de producción exitoso.
   - `npm run dev` → se puede registrar un usuario, iniciar sesión y entrar a `/protected`.

### Archivos
- Todo el contenido de `/8/**` → `9/**`
- `9/package.json` → `name: "clase-9"`
- `9/.env` → credenciales de Firebase (ignorado por git)
- `9/README.md` → arranca **vacío**. Se va llenando con el detalle de cada fase a medida que se implementa.

### Criterio de verificación
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [x] La app de la clase 8 quedó completa en `9/`: auth, rutas protegidas, Context, Button, toast.
- [x] El `.env` está en el `.gitignore`.
- [ ] Se puede registrar un usuario, iniciar sesión y entrar a `/protected` (verificación manual en el navegador).

---

## Fase 1: Base de trabajo — `current` = copia de `9` ✅

### Objetivo
Dejar `.ignored/current` con la misma base que `9`, para trabajar la clase 9 encima.

> **`9/` queda como está** — es el entregable de la clase. Todo el desarrollo de la clase 9 ocurre en `current`.

### Pasos
1. **Copiar `9/` sobre `current/`:**
   ```bash
   cd /Users/diegograssino/repos/henry/m4_webpt36_2026_10
   rsync -a --exclude node_modules --exclude dist --exclude plan.md --exclude _borrador.md \
     ./9/ ./.ignored/current/
   ```
2. **Borrar el `.oxlintrc.json`** — venía del template de Vite nuevo; la clase 9 usa **ESLint** (igual que la clase 8).
3. **Reinstalar dependencias** (las del `package.json` de la clase 8):
   ```bash
   cd .ignored/current && npm install
   ```
4. **Verificar:**
   - `npm run lint` → sin errores.
   - `npx tsc --noEmit` → sin errores.
   - `npm run build` → build exitoso.

### Archivos
- `.ignored/current/src/**` → toda la app de la clase 8
- `.ignored/current/eslint.config.js` → con `allowExportNames: ['useAuth']`
- `.ignored/current/package.json` → firebase, react-router-dom, react-toastify; ESLint + TS 6
- `.ignored/current/.env` → credenciales

### Criterio de verificación
- [x] `current` y `9` tienen el mismo `src/`.
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [x] Se conserva `plan.md` y `_borrador.md` en `current` (no se sobreescribieron).

---

## Fase 2: Tipado de las tareas ✅

### Objetivo
Definir el modelo de datos de una tarea, tipado con TypeScript.

> **Diseño pensado desde la consulta final.** En NoSQL se diseña preguntándose primero qué va a mostrar la interfaz,
> y después se estructura el documento para que esa consulta sea posible. La consulta central de esta app es
> **"dame todas las tareas de este usuario, ordenadas por fecha de creación"** — eso define los campos.

### Pasos
1. **Crear `src/types/task.ts`:**
   ```typescript
   // FASE 1 - Una tarea. El userId la asocia al usuario autenticado.
   export interface Task {
     id: string;
     title: string;
     completed: boolean;
     userId: string;
     createdAt: string;
   }

   // FASE 1 - Los datos que se envían al service (sin id: lo genera Firestore)
   export type NewTask = Omit<Task, "id">;
   ```
2. **El documento guardado** — no lleva `id`, porque Firestore lo genera:
   ```json
   {
     "title": "Estudiar persistencia cloud",
     "completed": false,
     "userId": "bbmnJ5oTqXL2UAWunoIYjNFrXaJ2",
     "createdAt": "2024-06-15T09:48:20.123Z"
   }
   ```
   > El `id` es el **Document ID** que genera Firestore. Se recupera del snapshot al leer.

### El modelo mental: de SQL a NoSQL

| Concepto SQL | Concepto NoSQL (Firestore) | En esta app |
|---|---|---|
| Tabla | Colección | `tasks` |
| Fila / Registro | Documento | cada tarea |
| Columna | Campo (Field) | `title`, `completed`, `userId`, `createdAt` |
| Primary Key | Document ID | lo genera Firestore |
| Join / Foreign Key | Referencia / ID Manual | el `userId` va **dentro** del documento |

**No hay tabla `users` ni join.** La tarea "sabe" a quién pertenece porque lleva el `userId` adentro. Eso permite
filtrar por usuario en una sola query, sin operaciones adicionales.

> **Consecuencia del esquema flexible:** Firestore no se va a quejar si un documento tiene `userId` como número en vez
> de string. La consistencia depende del código que escribe los datos, no de la base.

### Archivos
- 🆕 `src/types/task.ts`

### Criterio de verificación
- [ ] `npx tsc --noEmit` sin errores.
- [ ] `Task` incluye `id`, `title`, `completed`, `userId` y `createdAt`.
- [ ] `NewTask` es `Task` sin `id`.

---

## Fase 3: `taskService.ts` con localStorage ✅

### Objetivo
Construir el service layer con la persistencia en `localStorage`, **con una demora de 2 segundos** para poder ver los
estados de carga en acción.

> **Esta es la fase clave de la clase.** El service se construye con `localStorage` para que en la fase 5 se vea que
> migrar a Firestore **no toca la app**.

### Pasos
1. **Crear `src/services/taskService.ts`** con las 4 operaciones del CRUD:

   ```typescript
   import type { NewTask, Task } from "../types/types";

   const STORAGE_KEY = "tasks";

   // FASE 1 - Tiempo de espera antes de responder, para que se vea el estado de carga.
   // Simula la latencia de red que tendrá Firestore.
   const STORAGE_DELAY_MS = 2000;

   /**
    * FASE 1 - Espera antes de leer o escribir en el storage.
    * Permite que se vea el estado de carga en la UI.
    */
   const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

   // FASE 1 - Leer todas las tareas
   export const getTasks = async (): Promise<Task[]> => {
     await delay(STORAGE_DELAY_MS);

     const localTasks = localStorage.getItem(STORAGE_KEY);
     if (localTasks === null) return [];

     return JSON.parse(localTasks) as Task[];
   };

   // FASE 1 - Crear una tarea
   export const addTask = async (task: NewTask): Promise<Task> => {
     await delay(STORAGE_DELAY_MS);

     const localTasks = localStorage.getItem(STORAGE_KEY);
     const tasks = localTasks === null ? [] : (JSON.parse(localTasks) as Task[]);

     const newTask: Task = {
       ...task,
       id: crypto.randomUUID(),
     };

     localStorage.setItem(STORAGE_KEY, JSON.stringify([...tasks, newTask]));

     return newTask;
   };

   // FASE 1 - Actualizar una tarea
   export const updateTask = async (task: Task): Promise<Task> => {
     await delay(STORAGE_DELAY_MS);

     const { id, ...changes } = task;

     const localTasks = localStorage.getItem(STORAGE_KEY);
     const tasks = localTasks === null ? [] : (JSON.parse(localTasks) as Task[]);

     const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, ...changes } : t));

     localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));

     return task;
   };

   // FASE 1 - Eliminar una tarea
   export const deleteTask = async (task: Task): Promise<Task> => {
     await delay(STORAGE_DELAY_MS);

     const { id } = task;

     const localTasks = localStorage.getItem(STORAGE_KEY);
     const tasks = localTasks === null ? [] : (JSON.parse(localTasks) as Task[]);

     localStorage.setItem(
       STORAGE_KEY,
       JSON.stringify(tasks.filter((t) => t.id !== id))
     );

     return task;
   };
   ```

   **Detalles:**
   - El `id` lo genera la app con `crypto.randomUUID()`. En Firestore lo genera el Document ID.
   - El delay va con una constante (`STORAGE_DELAY_MS`), como el `REDIRECT_DELAY_MS` de `helpers/navigation.ts`.
   - Cada export es autocontenida: delay + leer + transformar + escribir + devolver.

2. **Revisar el service** — la app nunca llama a `localStorage` directo, siempre pasa por acá.

### Archivos
- 🆕 `src/services/taskService.ts`

### Criterio de verificación
- [x] `npx tsc --noEmit` sin errores.
- [x] Las 4 operaciones tardan 2 segundos en resolver.
- [x] `addTask()` guarda la tarea en `localStorage` bajo la llave `tasks` y la devuelve con `id`.
- [x] `updateTask()` cambia el `completed` y devuelve la tarea actualizada.
- [x] `deleteTask()` saca la tarea del storage.

---

## Fase 4: `Tasks.tsx` con estados de loading, error y data ✅

### Objetivo
Integrar React con el service: la UI pide los datos al service y maneja los tres estados.

### Pasos
1. **Crear `src/components/views/Tasks/Tasks.tsx`:**
   ```typescript
   import { useEffect, useState } from "react";
   import Button from "../../ui/Button/Button";
   import { useAuth } from "../../../contexts/AuthContext.tsx";
   import {
     addTask,
     deleteTask,
     getTasks,
     updateTask,
   } from "../../../services/taskService";
   import type { Task } from "../../../types/types";

   const Tasks = () => {
     // FASE 2 - El userId sale del Context (ya existe de la clase 8)
     const { user } = useAuth();

     const [tasks, setTasks] = useState<Task[]>([]);
     // Un solo loading: cubre la carga inicial y todas las operaciones (crear, completar, eliminar)
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     const [title, setTitle] = useState<string>("");

     // FASE 2 - Al montar, pedir las tareas al service
     useEffect(() => {
       const loadTasks = async () => {
         try {
           const data = await getTasks();
           setTasks(data);
         } catch {
           setError("No se pudieron cargar las tareas.");
         } finally {
           setLoading(false);
         }
       };

       loadTasks();
     }, []);

     // FASE 2 - Crear una tarea y agregarla al estado, sin recargar la página
     const handleSubmit = async (e: React.SubmitEvent) => {
       e.preventDefault();
       if (title.length < 2) return;

       setLoading(true);

       try {
         const newTask = await addTask({
           title: title,
           completed: false,
           userId: user?.uid ?? "",
           createdAt: new Date().toISOString(),
         });

         setTasks([...tasks, newTask]);
         setTitle("");
       } catch {
         setError("No se pudo crear la tarea.");
       } finally {
         setLoading(false);
       }
     };

     // FASE 2 - Marcar una tarea como completada o pendiente
     const handleToggle = async (task: Task) => {
       setLoading(true);

       try {
         const updated = await updateTask({ ...task, completed: !task.completed });

         setTasks(
           tasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
         );
       } catch {
         setError("No se pudo actualizar la tarea.");
       } finally {
         setLoading(false);
       }
     };

     // FASE 2 - Eliminar una tarea
     const handleDelete = async (task: Task) => {
       setLoading(true);

       try {
         const deleted = await deleteTask(task);
         setTasks(tasks.filter((t) => t.id !== deleted.id));
       } catch {
         setError("No se pudo eliminar la tarea.");
       } finally {
         setLoading(false);
       }
     };

     // FASE 2 - Early returns: si está cargando, muestra cargando.
     // Si hay error, muestra el error. Si no, muestra los datos.
     if (loading) {
       return <p>Cargando tareas...</p>;
     }

     if (error) {
       return <p>Error: {error}</p>;
     }

     return (
       <div>
         <h1>Mis tareas</h1>

         <form onSubmit={handleSubmit}>
           <label htmlFor="task-title">Nueva tarea:</label>
           <br />
           <input
             id="task-title"
             type="text"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             placeholder="Escribí una tarea"
           />
           <br />
           <Button type="submit" disabled={title.length < 2}>
             Agregar
           </Button>
         </form>

         {tasks.length === 0 ? (
           <p>No hay tareas todavía.</p>
         ) : (
           <ul>
             {tasks.map((task) => (
               <li key={task.id}>
                 <p>{task.title}</p>
                 <p>
                   {task.completed ? "Completada" : "Pendiente"} ·{" "}
                   {new Date(task.createdAt).toLocaleString("es")}
                 </p>
                 <Button onClick={() => void handleToggle(task)}>
                   {task.completed ? "Marcar pendiente" : "Completar"}
                 </Button>
                 <Button
                   variant="danger"
                   onClick={() => void handleDelete(task)}
                 >
                   Eliminar
                 </Button>
               </li>
             ))}
           </ul>
         )}
       </div>
     );
   };

   export default Tasks;
   ```

2. **Agregar la ruta** en `src/App.tsx`:
   ```typescript
   import Tasks from "./components/views/Tasks/Tasks";

   <Route element={<ProtectedRoute />}>
     <Route path="tasks" element={<Tasks />} />
   </Route>
   ```
   Y se borra `src/components/views/Protected/Protected.tsx`.

3. **Actualizar el link de la Navbar** — el texto pasa de "Protegido" a "Tareas":
   ```tsx
   <li>
     <Link to="/tasks">Tareas</Link>
   </li>
   ```

4. **Probar el flujo:**
   - Entrar a `/tasks` → muestra "Cargando tareas..." → a los 2 segundos muestra la lista.
   - Cada tarea muestra su título, su estado ("Completada" / "Pendiente") y la fecha de creación.
   - Agregar una tarea → aparece "Cargando tareas..." → a los 2 segundos vuelve la lista con la tarea nueva, sin
     recargar la página.
   - "Completar" → aparece "Cargando tareas..." → la tarea pasa a "Completada".
   - "Eliminar" → aparece "Cargando tareas..." → la tarea desaparece de la lista.
   - Recargar la página → los cambios siguen ahí (vienen del `localStorage`).

### Archivos
- 🆕 `src/components/views/Tasks/Tasks.tsx`
- ✏️ `src/App.tsx` — la ruta `tasks` apunta a `Tasks`
- ✏️ `src/components/ui/Navbar/Navbar.tsx` — el link dice "Tareas" y apunta a `/tasks`
- 🗑️ `src/components/views/Protected/Protected.tsx` — borrado

### Criterio de verificación
- [x] `/tasks` sin sesión redirige a `/login`.
- [x] `/tasks` con sesión muestra "Cargando tareas..." y luego la lista.
- [x] Agregar una tarea la muestra en la lista sin recargar la página.
- [x] Completar y eliminar funcionan sobre el estado local.

---

## Fase 5: `ProtectedRoute` sin expulsar al usuario al recargar ✅

### Contexto
Al hacer F5 en una ruta protegida, el guard **siempre** redirigía a `/login`, aunque la sesión siguiera viva.

### El problema
El guard decidía en el **primer render**, cuando el Context todavía tenía `user = null`. El `useEffect` con
`onAuthStateChanged` corre **después** del primer render, así que el guard consultaba `isAuthenticated` antes de que el
listener respondiera.

La sesión no se pierde — sigue viva en Firebase. Lo que falla es el **momento** de la consulta.

### Objetivo
Que el guard espere a que Firebase le diga si hay sesión, antes de redirigir o dejar pasar.

### Pasos
1. **Suscribir el guard directo a `onAuthStateChanged`** — `src/components/ui/ProtectedRoute/ProtectedRoute.tsx`:
   ```typescript
   import { useEffect, useState } from "react";
   import { Navigate, Outlet } from "react-router";
   import { onAuthStateChanged } from "firebase/auth";
   import { auth } from "../../../firebase/config";

   const ProtectedRoute = () => {
     const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
     const [loading, setLoading] = useState<boolean>(true);

     // Listener propio del guard: espera a que Firebase responda si hay sesion
     // antes de decidir si redirige o deja pasar
     useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
         setIsAuthenticated(Boolean(currentUser));
         setLoading(false);
       });

       return unsubscribe;
     }, []);

     // Todavia no sabemos si hay sesion: todavia no redirigir
     if (loading) {
       return <p>Cargando...</p>;
     }

     // Sin sesion: mandar al login
     if (!isAuthenticated) {
       return <Navigate to="/login" replace />;
     }

     return <Outlet />;
   };
   ```

### Archivos
- ✏️ `src/components/ui/ProtectedRoute/ProtectedRoute.tsx`

### Criterio de verificación
- [x] Con sesión activa, F5 en `/tasks` → queda en `/tasks` (no redirige).
- [x] Sin sesión, entrar a `/tasks` → redirige a `/login`.
- [x] `npm run lint` y `npx tsc --noEmit` sin errores.

---

## Fase 6: Migrar el service a Firestore ⬜

### Objetivo
**Cambiar solo el service** para que la persistencia esté en la nube. La app y la UI no se tocan.

> **El filtro por `userId` no reemplaza las reglas de seguridad.** La consulta pide lo tuyo; las reglas son las que
> realmente impiden ver lo ajeno.
>
> Pero hay un detalle sutil: **Firestore nunca "filtra" resultados sobre lo que no está autorizado.** Si la consulta
> pudiera traer datos de otro usuario y la regla no lo permite, la consulta **se bloquea** — no llega una lista vacía,
> sino un error de permisos. Por eso la query **debe** filtrar por `userId == uid`: no para proteger (eso lo hacen las
> reglas), sino porque solo así la consulta **pasa la validación de seguridad** del backend.

```
Usuario autenticado (uid)  →  Consulta filtrada (userId == uid)  →  Regla: request.auth.uid == userId  →  Acceso solo a sus datos
```

### Pasos
1. **Configurar Firebase + Firestore**
   - En Firebase Console → **Base de datos y almacenamiento → Firestore Database** → **Crear base de datos**.
     - **Nombre (ID):** el mismo que el proyecto. No se puede cambiar después.
     - **Edición:** **Standard** (gratis). Enterprise es de pago.
     - **Ubicación:** la más cercana a los usuarios, porque **no se puede cambiar después**. Para México,
       Centroamérica y Sudamérica: **`us-central1`** (la mejor cobertura de la región), o `southamerica-east1`
       si los usuarios están en Brasil o el Cono Sur.
     - **Modo:** **Modo producción** (todo bloqueado). El modo prueba genera `allow read, write: if true;`.
     - **Copia de seguridad:** **no** (función de pago del plan Enterprise).
   - En `src/firebase/config.ts`, agregar la instancia:
     ```typescript
     import { getFirestore } from "firebase/firestore";
     // ...
     export const db = getFirestore(app);
     ```

2. **Configurar las reglas de seguridad** en Firebase Console → **Firestore Database → Reglas**.

   Regla de ownership por documento, con validación de forma:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Deniega todo por defecto
       match /{document=**} {
         allow read, write: if false;
       }

       // Colección de tareas protegida por ownership
       match /tasks/{taskId} {
         // Chequea si hay un usuario autenticado
         function isSignedIn() {
           return request.auth != null;
         }

         // Verifica que el usuario actual sea el dueño del documento ya existente (lectura/update/delete)
         function isOwnerExisting() {
           return isSignedIn() && request.auth.uid == resource.data.userId;
         }

         // Verifica que al crear, el userId que se quiere guardar sea igual al del usuario autenticado
         function isOwnerIncoming() {
           return isSignedIn() && request.auth.uid == request.resource.data.userId;
         }

         // Validación mínimamente estricta del formato del documento
         function hasValidShape() {
           return request.resource.data.keys().hasAll(['title', 'completed', 'userId', 'createdAt'])
             && request.resource.data.title is string
             && request.resource.data.completed is bool
             && request.resource.data.userId is string
             && request.resource.data.createdAt is string;
         }

         // Lectura solo para el dueño
         allow get, list: if isOwnerExisting();

         // Creación: solo si el userId propuesto y el de auth coinciden, y el documento tiene buena forma
         allow create: if isOwnerIncoming() && hasValidShape();

         // Update: solo el dueño, el userId no cambia, y el formato es válido
         allow update: if isOwnerExisting()
           && request.resource.data.userId == resource.data.userId
           && hasValidShape();

         // Delete: solo el dueño puede borrar
         allow delete: if isOwnerExisting();
       }
     }
   }
   ```

   Desglose:
   - **Negar todo por defecto** — obliga a declarar cada excepción explícitamente.
   - **Ownership en lectura y escritura** — `get` y `list` validan el dueño con `resource.data` (lo ya guardado).
     Las creaciones validan con `request.resource.data` (el documento aún no existe).
   - **Control de formas y mutabilidad** — al actualizar, no se permite cambiar el `userId`.

3. **Cambiar la implementación del service** — `src/services/taskService.ts`:
   ```typescript
   import {
     addDoc,
     collection,
     getDocs,
     orderBy,
     query,
     where,
   } from "firebase/firestore";
   import { db } from "../firebase/config";
   import type { NewTask, Task } from "../types/types";

   const TASKS_COLLECTION = "tasks";

   // FASE 5 - Leer las tareas del usuario, ordenadas por fecha de creación
   export const getTasks = async (userId: string): Promise<Task[]> => {
     const q = query(
       collection(db, TASKS_COLLECTION),
       where("userId", "==", userId),
       orderBy("createdAt", "desc"),
     );

     const snapshot = await getDocs(q);

     return snapshot.docs.map((doc) => ({
       id: doc.id,
       ...(doc.data() as Omit<Task, "id">),
     }));
   };

   // FASE 5 - Crear una tarea en la nube
   export const addTask = async (task: NewTask): Promise<Task> => {
     const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);

     return {
       id: docRef.id,
       ...task,
     };
   };
   ```
   > **Fijate:** el `setTimeout` de 2 segundos desaparece. Ya no hace falta simular la latencia — Firestore es real.
   >
   > Lo que **sí** cambia respecto del service con `localStorage`: la lectura recibe el `userId` (para el `where`), el
   > `id` lo genera Firestore en vez de la app, y se agrega el `orderBy`.

4. **Pasar el `userId` desde el Context** — en `Tasks.tsx`:
   ```typescript
   useEffect(() => {
     const loadTasks = async () => {
       if (!user) return;
       try {
         const data = await getTasks(user.uid);
         setTasks(data);
       } catch (err) {
         setError("No se pudieron cargar las tareas.");
       } finally {
         setLoading(false);
       }
     };

     loadTasks();
   }, [user]);
   ```
   Y al crear:
   ```typescript
   const newTask = await addTask({
     title: title,
     completed: false,
     userId: user?.uid ?? "",
     createdAt: new Date().toISOString(),
   });
   ```

7. **Crear el índice compuesto** — la primera consulta falla con
   `Error: The query requires an index`. Es porque la consulta usa **dos** filtros a la vez (un `where` por `userId` y un
   `orderBy` por `createdAt`) y Firestore necesita un **índice compuesto** para filtrar y ordenar al mismo tiempo.
   Además lo necesita para poder evaluar las reglas de ownership sobre los documentos que coinciden con el filtro.

   - Clic en el link `You can create it here` del error (abre la consola con el índice ya configurado).
   - Colección `tasks`, campo 1 `userId` ascendente, campo 2 `createdAt` descendente.
   - Clic en **Crear índice**. Los índices se crean **de forma asíncrona**: tarda unos minutos.
   - Mientras se construye, la consulta sigue fallando pero con otro mensaje:
     `That index is currently building and cannot be used yet.` — el índice ya se está creando.
     La app sigue funcionando: se puede leer y escribir en la base. Solo falla la consulta que lo necesita.
   - Cuando el índice esté listo, recargar la página → las tareas cargan.

   **Cuándo hace falta un índice compuesto:** Firestore crea solo los índices de **un campo**; los de varios campos hay
   que crearlos a mano.

   | Situación | ¿Índice compuesto? |
   |-----------|--------------------|
   | Un solo `where` con `==` | ❌ No |
   | Un `where` con `==` + `orderBy` de **otro** campo | ✅ **Sí** |
   | Varios `where` con `==` | ❌ No (Firestore los **combina**) |
   | Dos o más filtros de **rango** (`<`, `>`, `<=`, `>=`) en campos distintos | ✅ **Sí** |
   | `array-contains` o `in` + otro filtro | ✅ **Sí** |

   > Si el filtro y el `orderBy` usan el **mismo** campo, tampoco hace falta índice compuesto.

8. **Verificar en Firebase Console:**
   - **Firestore Database → Colección `tasks`** → aparecen los documentos con `title`, `completed`, `userId` y `createdAt`.
   - El `id` del documento es el que devuelve `addDoc`.
   - Recargar la página → las tareas vienen de la nube, no del `localStorage`.

9. **Capturar el `permission-denied`** — Firestore lanza el error, hay que atraparlo. Para no repetir el chequeo en
   cada handler, primero un helper en `src/helpers/errors.ts`:
   ```typescript
   // FASE 6 - True si Firebase rechazo la operacion por falta de permisos
   export const isPermissionDenied = (error: unknown): boolean =>
     error instanceof FirebaseError && error.code === "permission-denied";
   ```
   Y despues los cuatro handlers (cargar, crear, completar, eliminar) lo usan:
   ```typescript
   import { isPermissionDenied } from "../../../helpers/errors";

   try {
     const data = await getTasks(user.uid);
     setTasks(data);
   } catch (error) {
     setError(
       isPermissionDenied(error)
         ? "No tenés permiso para ver estas tareas."
         : "No se pudieron cargar las tareas.",
     );
   }
   ```
   > **Cómo se provoca:** con las reglas restrictivas, una lectura no permitida (cambiar el `userId` de la consulta, o
   > pedir un documento directo sin filtro) falla con `permission-denied`. Con `allow write: if false` falla la escritura.
   >
   > **Acordate:** el filtro por `userId` no reemplaza las reglas. La consulta pide lo tuyo; las reglas son las que
   > realmente impiden ver lo ajeno. Las reglas en detalle se ven en «Blindaje de datos».

10. **Eliminar el `localStorage`** — en `taskService.ts` ya no queda nada de `localStorage`. Se puede verificar en
   DevTools → Application → Local Storage: la llave `tasks` ya no se escribe.

### Archivos
- ✏️ `src/services/taskService.ts` — implementación con Firestore (el service **solo** cambia)
- ✏️ `src/components/views/Tasks/Tasks.tsx` — pasar el `userId` desde `useAuth()`, capturar `permission-denied`

### Criterio de verificación
- [ ] Los documentos aparecen en Firestore Console → Colección `tasks`.
- [ ] Cada documento tiene `title`, `completed`, `userId` y `createdAt`.
- [ ] La consulta filtra por `userId` y ordena por `createdAt`.
- [ ] Con dos usuarios distintos, cada uno ve solo sus tareas.
- [ ] Al recargar, las tareas vienen de la nube.
- [ ] Con las reglas restrictivas, una operación no permitida responde `permission-denied` y la UI muestra el mensaje.
- [ ] El `localStorage` ya no se usa.

---

## Fase 7: Verificación completa ⬜

### Objetivo
Prueba end-to-end de todos los flujos y cierre de la clase.

### Checklist
1. **Build limpio**
   - `npm run lint` → 0 errores.
   - `npx tsc --noEmit` → 0 errores de tipos.
   - `npm run build` → build de producción exitoso.
2. **Auth (de la clase 8)**
   - Registro, login, logout, persistencia de sesión al recargar.
   - `/protected` bloqueada sin sesión.
3. **Tareas**
   - `/protected` con sesión → lista las tareas del usuario.
   - Agregar una tarea → aparece sin recargar.
   - Recargar → sigue ahí (viene de Firestore).
4. **Filtrado**
   - Con dos usuarios, cada uno ve solo las suyas.
5. **Errores**
   - Con las reglas restrictivas, la UI muestra el mensaje de `permission-denied`.
6. **Console de Firebase**
   - La colección `tasks` tiene los documentos esperados.

---

## Fuera de alcance

- Autenticación nueva (se reutiliza la de la clase 8).
- Editar, completar o eliminar tareas (solo crear y listar).
- Paginación, ordenamiento o filtros combinables.
- Tests automatizados.
- Deployment a producción.

---

## Comandos de referencia

```bash
# Desarrollo
npm run dev

# Verificación
npm run lint
npx tsc --noEmit
npm run build
```
