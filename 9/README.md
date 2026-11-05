# Plan de Clase: Persistencia en la nube con Cloud Firestore

## Fases del Proyecto
- [x] **Fase 0: Base — la clase 8 completa, funcionando**
- [x] **Fase 1: Base de trabajo — `current` = copia de `9`**
- [x] **Fase 2: Tipado de las tareas**
- [x] **Fase 3: `taskService.ts` con localStorage**
- [x] **Fase 4: `Tasks.tsx` con estados de loading, error y data**
- [x] **Fase 5: Arreglar el `ProtectedRoute` para que no expulse al usuario al recargar**
- [ ] **Fase 6: Migrar el service a Firestore**
- [ ] **Fase 7: Verificación completa**

> **Los comentarios `FASE N` del código siguen la numeración del curso**, no la de este README:
> - **FASE 1** → el service con `localStorage` (la Fase 3 de este README).
> - **FASE 2** → el componente `Tasks.tsx` (la Fase 4 de este README).
> - **FASE 6** → la migración a Firestore (la Fase 6 de este README).
>
> **El código va en inglés, los textos en español.** Los nombres de archivos, funciones, variables y tipos se escriben
> en inglés. Todo lo que el usuario ve en pantalla (títulos, botones, labels, mensajes de error, toasts) va en español.

---

## Punto de partida

La clase 9 arranca con la **app de la clase 8** completa y funcionando: autenticación con Firebase, rutas protegidas,
Context con `useAuth`, componente `Button` y toasts.

Sobre esa base se construye la **TODO app**, que vive en la ruta protegida `/tasks`. El `userId` de cada tarea sale
del `useAuth()` que ya existe.

### Estructura

```
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Footer/
│   │   ├── Navbar/
│   │   └── ProtectedRoute/
│   └── views/
│       ├── Home/
│       ├── Login/
│       ├── Register/
│       └── Tasks/         → la TODO app (ruta /tasks)
├── contexts/
│   └── AuthContext.tsx
├── firebase/
│   └── config.ts
├── helpers/
│   ├── auth.ts
│   ├── errors.ts
│   ├── navigation.ts
│   └── validations.ts
├── services/
│   └── taskService.ts
├── types/
│   └── types.ts
├── App.tsx
├── layout.tsx
└── main.tsx
```

### Reglas de la clase

- **Sin estilos.** HTML plano.
- **El service layer desde el día 1.** La app nunca habla con `localStorage` directo: siempre pasa por el service.
  Eso permite migrar a Firestore sin tocar el componente ni el `useEffect`.
- **Ejemplo simple.** La TODO app es la evolución del ejemplo de persistencia de la clase 5.

---

## De `localStorage` a la nube: por qué

Guardar tareas con `localStorage` funciona hasta que aparecen los primeros límites:

- Si se borra el navegador, se pierde todo.
- Si se usa la app en otro dispositivo, el historial no viaja.
- Compartir la lista con alguien más es imposible sin complicarse.
- No hay forma sencilla de garantizar que cada usuario vea solo sus tareas, ni de proteger los datos de miradas ajenas.

**Persistir en la nube es dejar de pensar en "mi navegador" para diseñar alrededor de "mi usuario".**

> Con `localStorage` la libreta de tareas está en tu mochila: si perdés la mochila, perdés la libreta.
> En la nube, está en un archivo con tu nombre, y la ves desde cualquier lado después de identificarte.

---

## Fase 2: Tipado de las tareas

> **Diseño pensado desde la consulta final.** En NoSQL se diseña preguntándose primero qué va a mostrar la interfaz,
> y después se estructura el documento para que esa consulta sea posible. La consulta central de esta app es
> **"dame todas las tareas de este usuario, ordenadas por fecha de creación"** — eso define los campos.

### 1. Agregar a `src/types/types.ts`

```typescript
// FASE 1 - A task. The userId ties it to the authenticated user.
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

// FASE 1 - The data we send to the service (without id: the storage generates it)
export type NewTask = Omit<Task, "id">;
```

### 2. El documento guardado

No lleva `id`, porque Firestore lo genera:

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
filtrar por usuario en una sola query.

> **Consecuencia del esquema flexible:** Firestore no se va a quejar si un documento tiene `userId` como número en vez
> de string. La consistencia depende del código que escribe los datos, no de la base.

---

## Fase 3: `taskService.ts` con localStorage

