# Plan de Clase

## Fases del Proyecto

- [ ] **Fase 1: El Camino Peligroso**
- [x] **Fase 2: Configuración en AWS**
- [x] **Fase 3: El Puente (Backend) — `api/send-email.ts`**
- [x] **Fase 4: El Gatillo (Frontend) — `ContactForm.tsx`**
- [ ] **Fase 5: El Momento de la Verdad**

> **El código va en inglés, los textos visibles en español.**
> **Sin estilos.** HTML plano.

## Buenas prácticas

### Nunca pongas el sufijo `VITE_` en una variable de entorno

En Vite, **toda** variable que empieza con `VITE_` se inyecta en el bundle del navegador: cualquiera que abra
"ver código fuente" de la app la puede leer.

```ts
// MAL: la access key de AWS termina en el bundle y la puede leer cualquiera.
const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
```

```ts
// BIEN: la variable no lleva VITE_, así que Vite NO la mete en el bundle.
// Solo la ve el backend (la serverless function).
const accessKey = process.env.AWS_ACCESS_KEY_ID;
```

**Regla:** si el valor es un **secreto** (access key, secret key, token, password), la variable **no** lleva `VITE_`.
Va en el backend, como secret de Vercel.

> Las variables con `VITE_` son solo para lo que el frontend **puede** mostrar: por ejemplo la API key pública de
> Firebase. Igual, esa API key está protegida por las reglas de Firebase: sin reglas que la autoricen, no sirve
> para nada.

### Estructura del proyecto

```
.
├── api/
│   └── send-email.ts      → la serverless function (el backend)
├── src/
│   ├── components/
│   │   └── ContactForm.tsx → el formulario de contacto
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
└── tsconfig.api.json      → type-check de la carpeta api/ (Node)
```

---

## Fase 0: Limpiar el proyecto

El proyecto viene de la clase anterior (una TODO app con Firebase, auth y router). Para esta clase se deja **solo lo
que se usa**: el frontend mínimo y la function de Vercel.

### Qué se borra

```bash
rm -rf src/components/ui src/components/views src/contexts src/helpers src/services src/types src/firebase
rm -f src/layout.tsx
```

### Qué se desinstala

Del `package.json` (y después `npm install` para actualizar el lockfile):

```bash
npm uninstall firebase firebase-admin react-router react-router-dom react-toastify
```

### Qué queda en `src/`

```
src/
├── components/
│   └── ContactForm.tsx
├── App.tsx
└── main.tsx
```

Y el `package.json` queda con lo mínimo:

```json
{
  "dependencies": {
    "@aws-sdk/client-ses": "^3.1160.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@vercel/node": "^5.10.2",
    "@vitejs/plugin-react": "^6.1.1",
    "typescript": "~6.0.2",
    "vite": "^8.3.0"
  }
}
```

### El `.env` también se limpia

`.env.example` queda solo con las variables de la function:

```env
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
SES_FROM_EMAIL=tu_email_verificado_en_ses@gmail.com
SES_TO_EMAIL=destinatario@example.com
```

### Verificar

```bash
npm run lint
npx tsc -b
npm run build
```

Los tres limpios, y el bundle baja de ~870 kB a ~220 kB.

---

## Fase 2: Configuración en AWS

Todo esto se hace en la **consola de AWS**, en la región **us-east-2**. Son dos cosas: un usuario IAM que puede
enviar emails, y una identidad verificada en SES que dice desde qué dirección se envía.

### 1. Crear el usuario IAM

1. Buscá **IAM** en la barra de búsqueda de la consola.
2. Entrá a **IAM → Users** → **Create user**.
3. **User name:** `test-ses-sender` (el nombre del PI puede ser otro, ej. `henry-ses-sender`).
4. **Next**.
5. ¿Want to grant permissions? → dejá **No, I'll set up custom permissions** → **Next**.
6. **Create user**.

El usuario existe, pero todavía **no puede hacer nada**. Recién tiene permisos para iniciar sesión en la consola.

### 2. Crear la access key

1. En **IAM → Users**, hacé clic en el usuario que acabás de crear (`test-ses-sender`).
2. Pestaña **Security credentials**.
3. **Create access key**.
4. **Use case:** *Application running outside AWS*.
5. **Create access key**.
6. AWS te muestra el **Access key ID** y el **Secret access key** — **copiá los dos**, no vuelven a aparecer.

> Guardalos en un `.md` de la carpeta (por ejemplo `pasos.md`) y en los secrets de Vercel. **Nunca** en un archivo
> que se suba al repo.

