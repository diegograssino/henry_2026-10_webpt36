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
>
> La configuración de Firestore (`getFirestore`) se agrega en la **Fase 5**.
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