### 1. Crear `src/services/taskService.ts`

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
```

**Detalles:**
- El `id` lo genera la app con `crypto.randomUUID()`. En Firestore lo genera el Document ID.
- El delay va con una constante (`STORAGE_DELAY_MS`), como el `REDIRECT_DELAY_MS` de `helpers/navigation.ts`.

### 2. Revisar el service
La app nunca llama a `localStorage` directo, siempre pasa por acá.

---

## Fase 4: `Tasks.tsx` con estados de loading, error y data

### 1. Crear `src/components/views/Tasks/Tasks.tsx`

```typescript
import { useEffect, useState } from "react";
import Button from "../../ui/Button/Button";
import { useAuth } from "../../../contexts/AuthContext.tsx";
import { addTask, getTasks } from "../../../services/taskService";
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tasks;
```

### 2. Agregar el update y el delete al service

```typescript
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

### 3. Los handlers en `Tasks.tsx`

```typescript
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
```

Y los botones en la lista:

```tsx
<Button onClick={() => void handleToggle(task)}>
  {task.completed ? "Marcar pendiente" : "Completar"}
</Button>
<Button
  variant="danger"
  onClick={() => void handleDelete(task)}
>
  Eliminar
</Button>
```

### 4. Reemplazar `Protected` por `Tasks` en el ruteo

En `src/App.tsx`:

```typescript
import Tasks from "./components/views/Tasks/Tasks";

<Route element={<ProtectedRoute />}>
  <Route path="tasks" element={<Tasks />} />
</Route>
```

Y se borra `src/components/views/Protected/Protected.tsx`.

### 5. Actualizar el link de la Navbar

En `src/components/ui/Navbar/Navbar.tsx`, el link apuntaba a la vista protegida con el texto "Protegido". Ahora que esa
vista es la TODO app, el texto pasa a ser "Tareas" y la ruta pasa a ser `/tasks`:

```tsx
<li>
  <Link to="/tasks">Tareas</Link>
</li>
```

### 6. Probar el flujo
- Entrar a `/tasks` → muestra "Cargando tareas..." → a los 2 segundos muestra la lista.
- Cada tarea muestra su título, su estado ("Completada" / "Pendiente") y la fecha de creación.
- Agregar una tarea → aparece "Cargando tareas..." → a los 2 segundos vuelve la lista con la tarea nueva, sin
  recargar la página.
- "Completar" → aparece "Cargando tareas..." → la tarea pasa a "Completada".
- "Eliminar" → aparece "Cargando tareas..." → la tarea desaparece de la lista.
- Recargar la página → los cambios siguen ahí (vienen del `localStorage`).

---

## Fase 5: Arreglar el `ProtectedRoute`

### El problema

Al hacer F5 en una ruta protegida, el guard **siempre** redirigía a `/login`, aunque la sesión siguiera viva.

La causa: el guard decide en el **primer render**, y en ese render el Context todavía tiene `user = null`
(el estado inicial). El `useEffect` con `onAuthStateChanged` corre **después** del primer render, así que el guard
consultaba `isAuthenticated` antes de que el listener respondiera.

La sesión no se pierde — sigue viva en Firebase. Lo que falla es el **momento** de la consulta.

### La solución

El guard se suscribe **directo** a `onAuthStateChanged` y espera a que Firebase le responda antes de decidir.

**Archivo:** `src/components/ui/ProtectedRoute/ProtectedRoute.tsx`

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

> **Por qué un booleano y no el `user`:** el guard solo necesita saber **si** hay sesión, no **quién** es. Guardar el
> `user` completo sería un estado que no se usa (el `user` real lo tiene el Context, que ya lo expone).

### Qué cambió

| Antes | Ahora |
|-------|-------|
| Leía `isAuthenticated` del Context | Se suscribe directo a `onAuthStateChanged` |
| Decidía en el primer render | Espera a que Firebase responda |
| Sin sesión → `/login` (siempre, incluso con sesión) | Sin sesión → `/login` / Con sesión → deja pasar |

### Probar el flujo

- Con sesión activa, hacer F5 en `/tasks` → muestra "Cargando..." un instante y **queda en `/tasks`**.
- Sin sesión, entrar a `/tasks` → redirige a `/login`.
- Con sesión, cerrar sesión desde el Navbar → la ruta protegida deja de dejar pasar.

---

## Fase 6: Migrar el service a Firestore

> **Esta es la fase donde la app deja de guardar las tareas en el navegador.** Pero lo mejor de la clase es que
> **solo cambia el service**: el componente `Tasks.tsx` y su `useEffect` quedan exactamente como están.

