# Plan de Clase

## Clase 11 — Primeros tests con Vitest

Sobre la app de la clase anterior (Firebase + tareas), vamos a aprender a testear.

Objetivos de la clase:

- Ver en acción cómo se escribe un test de componente React.
- Entender intuitivamente qué es "comportamiento vs. implementación".
- Observar el ciclo: test rojo → código → test verde.
- Comprender para qué sirve un mock de Firestore.

---

## Paso 1 — Instalar las dependencias de testing

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Qué es cada una:

| Paquete | Para qué sirve |
| --- | --- |
| `vitest` | El runner de tests (el que ejecuta los tests). |
| `@testing-library/react` | Permite renderizar componentes React y buscar elementos en pantalla. |
| `@testing-library/jest-dom` | Agrega matchers extra como `toBeInTheDocument()`. |
| `@testing-library/user-event` | Simula que el usuario escribe, hace clic, etc. |
| `jsdom` | Simula el DOM del navegador, porque los tests corren en Node. |

## Paso 2 — Configurar Vitest en `vite.config.ts`

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom simula el DOM del navegador para que React pueda renderizar en los tests
    environment: 'jsdom',
    // globals: true habilita describe/it/expect sin tener que importarlos en cada archivo
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
```

Qué hace cada línea:

- `environment: 'jsdom'` → los tests tienen un DOM falso, como si fuéramos un navegador.
- `globals: true` → `describe`, `it` y `expect` funcionan sin importarlos en cada archivo.
- `setupFiles` → el archivo que se carga antes de cada test.

> Ojo: el `defineConfig` viene de `vitest/config`, no de `vite`.
> Si lo dejamos en `vite`, TypeScript se queja de que `test` no es una propiedad conocida.

## Paso 3 — Crear `src/setupTests.ts`

```ts
// Carga los matchers extras de jest-dom: toBeInTheDocument, toHaveTextContent, etc.
// El entry point "/vitest" los registra automáticamente en Vitest.
import '@testing-library/jest-dom/vitest'
```

Este archivo le agrega a Vitest los matchers de jest-dom (`toBeInTheDocument`, etc.).
Se ejecuta una vez antes de cada archivo de tests.

## Paso 4 — Agregar los tipos de Vitest en `tsconfig.app.json`

En la app hay un proyecto de TypeScript. Dentro de `tsconfig.app.json`
encontramos esto:

```json
"types": ["vite/client"],
```

El campo `types` le dice a TypeScript qué tipos globales puede usar.
Ahora vamos a agregar los de Vitest:

```json
"types": ["vite/client", "vitest/globals"],
```

### ¿Por qué?

Porque en el `vite.config.ts` activamos `globals: true`. Eso hace que
`describe`, `it` y `expect` estén disponibles **sin importarlos** en cada archivo.

Pero TypeScript no se entera de eso solo: necesita saber que esos tipos existen.
Sin esta línea, el build se rompe con errores como:

```
src/basics.test.ts(5,1): error TS2593: Cannot find name 'describe'.
src/basics.test.ts(7,5): error TS2304: Cannot find name 'expect'.
```

> Ojo: **los tests corren igual** aunque falte esta línea.
> Vitest no usa TypeScript para ejecutar los tests, solo para transformarlos.
> El que se queja es `tsc`, o sea el build (`npm run build`).

Si preferimos no tocar el `tsconfig`, hay otra opción: en vez de usar `globals: true`,
importar `describe`, `it` y `expect` en cada archivo de test:

```ts
import { describe, expect, it } from 'vitest'
```

Pero es mucho más corto no tener que hacerlo.

## Paso 5 — Agregar el script `test` en `package.json`

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

Con esto los tests corren en modo "watch": se reejecutan solos cada vez que guardás un archivo.

Para correrlos una sola vez y salir:

```bash
npx vitest run
```

## Paso 6 — Primer test: ver el VERDE

Archivo `src/basics.test.ts`:

```ts
// PRIMER TEST: el más simple posible.
// Solo comprueba que Vitest está funcionando.
// Como activamos "globals: true" en vite.config.ts,
// no hace falta importar describe, it ni expect.
describe('Primer test', () => {
  it('suma 2 + 2 y da 4', () => {
    expect(2 + 2).toBe(4)
  })
})
```

Corramos los tests:

```bash
npx vitest run
```

Resultado esperado:

```
✓ src/basics.test.ts (1 test) 1 passed
```

## Paso 7 — Romperlo a propósito: ver el ROJO

Cambiamos el `4` por un `5`:

```ts
expect(2 + 2).toBe(5)
```

Y lo corremos otra vez:

```
FAIL  src/basics.test.ts > Primer test > suma 2 + 2 y da 4
AssertionError: expected 4 to be 5 // Object.is equality
```

Esto es el ciclo de trabajo con tests:

1. **ROJO** — escribimos el test y falla (o escribimos el test que falla primero).
2. **VERDE** — escribimos el código mínimo para que pase.
3. **REFACTOR** — mejoramos el código sin romper el test.

Volvemos a poner `toBe(4)` para dejar el test en verde.

---

## El primer test de un componente: que renderice

Ahora vamos a testear el componente `Tasks`. Pero antes de comprobar qué muestra,
lo primero es comprobar que **renderiza sin romperse**.

En `Tasks.test.tsx`:

```ts
it('renderiza el componente sin romperse', async () => {
  mockGetTasks.mockResolvedValue([])

  render(<Tasks />)

  expect(
    await screen.findByRole('heading', { name: 'Tareas' }),
  ).toBeInTheDocument()
})
```

Parece redundante, pero es el test que más problemas te ahorra:

- Si el componente tiene un error en el render, el test falla acá con el error claro.
- Si falta un mock (por ejemplo, si no mockeamos Firebase), el test falla acá y no en los otros.
- Es el test más rápido de escribir y el que menos dice. Por eso va primero.

> `findBy...` espera a que el elemento aparezca.
> `getBy...` lo busca directo y falla si todavía no está.
> Con datos que llegan de una API, siempre `findBy`.

---

## Comportamiento vs. implementación

Esta es la idea central de la clase.

### Test de implementación

```tsx
// Antipatrón: chequea el estado interno del componente.
expect(wrapper.state().isVisible).toBe(true)
```

Problema: si más adelante refactorizás el componente y cambiás cómo guarda el estado,
**el test se rompe** aunque la app siga funcionando igual.

### Test de comportamiento

```tsx
// Correcto: chequea lo que el usuario ve.
expect(screen.getByRole('heading', { name: 'Tareas' })).toBeInTheDocument()
```

Este test **sobrevive a cualquier refactor interno**: mientras el usuario vea lo mismo,
el test sigue en verde.

**Regla:** probá lo que el usuario ve, no cómo lo construiste.

Ejemplo real de la clase, en `Tasks.test.tsx`:

```tsx
// Test de COMPORTAMIENTO: el usuario ve el texto "No hay tareas"
// cuando la lista viene vacía.
expect(await screen.findByText('No hay tareas')).toBeInTheDocument()
```

### Queries más usadas

| Query | Qué busca | Cuándo usarla |
| --- | --- | --- |
| `getByRole` | Rol + nombre visible | **Recomendada.** Stable y accesible. |
| `getByText` | Texto visible | Muy usada. |
| `findByText` | Como `getByText`, pero espera | Cuando el dato llega de una API. |
| `getByLabelText` | Texto de un `<label>` | Ideal para inputs de formularios. |
| `getByTestId` | Por `data-testid` | Último recurso, evitalo. |

---

## Simular que el usuario usa la app: `userEvent`

Con `userEvent` escribimos y hacemos clic **como lo haría una persona**.
Este es el test que más se parece a "usar la app":

```ts
it('agrega una tarea nueva', async () => {
  // userEvent.setup() prepara el "usuario virtual" que va a escribir y hacer clic.
  // Sin esto, no podemos usar user.type ni user.click.
  const user = userEvent.setup()

  mockGetTasks.mockResolvedValue([])
  mockAddTask.mockResolvedValue(tareaNuevaMock)

  render(<Tasks />)

  // Esperamos a que el componente termine de cargar.
  await screen.findByRole('heading', { name: 'Tareas' })

  // Escribimos en el input, como lo haría el usuario.
  // getByLabelText busca el input por su <label> ("Nueva tarea:").
  await user.type(screen.getByLabelText('Nueva tarea:'), 'Comprar pan')

  // Y hacemos clic en el botón.
  await user.click(screen.getByRole('button', { name: 'Agregar' }))

  // La tarea nueva aparece en la lista.
  expect(await screen.findByText('Comprar pan')).toBeInTheDocument()
})
```

### Las tres piezas

| Pieza | Para qué sirve |
| --- | --- |
| `userEvent.setup()` | Crea el "usuario virtual". Va **siempre** al principio del test. |
| `user.type(...)` | Escribe en un input, letra por letra (dispara los eventos como una persona). |
| `user.click(...)` | Hace clic en un elemento. |

### Ojo con los `await`

`user.type` y `user.click` son **asincrónicos** (esperan entre pulsaciones,
como una persona real). Si les falta el `await`, el test puede fallar sin
razón aparente o pasar sin comprobar nada.

**Regla:** todo `await user.*` va con `await`.

### Un detalle del mock

Fijate que el texto que aparece en pantalla ("Comprar pan") es el que
**devuelve el mock** (`mockAddTask`), no el que escribió el usuario.

Eso está bien, porque en la app real el título viene de Firestore
(que le asigna un `id` y lo guarda). El mock hace de Firestore y devuelve
la tarea ya guardada.

---

## Cómo leer un `vi.mock`

Antes de los ejemplos, la forma de leerlo:

```ts
vi.mock('RUTA_DEL_MODULO', () => ({ QUE_EXPORTA }))
```

- El **primer argumento** es la ruta del módulo que querés reemplazar.
- El **segundo** es una función que devuelve el módulo **falso**.

O sea, en palabras:

> "Cuando alguien importe este módulo, devolvé esto en su lugar."

### Ojo: el módulo falso REEMPLAZA ENTERO al real

Esto es lo más importante y lo que más confunde al principio.

Si el módulo real exporta dos cosas:

```ts
// src/contexts/AuthContext.tsx (el real)
export const AuthProvider = ...
export const useAuth = ...
```

y en el test escribimos:

```ts
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'usuario-de-prueba', email: 'prueba@ejemplo.com' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))
```

entonces **`AuthProvider` deja de existir** para ese archivo de test.
El módulo mockeado tiene *solo* `useAuth`.

Para verlo, pensemos al revés: si el mock fuera

```ts
vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: vi.fn(),   // y NO useAuth
}))
```

el import de `useAuth` en `Tasks.tsx` sería `undefined`, y al llamarlo
explota. Vitest te avisa con un mensaje clarísimo:

```
Error: [vitest] No "useAuth" export is defined on the
"../../../contexts/AuthContext" mock. Did you forget to return it from "vi.mock"?
```

**Regla:** en el mock van **todas** las exports que use el código que estás testeando.
Para `Tasks.tsx` alcanza con `useAuth`, porque es lo único que importa de ahí.

---

## El mock de Firestore

Un mock es como un **actor que hace de Firestore**: no es real, pero el componente
actúa como si lo fuera.

### Sin mock

- Sin internet → el test falla.
- Los datos en la nube cambian → el test se vuelve inestable.
- Cada test conecta a Firestore → lento.

### Con mock

El mock se define **una sola vez** en el archivo de tests, y cada test decide
qué tiene que devolver:

```ts
const { mockGetTasks } = vi.hoisted(() => ({
  mockGetTasks: vi.fn(),
}))

