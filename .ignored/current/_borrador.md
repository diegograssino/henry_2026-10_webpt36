# Clase 9 — Material recibido (borrador de plan)

> Documento de trabajo. Se convierte en `plan.md` cuando esté todo el contenido.

## Objetivos

1. Migrar la persistencia de una aplicación de tareas desde localStorage a Cloud Firestore.
2. Implementar lectura de datos filtrados por usuario utilizando consultas con `where`.
3. Crear nuevas tareas en Firestore asociándolas al usuario autenticado mediante `addDoc`.
4. Aplicar una arquitectura con separación de responsabilidades usando un **service layer**.
5. Tipar correctamente los datos con TypeScript.
6. Manejar estados en la UI (loading, error, data).
7. Actualizar el estado local tras crear una tarea sin recargar la página.
8. Identificar y resolver errores de permisos (`permission-denied`).

## Consigna

Migramos una TO-DO App desde localStorage hacia Cloud Firestore, implementando persistencia en la nube, modelado de
tareas tipado, lectura y creación de documentos mediante un service layer con TypeScript, y una UI en React con
estados de loading, error y data para manejar correctamente la asincronía, la experiencia de usuario y los errores de
permisos.

> **Adaptación:** la consigna original speaks de "persistencia en la nube por usuario" y "modelado de tareas con
> `userId`". Como la clase 9 **no usa autenticación**, el modelo es `Task { id, title, completed }` y el filtro `where`
> no es por usuario.

## Pasos

1. Crear un nuevo proyecto de React + TS con Vite.
2. Definir las variables de entorno y configurar Firebase.
3. Establecer el tipado para las tareas.
4. Construir `taskService.ts` para la lectura filtrada y el alta con `addDoc`.
5. Integrar React con Firestore mediante un componente `TaskPage.tsx` manejando los estados de carga.
6. Eliminar el localStorage y verificar en Firebase Console que los documentos se crean y cargan adecuadamente.

## Decisiones de diseño

### Sin autenticación

La clase 9 **no usa autenticación**. Sin login, sin `AuthProvider`, sin `useAuth`, sin `src/contexts/`.

Consecuencias:
- Las tareas **no** se asocian a un usuario: el modelo es `Task { id, title, completed }`, sin `userId`.
- La lectura con `where` filtra por otro campo (por ejemplo `completed === false`), no por usuario.
- El error `permission-denied` se maneja desde las **reglas de seguridad de Firestore**, no por un problema de sesión.

### El service layer desde el día 1

La app **nunca** habla con `localStorage` directamente: siempre pasa por el service. Al migrar a Firestore (paso 6),
**solo cambia la implementación del service** — la app y la UI quedan intactas. Eso demuestra el valor de la
separación de responsabilidades.

### Latencia simulada en el service

Las operaciones con localStorage dentro del service van encerradas en un `setTimeout` de **2 segundos**, para poder ver
los estados de carga en acción. Simula la latencia de red real que tendrá Firestore.

### Sin estilos

HTML plano. No se agregan estilos en esta clase.

### Basado en la clase anterior

El ejemplo se basa fuertemente en la clase 5 (`5/src/assets/Persistence.tsx`): un input que sincroniza con el
almacenamiento en `useEffect`. La TODO app es la evolución de ese patrón: input de tarea + lista de tareas.

### La app solo conoce el service

El `useEffect` de lectura y el handler de alta pasan **siempre** por el service. La app nunca toca `localStorage`
directamente.

```
useEffect con []      →  taskService.getTasks()     →  setTasks(data)
handleSubmit          →  taskService.addTask(task)  →  setTasks([...tasks, newTask])
```

En la Fase 6 (migración a Firestore) **solo cambia el interior del service**. El `useEffect`, el handler y el render
de `TaskPage.tsx` quedan idénticos. Eso es lo que demuestra el service layer.

### Objetivo 7 — actualizar el estado local sin recargar

Tras `addTask`, el service devuelve la tarea creada y el componente la agrega al estado:

```typescript
const newTask = await taskService.addTask(task);
setTasks([...tasks, newTask]);
```

No hace falta volver a pedir la lista: la UI se actualiza al instante, y en Firestore el documento ya existe con su
`id` real (el que devuelve `addDoc`).