### 1. Crear la base de datos en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com/) y abrir el proyecto.
2. Menú lateral → **Base de datos y almacenamiento → Firestore Database**.
3. Clic en **Crear base de datos**.

   **a) Elige el nombre (ID) de la base de datos**

   Por defecto viene el mismo nombre que el proyecto. Se puede cambiar, pero conviene dejarlo:

   - Si después querés crear otra base de datos en el mismo proyecto, el nombre tiene que ser **único**.
   - El ID **no se puede cambiar** después de crearla.
   - Es el nombre que aparece en las reglas de seguridad y en la URL de la base.

   **b) Elige la edición**

   Firebase ofrece dos ediciones de Firestore:

   | Edición | Qué incluye | Precio |
   |---------|-------------|--------|
   | **Standard** | La edición básica. Alcanza para el 95% de las apps. | **Gratis** hasta un límite generoso de operaciones |
   | Enterprise | Funciones avanzadas de administer, backups y más control | De pago |

   Para esta clase, elegí **Standard**.

   **c) Elige la ubicación**

   Acá se elige **en qué región del mundo** se van a guardar los datos. **No se puede cambiar después.**

   - Elegí la ubicación **más cercana a tus usuarios**, porque cada lectura y cada escritura viaja hasta esa región.
     Cuanto más lejos, más lenta la app.
   - También se puede elegir la que **sepas que tiene mejor conectividad** con tu proyecto (si ya tenés una base
     en otra región, conviene mantener todo junto).

   **Para México,Centroamérica y Sudamérica, las mejores opciones son:**

   | Región | Cuándo elegirla |
   |--------|-----------------|
   | **`us-central1` (Iowa, USA)** | La mejor cobertura para **todo** México, Centroamérica y el norte de Sudamérica. Es la que menos latencia tiene desde la mayoría de los países de la región. |
   | `us-east1` (South Carolina, USA) | Alternativa razonable, algo más lejos que `us-central1`. |
   | `southamerica-east1` (São Paulo, Brasil) | Ideal si tus usuarios están en **Brasil** o en el Cono Sur (Argentina, Chile, Uruguay). |

   > En la práctica: **`us-central1`** para la mayoría de los casos de la región. Si el proyecto ya tiene una base en otra
   > región, mejor mantener la misma para no repartir los datos.

   **d) Elige el modo de seguridad**

   | Modo | Qué hace |
   |------|----------|
   | **Modo producción** | Todo bloqueado por defecto. Hay que escribir las reglas de seguridad para poder leer o escribir. |
   | Modo prueba | Genera `allow read, write: if true;` — cualquiera que conozca el Project ID puede leer, escribir y borrar todos los documentos, sin autenticación. |

   Elegí **Modo producción**. El modo prueba es el estado más peligroso posible para datos reales, y las reglas se
   escriben en el paso siguiente de esta misma fase.

   **e) Decidí si querés copia de seguridad**

   Firebase ofrece **copias de seguridad automáticas** (backups) de la base de datos. Es una función **de pago** del plan
   Enterprise.

   Para esta clase, elegí **no**. Los datos de la TODO app de ejemplo no lo justifican, y las reglas de seguridad ya
   protegen el acceso.

4. Clic en **Crear**. La base de datos queda lista (la colección `tasks` se crea sola con el primer documento).

### 2. Configurar las reglas de seguridad

En la pestaña **Reglas** de Firestore, reemplazar todo por:

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

Clic en **Publicar**.

**Qué hace cada parte:**
- **Negar todo por defecto** — obliga a declarar cada excepción explícitamente.
- **`request.auth`** — el usuario autenticado (`{ uid: "..." }`) o `null` si no hay sesión.
- **`resource.data`** — los datos actuales del documento (en lectura, update y delete).
- **`request.resource.data`** — los valores propuestos (en create, cuando el documento todavía no existe).
- **Ownership** — cada usuario solo puede ver, crear, modificar y borrar sus propias tareas.

> **El filtro por `userId` no reemplaza a las reglas.** La consulta pide lo tuyo; las reglas son las que realmente impiden
> ver lo ajeno. Además, **Firestore nunca "filtra" resultados sobre lo que no está autorizado**: si la consulta pudiera
> traer datos de otro usuario y la regla no lo permite, la consulta **se bloquea** — no llega una lista vacía, sino un
> error de permisos. Por eso la query **debe** filtrar por `userId == uid`: no para proteger (eso lo hacen las reglas),
> sino porque solo así la consulta **pasa la validación de seguridad** del backend.