### 3. Crear la identidad en SES

1. Buscá **SES** en la consola. **Fijate que la región sea `us-east-2`** (arriba a la derecha).
2. En el menú lateral: **Identities**.
3. **Create identity**.
4. **Elegí `Email address`** — *no* `Domain`. La opción de dominio pide registros DNS, y no es lo que usa esta clase.
5. Escribí tu email (ej. `diegograssino@gmail.com`) → **Next**.
6. AWS te manda un email con un link de confirmación → **abrilo y confirmá**.
7. Recargá la consola: en **Identities** tu email aparece con estado **Verified**.

### 4. Darle permiso de envío al usuario IAM

Sin esto, el envío falla con:

```
User 'arn:aws:iam::621972219390:user/test-ses-sender' is not authorized to perform
'ses:SendEmail' on resource 'arn:aws:ses:us-east-2:621972219390:identity/diegograssino@gmail.com'
```

**Pasos:**

1. **IAM → Users** → clic en `test-ses-sender`.
2. **Add permissions**.
3. **Create policy**.
4. **Policy name:** `ses-send-email`.
5. Pestaña **JSON** → pegá:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": "*"
    }
  ]
}
```

6. **Next → Create policy**.
7. Volvé a `test-ses-sender` → **Add permissions** → elegí la policy `ses-send-email` que acabás de crear →
   **Next → Add permissions**.

> **Sobre el `Resource: "*"`:** permite enviar desde **cualquier** identidad de SES de la cuenta. Para que sea
> realmente el **permiso mínimo**, cambiala por la identidad puntual:
>
> ```json
> "Resource": "arn:aws:ses:us-east-2:621972219390:identity/diegograssino@gmail.com"
> ```
>
> Y `AmazonSESFullAccess` **no** es permiso mínimo: da control total sobre SES (crear identidades, borrar, ver todo).

### 5. Cargar las variables en Vercel

**Vercel Dashboard → tu proyecto → Settings → Environment Variables.** Cargá las cinco, marcadas como secret:

| Variable | Valor | Qué es |
|----------|-------|--------|
| `AWS_REGION` | `us-east-2` | La región donde está la identidad verificada |
| `AWS_ACCESS_KEY_ID` | el del paso 2 | Credencial del usuario IAM |
| `AWS_SECRET_ACCESS_KEY` | el del paso 2 | Credencial del usuario IAM |
| `SES_FROM_EMAIL` | tu email verificado | De quién sale el correo |
| `SES_TO_EMAIL` | a quién le llega | **Fijo**: siempre el mismo destinatario |

> **El destinatario es fijo y sale del env.** El email que escribe el usuario en el form **no cambia a quién le
> llega**: solo se usa para validar el formato y como `ReplyToAddresses` (el "responder a" del correo). Así nadie
> puede usar la app para mandar spam a terceros con tu cuenta.

### 6. Verificar que el envío funciona

Probá el formulario. Si la function devuelve `200` con `"Correo enviado correctamente"`, **el email se envió**.

---

## Fase 3: El Puente (Backend) — `api/send-email.ts`

La idea del **BFF** (Backend For Frontend): el frontend **no** habla nunca con AWS. Habla con una función de
Vercel, y esa función es la única que tiene las credenciales.

```
React (navegador)  →  POST /api/send-email  →  AWS SES  →  email
                      (sin credenciales AWS)     (con AWS SDK v3)