## Referencia: clase 5 (`Persistence.tsx`)

```typescript
const Persistence = () => {
  const [name, setName] = useState("");

  // Sincronizo en el 1st render con lo que haya, si no hay nada, no guardo nada
  useEffect(() => {
    const saveName = (s) => {
      setName(s);
    };

    const saved = localStorage.getItem("name");
    if (saved !== null) {
      saveName(saved);
    }
  }, []);

  // Sincronizo el estado name con lo que haya en el localStorage cada vez que name cambia
  useEffect(() => {
    if (name === "") return;
    localStorage.setItem("name", name);
  }, [name]);

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {name ? <p>Hola, {name}</p> : null}
      <button
        onClick={() => {
          localStorage.removeItem("name");
          setName("");
        }}
      >
        Limpiar
      </button>
    </div>
  );
};
```

## Referencia: clase 5 — useEffect, fetching de datos y cleanup

La clase 5 (`5/src/App.tsx` y `5/src/CleanUp.tsx`) tiene los tres patrones que la clase 9 reutiliza.

### Fetching de datos en `useEffect` (`5/src/App.tsx`)

```typescript
// Caso de fetching de datos
useEffect(() => {
  async function apiFetch() {
    await fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((json) => setPosts(json));
  }
  apiFetch();
}, []);
```

→ En la clase 9, este `fetch` a jsonplaceholder se reemplaza por una llamada al `taskService`.

### Early return en el `useEffect` (`5/src/assets/Persistence.tsx`)

```typescript
// ② Deps [name] → corre cuando name cambia
useEffect(() => {
  if (name === "") return; // no guardar vacío al montar
  localStorage.setItem("persistent-name", name);
}, [name]);
```

### Cleanup (`5/src/CleanUp.tsx`)

```typescript
useEffect(() => {
  console.log("-----------");
  if (!jumping) return;
  const intervalId = setInterval(() => {
    console.log("interval id jumping: ", intervalId);
  }, freq);
  return () => {
    console.log("-----------");
    console.log("Killing interval id:", intervalId);
    clearInterval(intervalId);
  };
}, [jumping, freq]);
```

### El patrón loading / error / data

En la clase 5 el `fetch` no maneja estados. La clase 9 lo completa con los tres estados, usando **early returns**
en el render:

```tsx
if (loading) return <p>Cargando...</p>;
if (error) return <p>Error: {error}</p>;
return <ul>{tasks.map((t) => <li key={t.id}>{t.title}</li>)}</ul>;
```

El componente **solo** decide qué mostrar según el estado. Toda la lógica de obtener los datos vive en el service.

## Referencia: clase 7 — estados loading / error / data

La clase 7 ya tiene el patrón de asincronía con `useState`. La clase 9 lo Evoluciona.

### `7/components/ui/LoginForm/LoginForm.tsx`

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.SubmitEvent) => {
  // Con esto ya me evito que se recargue la página
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Esto simula una llamada a una API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert("Enviado");
  } catch (error) {
    alert(error);
  } finally {
    setIsSubmitting(false);
  }
};
```

### `7/examples/LoginForm5.tsx` — el mismo patrón, más documentado

```typescript
// CAMBIO: handleSubmit ahora es asíncrono (async).
// Activamos isSubmitting a true, simulamos 2 segundos de demora en un try/catch,
// y en el finally restauramos isSubmitting a false pase lo que pase.
const handleSubmit = async (e: React.SubmitEvent) => {
  e.preventDefault();

  setIsSubmitting(true);

  try {
    // Simula petición con demora de 2 segundos (a ningún lado por ahora)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert(`Formulario enviado con éxito:\nEmail: ${values.email}`);
    setValues(INITIAL_VALUES);
    setTouched(INITIAL_TOUCHED);
    setErrors(INITIAL_ERRORS);
  } catch {
    // Manejo de error vacío por ahora
  } finally {
    setIsSubmitting(false);
  }
};
```

En el render:

```tsx
{/* CAMBIO: disabled={isSubmitting} evita que el usuario altere datos durante el envío */}
<input ... disabled={isSubmitting} />