### 3. Agregar Firestore a la configuración

**Archivo:** `src/firebase/config.ts`

```typescript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Este objeto sera la auth con user y pass
export const auth = getAuth(app);
// This object will be the one we use for the google login
export const googleProvider = new GoogleAuthProvider();
// FASE 6 - This object is the Firestore database
export const db = getFirestore(app);
```

> No hacen falta variables de entorno nuevas: Firestore usa las mismas credenciales.

### 4. Cambiar la implementación del service

**Archivo:** `src/services/taskService.ts`

La App no cambia — solo la implementación del service:

```typescript
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { NewTask, Task } from "../types/types";

const TASKS_COLLECTION = "tasks";

// FASE 6 - Leer las tareas del usuario, ordenadas por fecha de creación
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

// FASE 6 - Crear una tarea en la nube
export const addTask = async (task: NewTask): Promise<Task> => {
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);

  return {
    id: docRef.id,
    ...task,
  };
};

// FASE 6 - Actualizar una tarea
export const updateTask = async (task: Task): Promise<Task> => {
  const { id, ...changes } = task;

  await updateDoc(doc(db, TASKS_COLLECTION, id), changes);

  return task;
};

// FASE 6 - Eliminar una tarea
export const deleteTask = async (task: Task): Promise<Task> => {
  const { id } = task;

  await deleteDoc(doc(db, TASKS_COLLECTION, id));

  return task;
};
```

> **Más ejemplos de consultas:** en `src/services/taskQueries.ts` hay 8 consultas con los distintos operadores
> (`==`, `!=`, `>=`, `in`, `array-contains`, `orderBy`, `limit`) y cuándo usar cada una. La explicación de los
> operadores está en la sección «Consultas en Firestore: los operadores».

**Qué cambió respecto del service con `localStorage`:**

| Antes (localStorage) | Ahora (Firestore) |
|---|---|
| `await delay(STORAGE_DELAY_MS)` en cada operación | Ya no hace falta simular la latencia — Firestore es real |
| El `id` lo genera la app (`crypto.randomUUID()`) | El `id` lo genera Firestore (el **Document ID**) |
| `getTasks()` sin argumentos | `getTasks(userId)` — necesita el `userId` para el `where` |
| Se leía y escribía con `localStorage` | Se lee con `getDocs` y se escribe con `addDoc` / `updateDoc` / `deleteDoc` |
| Sin orden | `orderBy("createdAt", "desc")` |

### 5. Pasar el `userId` desde el Context

**Archivo:** `src/components/views/Tasks/Tasks.tsx`

El `getTasks` ahora necesita el `userId`, así que el componente lo pide al Context:

```typescript
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
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
  // FASE 6 - El userId sale del Context (ya existe de la clase 8)
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  // Un solo loading: cubre la carga inicial y todas las operaciones (crear, completar, eliminar)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");

  // FASE 6 - Al montar, pedir las tareas del usuario al service
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;

      try {
        const data = await getTasks(user.uid);
        setTasks(data);
      } catch {
        setError("No se pudieron cargar las tareas.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);
```

**Y al crear la tarea**, el `userId` es el del usuario autenticado:

```typescript
const newTask = await addTask({
  title: title,
  completed: false,
  userId: user?.uid ?? "",
  createdAt: new Date().toISOString(),
});
```

> El `useEffect` ahora depende de `[user]` en vez de `[]`: si el usuario cambia, las tareas se vuelven a pedir.

### 6. Capturar el `permission-denied`

Firestore lanza el error, hay que atraparlo. Para no repetir el chequeo en cada handler, primero se hace un helper.

**En `src/helpers/errors.ts`:**

```typescript
import { FirebaseError } from "firebase/app";

// FASE 6 - True si Firebase rechazo la operacion por falta de permisos
export const isPermissionDenied = (error: unknown): boolean =>
  error instanceof FirebaseError && error.code === "permission-denied";
```

**Y en `src/components/views/Tasks/Tasks.tsx`**, los cuatro handlers (cargar, crear, completar y eliminar) usan el helper:

```typescript
import { isPermissionDenied } from "../../../helpers/errors";

// Al cargar las tareas
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

// Al crear una tarea
try {
  const newTask = await addTask({ ... });
  setTasks([...tasks, newTask]);
  setTitle("");
} catch (error) {
  setError(
    isPermissionDenied(error)
      ? "No tenés permiso para crear esta tarea."
      : "No se pudo crear la tarea.",
  );
}
```