vi.mock('../../../services/taskServices', () => ({
  getTasks: mockGetTasks,
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}))
```

#### ¿Por qué `vi.hoisted`? (y por qué no es un `beforeEach`)

Ojo, `vi.hoisted` **no es un `beforeEach`**:

| | Cuándo corre | Cuántas veces |
| --- | --- | --- |
| `beforeEach` | Antes de **cada** test | Una vez por test |
| `vi.hoisted` | Al **cargar el archivo** | Una sola vez |

`vi.hoisted` existe por un problema muy concreto: **los `vi.mock` se suben
("hoist") al principio del archivo**. Eso quiere decir que el mock se ejecuta
*antes* de que se definan las variables de arriba.

Si escribimos esto:

```ts
const mockFn = vi.fn()

vi.mock('../../../services/taskServices', () => ({
  getTasks: mockFn,   // ← el mock necesita mockFn
}))
```

el mock va a intentar leer `mockFn` cuando todavía **no existe**, y explota:

```
Error: [vitest] There was an error when mocking a module. If you are using
"vi.mock" factory, make sure there are no top level variables inside,
since this call is hoisted to top of the file.
Caused by: ReferenceError: Cannot access 'mockFn' before initialization
```

Con `vi.hoisted`, la función que creamos se ejecuta **antes** que el `vi.mock`,
así que `mockGetTasks` ya existe cuando el mock la necesita.

Y gracias a eso, `mockGetTasks` es **la misma función** que el módulo mockeado
usa por dentro. Por eso en cada test podemos configurarla y el componente la ve:

```ts
mockGetTasks.mockResolvedValue([tareaMock])   // el componente va a recibir esto
```

#### Los datos del mock

Los datos que devuelve el mock están **definidos arriba**, en constantes.
Así se ven de un vistazo y no hay que buscarlos adentro de cada test:

```ts
// La tarea que devuelve el mock cuando le piden la lista.
const tareaMock: Task = {
  id: '1',
  title: 'Tarea mock',
  completed: false,
  userId: 'usuario-de-prueba',
  createdAt: '2026-01-01T00:00:00.000Z',
}