```

### 1. Instalar las dependencias

En el proyecto:

```bash
npm install @aws-sdk/client-ses
npm install -D @vercel/node
```

El CLI de Vercel es global, no va como dependencia del proyecto:

```bash
npm install -g vercel
```

### 2. Crear `api/send-email.ts`

Vercel detecta la carpeta `api/` en la raíz del repo y publica cada archivo como una function. El archivo
`api/send-email.ts` queda disponible en `/api/send-email`.

```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type ContactBody = {
  name: unknown;
  email: unknown;
  message: unknown;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
```

#### El handler

```typescript
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");

    response.status(405).json({
      error: "Método no permitido",
    });

    return;
  }

  const { name, email, message } = request.body as ContactBody;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    response.status(400).json({
      error: "El cuerpo de la petición es inválido",
    });

    return;
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim();
  const normalizedMessage = message.trim();

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    response.status(400).json({
      error: "El nombre debe tener entre 2 y 100 caracteres",
    });

    return;
  }

  if (!isValidEmail(normalizedEmail)) {
    response.status(400).json({
      error: "El correo no es válido",
    });

    return;
  }

  if (normalizedMessage.length < 10 || normalizedMessage.length > 3000) {
    response.status(400).json({
      error: "El mensaje debe tener entre 10 y 3000 caracteres",
    });

    return;
  }

  const region = process.env.AWS_REGION?.trim();
  const from = process.env.SES_FROM_EMAIL?.trim();
  const to = process.env.SES_TO_EMAIL?.trim();

  if (!region || !from || !to) {
    console.error("Faltan variables de entorno de SES");

    response.status(500).json({
      error: "El servidor no está configurado correctamente",
    });

    return;
  }

  const sesClient = new SESClient({
    region,
  });

  try {
    const command = new SendEmailCommand({
      Source: from,

      Destination: {
        ToAddresses: [to],
      },

      ReplyToAddresses: [normalizedEmail],

      Message: {
        Subject: {
          Data: `Nuevo mensaje de ${normalizedName}`,
          Charset: "UTF-8",
        },

        Body: {
          Text: {
            Data: [
              `Nombre: ${normalizedName}`,
              `Email: ${normalizedEmail}`,
              "",
              normalizedMessage,
            ].join("\n"),
            Charset: "UTF-8",
          },
        },
      },
    });

    const result = await sesClient.send(command);

    response.status(200).json({
      message: "Correo enviado correctamente",
      messageId: result.MessageId,
    });
  } catch (error: unknown) {
    console.error("Error enviando correo con SES:", error);

    response.status(500).json({
      error: "No se pudo enviar el correo",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
```

#### Qué valida la function

| Check | Respuesta |
|-------|-----------|
| El método no es `POST` | `405` — "Método no permitido" (con header `Allow: POST`) |
| Algún campo no es string | `400` — "El cuerpo de la petición es inválido" |
| El nombre no tiene entre 2 y 100 caracteres | `400` — "El nombre debe tener entre 2 y 100 caracteres" |
| El email no tiene formato válido | `400` — "El correo no es válido" |
| El mensaje no tiene entre 10 y 3000 caracteres | `400` — "El mensaje debe tener entre 10 y 3000 caracteres" |
| Falta `AWS_REGION`, `SES_FROM_EMAIL` o `SES_TO_EMAIL` | `500` — "El servidor no está configurado correctamente" |
| SES rechaza el envío | `500` — "No se pudo enviar el correo" + `detail` |
| Todo bien | `200` — "Correo enviado correctamente" + `messageId` |

#### Las dos validaciones en el lugar

La function **valida en el servidor**, aunque el formulario ya tiene `required`, `minLength` y `maxLength`. No es
redundante: las reglas del HTML son una ayuda para el usuario, y las del backend son la garantía real. Un cliente
puede mandar cualquier body.

El destinatario (`To`) es fijo y sale del env. El `ReplyToAddresses` sí usa el email del formulario: así el
destinatario puede responderle directamente a quien escribió.

### 3. El `tsconfig` de las functions

**Archivo:** `tsconfig.api.json` (nuevo)

La app es `src/` (React, DOM, Vite). Las functions son Node puro. Van en un `tsconfig` aparte:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.api.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "types": ["node"],
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["api"]
}
```

Y se agrega la referencia en `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.api.json" }
  ]
}
```

### 4. Las variables de entorno

**Archivo:** `.env.example`

Las variables de la function **no** empiezan con `VITE_`. A diferencia de las de Firebase, estas **no** van al
navegador: las usa el backend.

```env
# Variables de la serverless function (api/send-email.ts).
# En Vercel van como secrets: Settings > Environment Variables.
# En local van en .env.local (no se sube al repo).
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
SES_FROM_EMAIL=tu_email_verificado_en_ses@gmail.com
SES_TO_EMAIL=destinatario@example.com
```

- `AWS_REGION` → la región donde está la identidad verificada.
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` → la access key del usuario IAM.
- `SES_FROM_EMAIL` → la identidad verificada en SES (de dónde sale el email).
- `SES_TO_EMAIL` → a quién le llega.

### 5. Verificar

```bash
npm run lint
npx tsc -b
npm run build
```

Los tres tienen que terminar sin errores.

### 6. Correr el proyecto en local con las functions

`npm run dev` levanta **solo Vite** (el frontend). Las functions de `api/` no corren ahí, así que el fetch a
`/api/send-email` devuelve un **404 con body vacío**.

Para probar la function en local, se usa el CLI de Vercel, que levanta el frontend **y** las functions:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:vercel": "vercel dev"
  }
}
```

```bash
npm run dev:vercel
```

La primera vez, el CLI pregunta a qué proyecto|linkearse (`vercel link`) y pide autenticarse (`vercel login`).

---

## Fase 4: El Gatillo (Frontend) — `ContactForm.tsx`

**Archivo:** `src/components/ContactForm.tsx`

### 1. Los tipos

```tsx
import {
  type FormEvent,
  useState,
} from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

type ApiResponse = {
  message?: string;
  error?: string;
  detail?: string;
};
```

Un solo estado (`status`) para los tres momentos del envío, en vez de tres booleanos separados. Es más difícil que
se queden desincronizados.

`ApiResponse` tiene **todo opcional**: el backend puede responder `{ message }` en el éxito o `{ error, detail }` en
el error, y el frontend tiene que poder leer las dos formas.

### 2. El componente

```tsx
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] =
    useState<FormStatus>("idle");

  const [feedback, setFeedback] = useState("");
```

### 3. El submit

```tsx
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setStatus("loading");
    setFeedback("Enviando mensaje...");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const data =
        (await response.json()) as ApiResponse;

      if (!response.ok) {
        const errorMessage =
          data.error ?? "No se pudo enviar el mensaje";

        throw new Error(
          data.detail
            ? `${errorMessage}: ${data.detail}`
            : errorMessage,
        );
      }

      setStatus("success");
      setFeedback(
        data.message ?? "Mensaje enviado correctamente",
      );

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");

      setFeedback(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado",
      );
    }
  }
```

Dos detalles:

- Cuando el backend responde con error, se **lanza** un `Error` con el mensaje del servidor. Así el `catch` es el
  único lugar que arma el feedback del error, y no se repite el código.
- Tras el éxito, los tres campos se vacían: el mensaje ya se envió.

### 4. El render

```tsx
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Nombre</label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={100}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Correo</label>

        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="message">Mensaje</label>

        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          minLength={10}
          maxLength={3000}
          rows={8}
          required
        />
      </div>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Enviando..." : "Enviar mensaje"}
      </button>

      {feedback && <p role="status">{feedback}</p>}
    </form>
  );
}
```

`role="status"` le dice al lector de pantalla que ese texto es un mensaje de estado (no un error). El error real
también se anuncia, pero con `role="alert"` sería lo ideal.

### 5. Los estados

| Estado | Cuándo | Qué se ve |
|--------|--------|-----------|
| `idle` | al abrir la página | Botón "Enviar mensaje" |
| `loading` | hay un request en vuelo | Botón deshabilitado, "Enviando..." + "Enviando mensaje..." |
| `success` | el backend respondió `200` | "Correo enviado correctamente" y los campos vacíos |
| `error` | el backend respondió error o hubo excepción | El mensaje del servidor (o "Ocurrió un error inesperado") |

### 6. Montarlo en la app

**Archivo:** `src/App.tsx`

El proyecto es mínimo: no hay router, no hay auth. La app muestra el `ContactForm` directo en `/`.

```tsx
import { ContactForm } from "./components/ContactForm";

function App() {
  return (
    <main>
      <h1>Formulario de contacto</h1>
      <ContactForm />
    </main>
  );
}
```

Y `src/main.tsx` monta la app sin providers:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### 7. Verificar

1. `npm run lint` → 0 errores.
2. `npx tsc -b` → 0 errores.
3. `npm run build` → build exitoso.
4. `npm run dev` → en `http://localhost:5173` aparece el formulario con los tres campos.

> **Ojo:** `npm run dev` levanta **solo Vite** (el frontend). La function de `api/` **no** corre ahí, así que el
> fetch a `/api/send-email` devuelve un 404 con body vacío y el formulario revienta con
> `Unexpected end of JSON input`. Para probar la function en local hay que usar `npm run dev:vercel` (que levanta
> frontend + functions) o probar en el deploy de Vercel.

---

## Fase 5: El Momento de la Verdad — envío real

El objetivo de la clase: que un email **real** llegue desde la app desplegada.

### 1. Deploy

```bash
cd .ignored/current
./node_modules/.bin/vercel --prod
```

El CLI sube el código, construye y deploya. Vercel detecta `api/send-email.ts` y publica la function en
`/api/send-email`.

**Verificá que la function existe:**

```bash
./node_modules/.bin/vercel ls
```

### 2. Los secrets tienen que estar en el proyecto

Las variables se configuran **por proyecto de Vercel**. Si deployaste a un proyecto nuevo, copiá las cinco de
Settings → Environment Variables (Fase 2, paso 5).

Desde la terminal también se pueden agregar:

```bash
./node_modules/.bin/vercel env add AWS_REGION production
./node_modules/.bin/vercel env add AWS_ACCESS_KEY_ID production
./node_modules/.bin/vercel env add AWS_SECRET_ACCESS_KEY production
./node_modules/.bin/vercel env add SES_FROM_EMAIL production
./node_modules/.bin/vercel env add SES_TO_EMAIL production
```

Cada uno te pide el valor. Después hay que **redeployar** para que las variables nuevas apliquen.

### 3. Enviar el email

1. Abrí la URL del deploy.
2. Completá el formulario: nombre, correo y mensaje (mínimo 10 caracteres).
3. **Enviar mensaje**.
4. La app muestra **"Correo enviado correctamente"** y los campos se vacían.

Eso significa que:
- La function recibió el request.
- El backend validó los tres campos.
- El backend se autenticó con la access key del usuario IAM.
- SES aceptó el envío (`messageId` en la respuesta).

### 4. ⚠️ El email probablemente caiga en SPAM

**Esto es lo normal y hay que avisarlo.** Cuando se envía desde una dirección `@gmail.com`, Gmail no puede
verificar que ese remitente esté autorizado a enviar, así que lo manda a **Spam / Promociones**.

En Gmail, buscá:

```
in:anywhere from:diegograssino@gmail.com
```

**Por qué pasa:** para que un email no caiga en spam, el dominio del remitente tiene que demostrar que puede
enviar con esa dirección. Eso se hace con tres registros DNS:

| Registro | Para qué |
|----------|----------|
| **SPF** | Declara qué servidores pueden enviar con el dominio |
| **DKIM** | Firma cada email para probar que salió del dominio real |
| **DMARC** | Dice qué hacer con los emails que no pasan SPF ni DKIM |

`gmail.com` no tiene ningún registro que diga "puedo enviar en nombre de diegograssino@gmail.com" → Gmail desconfía.

**Cómo se arregla en producción:** usar un **dominio propio** (no un Gmail) y configurarlo en SES:

1. Verificar el dominio en SES (identidad tipo *Domain* → AWS te da los registros CNAME/TXT).
2. Publicar esos registros en el DNS del dominio.
3. Activar **Easy DKIM** (SES genera los registros DKIM → publicarlos).
4. Crear el registro **SPF** y el **DMARC** en el DNS.

Con eso el email entra a la bandeja de entrada, no a spam.

**Alternativa simple para la clase:** como el destinatario es fijo (`SES_TO_EMAIL`), verificá **esa misma dirección
como identidad en SES** (Fase 2, paso 3). Con la cuenta en modo *sandbox*, SES solo entrega a destinatarios
verificados, y el email llega directo a la bandeja.

### 5. Cómo saber qué pasó realmente

Si la UI dice "Correo enviado" pero el email no aparece, el detalle está en el log de SES:

**AWS Console → CloudWatch → Logs → Log groups → `SES-RESPONSE`**

Ahí está el resultado real de cada envío: `Delivery` (llegó), `Bounce` (rechazado), `Reject` (rechazado por
políticas) o `Render failure` (falló la plantilla).

### 6. Checklist final

| Prueba | Resultado esperado |
|--------|--------------------|
| Formulario vacío | El navegador bloquea el envío (`required`, `minLength`) |
| Mensaje de 5 caracteres | El navegador bloquea el envío (`minLength={10}`) |
| Email con formato inválido | El navegador bloquea el envío (`type="email"`) |
| GET a `/api/send-email` | `405` — "Método no permitido" |
| Body sin `name` | `400` — "El cuerpo de la petición es inválido" |
| Nombre de 1 carácter | `400` — "El nombre debe tener entre 2 y 100 caracteres" |
| Email inválido en el body | `400` — "El correo no es válido" |
| Mensaje de 5 caracteres en el body | `400` — "El mensaje debe tener entre 10 y 3000 caracteres" |
| Falta `SES_TO_EMAIL` en el env | `500` — "El servidor no está configurado correctamente" |
| Usuario IAM sin `ses:SendEmail` | `500` — "No se pudo enviar el correo" + `detail` con el error de AWS |
| Formulario válido | `200` — "Correo enviado correctamente" + `messageId` |
| El email llega | En **Spam / Promociones** (ver el aviso de arriba) |