**Cómo se provoca el `permission-denied`:**
- Con las reglas restrictivas, una lectura no permitida (cambiar el `userId` de la consulta, o pedir un documento
  directo sin filtro) falla con `permission-denied`.
- Con `allow write: if false` falla la escritura.

### 7. Crear el índice compuesto

Al entrar a `/tasks` la primera vez, la consulta **falla**. En la consola del navegador (F12 → Console) aparece:

```
Error: The query requires an index. You can create it here:
https://console.firebase.google.com/v1/r/project/webpt36/firestore/indexes?create_composite=...
```

**Por qué pasa:** la consulta usa **dos** filtros a la vez — un `where` por `userId` y un `orderBy` por `createdAt`.
Firestore no puede ordenar por un campo usando un índice que solo tiene ese campo: necesita un **índice compuesto**, que
es un índice que combina varios campos en el orden que los necesita la consulta.

Sin ese índice, Firestore no sabe cómo filtrar **y** ordenar al mismo tiempo, así que rechaza la consulta entera.

Además, hay una razón de seguridad: para evaluar las reglas de ownership (`isOwnerExisting()`), Firestore necesita poder
leer los documentos que van a coincidir con el filtro. El índice compuesto es lo que le permite hacerlo de forma
eficiente.

#### Cuándo hay que crear un índice compuesto

Firestore crea **automáticamente** un índice por cada campo de la colección (los *single-field indexes*). Pero **no** crea
los índices que combinan varios campos, porque las combinaciones posibles son enormes. Esos hay que crearlos a mano.

**Necesitás un índice compuesto cuando la consulta:**

| Situación | Ejemplo | ¿Índice compuesto? |
|-----------|---------|--------------------|
| Un solo `where` con `==` | `where("userId", "==", userId)` | ❌ No |
| Un `where` con `==` + `orderBy` **de otro campo** | `where("userId", "==", userId)` + `orderBy("createdAt", "desc")` | ✅ **Sí** |
| Varios `where` con `==` | `where("userId", "==", x)` + `where("completed", "==", false)` | ❌ No (Firestore los **combina**) |
| Dos o más filtros de **rango** en campos distintos | `where("createdAt", ">=", a)` + `where("score", "<", b)` | ✅ **Sí** |
| `array-contains` o `in` + otro filtro | `where("tags", "array-contains", t)` + `where("userId", "==", x)` | ✅ **Sí** |

> **Ojo con el `orderBy` sobre el mismo campo del `where`:** si el filtro y el orden usan el **mismo** campo, no hace
> falta índice compuesto.
>
> Y con varios `where` de igualdad, Firestore **fusiona** los índices de un solo campo que ya tiene — no hay que crear
> nada nuevo. Por eso en esta clase, agregar el filtro por `completed` no rompió nada: el índice compuesto que ya se creó
> para `userId` + `createdAt` lo cubre.

**Cómo se crea:**

1. En la consola del navegador, hacé clic en el link `You can create it here` del error. Te abre la consola de Firebase
   con el índice **ya configurado** (es el que armó la propia consulta).
2. Revisá que diga:
   - **Colección:** `tasks`
   - **Campo 1:** `userId` — Ascendente
   - **Campo 2:** `createdAt` — Descendente
3. Clic en **Crear índice**.
4. La consola avisa que el índice se está creando: **tarda unos minutos**. Mientras tanto la consulta sigue fallando,
   pero con **otro mensaje**:
   ```
   Error: The query requires an index. That index is currently building and cannot be used yet.
   ```
   Ese mensaje es la buena noticia: el índice **ya se está creando**. En la consola se ve con una barra de progreso.
5. Cuando el índice esté **listo**, **recargá la página** y las tareas cargan.

> **Los índices se crean de forma asíncrona.** Mientras uno se construye, la app sigue funcionando: se puede leer y
> escribir en la base de datos. Lo único que falla es la consulta que necesita ese índice.
>
> Es el comportamiento normal de Firestore, no un error de la app. La primera consulta con un `where` + `orderBy`
> siempre falla y muestra el link para crear el índice.

### 8. Verificar en Firebase Console

- **Firestore Database → Colección `tasks`** → aparecen los documentos con `title`, `completed`, `userId` y `createdAt`.
- El `id` del documento es el que devuelve `addDoc`.
- Recargar la página → las tareas vienen de la nube, no del `localStorage`.
- DevTools → Application → Local Storage → la llave `tasks` **ya no se escribe**.