// La tarea que devuelve el mock cuando agregan una nueva.
// En la app real el título vuelve de Firestore (que le asigna el id y lo guarda).
const tareaNuevaMock: Task = {
  id: 'nueva',
  title: 'Comprar pan',
  completed: false,
  userId: 'usuario-de-prueba',
  createdAt: '2026-01-01T00:00:00.000Z',
}
```

Y en el test solo se referencian:

```ts
mockGetTasks.mockResolvedValue([tareaMock])
mockAddTask.mockResolvedValue(tareaNuevaMock)
```

#### Configurar el mock en cada test

Y en cada test le decimos qué tiene que devolver el mock:

```ts
it('muestra "No hay tareas" cuando la lista está vacía', async () => {
  mockGetTasks.mockResolvedValue([])

  render(<Tasks />)

  expect(await screen.findByText('No hay tareas')).toBeInTheDocument()
})

it('muestra la tarea que devuelve el mock', async () => {
  mockGetTasks.mockResolvedValue([tareaMock])

  render(<Tasks />)

  expect(await screen.findByText('Tarea mock')).toBeInTheDocument()
})
```

Con esto los tests son **rápidos, confiables y no dependen de la nube**.

El componente `Tasks` llama a `getTasks()` del servicio. Con el mock, ese servicio
devuelve lo que le digamos, sin tocar la nube.

#### ¿Qué hace `mockResolvedValue`?

```ts
mockGetTasks.mockResolvedValue([])
```

Es una instrucción al mock: **"cuando te llamen, devolvé esto"**.

- El `[]` es la lista de tareas que va a devolver.
- El "resolved" es porque `getTasks` es una función `async`: devuelve una Promise.
  `mockResolvedValue` deja configurada esa Promise con el valor que le pasamos.

Ojo: **cada llamada reemplaza el valor anterior**. No se acumulan:

```ts
mockGetTasks.mockResolvedValue(['PRIMERO'])
await mockGetTasks()   // -> ['PRIMERO']

