import { type FormEvent, useState } from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

type ApiResponse = {
  message?: string;
  error?: string;
  detail?: string;
};

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<FormStatus>("idle");

  const [feedback, setFeedback] = useState("");

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

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        const errorMessage = data.error ?? "No se pudo enviar el mensaje";

        throw new Error(
          data.detail ? `${errorMessage}: ${data.detail}` : errorMessage,
        );
      }

      setStatus("success");
      setFeedback(data.message ?? "Mensaje enviado correctamente");

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");

      setFeedback(
        error instanceof Error ? error.message : "Ocurrió un error inesperado",
      );
    }
  }

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