### 9. Probar el flujo

- Entrar a `/tasks` → las tareas se leen de la nube.
- Agregar una tarea → aparece el documento en la consola de Firestore.
- "Completar" / "Eliminar" → el documento se actualiza o desaparece en la nube.
- Con dos usuarios distintos, cada uno ve solo las suyas.

---


---

---

## Consultas en Firestore: los operadores

> Los ejemplos completos, con el código, están en `src/services/taskQueries.ts`.

Los operadores de `where` son **strings**, no operadores de JavaScript. Por eso es `"=="` y **no** `===`.

| Operador | Qué hace |
|----------|----------|
| `"=="` | igual a |
| `"!="` | distinto de |
| `"<"` | menor que |
| `"<="` | menor o igual que |
| `">"` | mayor que |
| `">="` | mayor o igual que |
| `"in"` | dentro de una lista |
| `"not-in"` | fuera de una lista |
| `"array-contains"` | el array del documento contiene el valor |

### 1. Igual a — las tareas de un usuario

```typescript
const q = query(
  collection(db, TASKS_COLLECTION),
  where("userId", "==", userId),
);
```

### 2. Igual a con orden — las más recientes primero

```typescript
const q = query(
  collection(db, TASKS_COLLECTION),
  where("userId", "==", userId),
  orderBy("createdAt", "desc"),
);
```

> El `orderBy` va **después** del `where`. Además, para ordenar por un campo que no sea el `id`, Firestore necesita un
> **índice compuesto** (`userId` + `createdAt`) — sin él, la consulta falla con
> `The query requires an index`. Se crea desde el link que muestra el propio error. Ver el paso
> «Crear el índice compuesto» en la Fase 6, donde está la tabla con **cuándo** hace falta un índice compuesto.

### 3. Varias condiciones — las tareas pendientes de un usuario

```typescript
const q = query(
  collection(db, TASKS_COLLECTION),
  where("userId", "==", userId),
  where("completed", "==", false),
);
```

> Cada `where` agrega una condición **AND**: `userId == X AND completed == false`.

### 4. Distinto de — las tareas completadas

```typescript
const q = query(
  collection(db, TASKS_COLLECTION),
  where("userId", "==", userId),
  where("completed", "!=", false),
);
```

### 5. Rango — las tareas creadas después de una fecha

```typescript
const q = query(
  collection(db, TASKS_COLLECTION),
  where("userId", "==", userId),
  where("createdAt", ">=", date),
);
```

> `">="` y `"<"` comparan **strings**. Por eso el `createdAt` se guarda como ISO (que ordena bien como texto) y no
> como un `Date`.

### 6. Dentro de una lista — las tareas de varios usuarios

```typescript
const q = query(
  collection(db, TASKS_COLLECTION),
  where("userId", "in", userIds),
);
```

> Máximo **30 valores** por consulta en Firestore.

### 7. Un array que contiene un valor — las tareas con una etiqueta

```typescript
// Documento: { tags: ["urgente", "clase"] }
const q = query(
  collection(db, TASKS_COLLECTION),
  where("userId", "==", userId),
  where("tags", "array-contains", tag),
);
```

### 8. Limitar la cantidad — las 10 más recientes

```typescript
const q = query(
  collection(db, TASKS_COLLECTION),
  where("userId", "==", userId),
  orderBy("createdAt", "desc"),
  limit(10),
);
```

> El `limit` va al final. Se usa para paginar: se piden 10, y después otros 10 arrancando desde el último id visto.

---

## Fase 7: Verificación completa

### Checklist
1. **Build limpio**
   - `npm run lint` → 0 errores.
   - `npx tsc --noEmit` → 0 errores de tipos.
   - `npm run build` → build de producción exitoso.
2. **Auth (de la clase 8)**
   - Registro, login, logout, persistencia de sesión al recargar.
   - `/tasks` bloqueada sin sesión.
3. **Tareas**
   - `/tasks` con sesión → lista las tareas del usuario.
   - Agregar una tarea → aparece sin recargar.
   - Recargar → sigue ahí (viene de Firestore).
4. **Filtrado**
   - Con dos usuarios, cada uno ve solo las suyas.
5. **Errores**
   - Con las reglas restrictivas, la UI muestra el mensaje de `permission-denied`.
6. **Console de Firebase**
   - La colección `tasks` tiene los documentos esperados.