mockGetTasks.mockResolvedValue(['SEGUNDO'])
await mockGetTasks()   // -> ['SEGUNDO']  (reemplaza, no agrega)
```

Por eso en cada test hay que volver a configurarlo, y por eso en este archivo
los tres primeros tests usan `[]` y el último usa `[tareaMock]`.

**`mockResolvedValue` vs `mockReturnValue`:**

| | Para funciones | Devuelve |
| --- | --- | --- |
| `mockReturnValue(x)` | sincrónicas | `x` directo |
| `mockResolvedValue(x)` | `async` / con Promise | una Promise que resuelve en `x` |

Si mockeás una función async y usás `mockReturnValue`, el componente recibe
un valor plano en vez de una Promise, y se rompe.

> También existe `mockResolvedValueOnce`, que aplica **solo la próxima vez**
> y después vuelve al valor normal. Sirve para un caso puntual.

### Mockear el contexto de auth

`Tasks` usa `useAuth()`, que viene de Firebase. También lo mockeamos:

```ts
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'usuario-de-prueba',
      email: 'prueba@ejemplo.com',
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))
```

El usuario está **hardcodeado**: es un objeto con la misma forma que uno de
Firebase (`uid` y `email`), pero que no existe en la nube. Está escrito acá
mismo, en el archivo de test, para que se entienda todo de un vistazo.

> Tip: `login` y `logout` son funciones. Les ponemos `vi.fn()` para poder
> verificar después si fueron llamadas (por ejemplo, `expect(login).toHaveBeenCalled()`).


---

## Estructura del proyecto

```
.
├── src/
│   ├── components/
│   │   ├── ui/                          → Button, Navbar, Footer, ProtectedRoute
│   │   └── views/
│   │       ├── Login/
│   │       ├── Register/
│   │       ├── Tasks/
│   │       │   ├── Tasks.tsx
│   │       │   └── Tasks.test.tsx       → render, comportamiento, mock y userEvent
│   │       └── Home/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── firebase/
│   │   └── config.ts
│   ├── helpers/
│   │   ├── auth.ts
│   │   ├── errors.ts
│   │   ├── navigation.ts
│   │   └── validations.ts
│   ├── services/
│   │   └── taskServices.ts              → el servicio que va a hacer de Firestore
│   ├── types/
│   │   └── types.ts
│   ├── setupTests.ts                    → carga los matchers de jest-dom
│   ├── basics.test.ts                   → el primer test (2 + 2 = 4)
│   ├── App.tsx
│   └── main.tsx
├── .env                                  → tus credenciales de Firebase (no se sube)
├── .env.example
├── vite.config.ts
└── package.json
```

Los dos archivos de tests de esta clase son:

| Archivo | Qué testeamos |
| --- | --- |
| `src/basics.test.ts` | Que Vitest funcione (2 + 2 = 4). El ciclo rojo → verde. |
| `src/components/views/Tasks/Tasks.test.tsx` | El componente `Tasks`: que renderice, qué muestra, el mock de Firestore y agregar una tarea. |

## Comandos útiles

```bash
npm test          # corre los tests en modo watch
npx vitest run    # corre los tests una sola vez y sale
npm run lint      # revisa el código
npm run build     # compila la app
npm run dev       # levanta la app
```