{/* CAMBIO: disabled se activa si el form es inválido O si ya se está enviando.
    El texto del botón cambia según isSubmitting */}
<button type="submit" disabled={isFormInvalid || isSubmitting}>
  {isSubmitting ? "Enviando..." : "Ingresar"}
</button>
```

### La diferencia clave para la clase 9

En la clase 7, el `setTimeout` de 2 segundos está **dentro del componente** (simula la llamada a una API).

En la clase 9, esa demora **se mueve al service**. El componente queda igual de simple, pero el service queda
encargado de la persistencia. Esa es la demostración del service layer:

```
Clase 7:  [ componente: setTimeout + llamada ]  →  API
Clase 9:  [ componente: llama al service ]  →  [ service: setTimeout + localStorage ]  →  Firestore
```


## Objetivo 8 — `permission-denied`

Un `permission-denied` aparece cuando Firestore rechaza una lectura o escritura porque las **reglas de seguridad** no
lo permiten. La forma más directa de provocarlo es intentar leer o escribir en la colección con las reglas bloqueando
el acceso, por ejemplo sin haber iniciado sesión o pidiendo datos de otro usuario.

**El filtro por `userId` en la consulta no reemplaza a esas reglas:** la consulta pide lo tuyo, y las reglas son las que
realmente impiden ver lo ajeno.

> Cómo se escriben esas reglas se ve en «Blindaje de datos», más adelante en la clase.

**Detalle clave:** Firestore nunca "filtra" resultados sobre lo que no está autorizado. Si la consulta pudiera traer
datos de otro usuario y la regla no lo permite, la consulta **se bloquea** — no llega una lista vacía, sino un error.
Por eso la query **debe** filtrar por `userId == uid`: no para proteger (eso lo hacen las reglas), sino porque solo así
pasa la validación de seguridad del backend.

```
Usuario autenticado (uid) → Consulta filtrada (userId == uid) → Regla: request.auth.uid == userId → Acceso solo a sus datos
```

### Las reglas de ownership (del material)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deniega todo por defecto
    match /{document=**} {
      allow read, write: if false;
    }

    match /tasks/{taskId} {
      function isSignedIn() {
        return request.auth != null;
      }
      function isOwnerExisting() {
        return isSignedIn() && request.auth.uid == resource.data.userId;
      }
      function isOwnerIncoming() {
        return isSignedIn() && request.auth.uid == request.resource.data.userId;
      }
      function hasValidShape() {
        return request.resource.data.keys().hasAll(['title', 'completed', 'userId', 'createdAt'])
          && request.resource.data.title is string
          && request.resource.data.completed is bool
          && request.resource.data.userId is string
          && request.resource.data.createdAt is string;
      }

      allow get, list: if isOwnerExisting();
      allow create: if isOwnerIncoming() && hasValidShape();
      allow update: if isOwnerExisting()
        && request.resource.data.userId == resource.data.userId
        && hasValidShape();
      allow delete: if isOwnerExisting();
    }
  }
}
```

- `request.auth` → el usuario autenticado (`{ uid: "..." }`) o `null`.
- `resource.data` → los datos actuales del documento (read/update/delete).
- `request.resource.data` → los valores propuestos (create).

### Captura del error en React

```typescript
try {
  const data = await getTasksByUser(uid);
  setTasks(data);
} catch (error: any) {
  if (error.code === 'permission-denied') {
    setError("No tienes permiso para ver estas tareas.");
  }
}
```

## Estructura prevista

```
src/
├── firebase/
│   └── config.ts
├── services/
│   └── taskService.ts
├── types/
│   └── task.ts
├── components/
│   └── TaskPage.tsx
├── App.tsx
└── main.tsx
```

Sin `contexts/`, sin `helpers/`, sin autenticación.

## Pendiente de confirmar

- Contenido restante de la consigna (¿terminó?).
- Reglas de seguridad de Firestore (`firestore.rules`) — para el objetivo de `permission-denied`.
- ¿Qué campo usa el `where` para filtrar? (propuesta: `completed === false` para listar solo las pendientes).
- ¿Las reglas de Firestore se configuran en la consola o con un archivo `firestore.rules`?

