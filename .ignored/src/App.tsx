/**
 * Clase 4 — useEffect
 *
 * Demos 1 y 2 viven en este archivo. Los Demos 3 y 4 están separados:
 *   ./Persistent.tsx  → input + localStorage
 *   ./InfiniteLoop.tsx → loop infinito (comentado)
 */
import { useEffect, useState } from "react";
import InfiniteLoop from "./InfiniteLoop";
import Persistent from "./Persistent";

export default function App() {
  const [counter, setCounter] = useState(0);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // ③ Sin deps → corre en cada render
  useEffect(() => {
    console.log("------------------");
    console.log("useEffect without deps");
    console.log("New render");
  });

  // ① Deps [] → corre SOLO al montar (1ª vez)
  useEffect(() => {
    const effect = () => {
      console.log("Se ejecuta el effect");
      setIsFirstRender(false);
    };

    console.log("------------------");
    console.log("useEffect with [] in deps");
    if (isFirstRender) {
      effect();
    }
  }, []);

  // ② Deps [counter] → corre solo cuando counter cambia
  useEffect(() => {
    console.log("------------------");
    console.log("useEffect with [counter] in deps");
    console.log("counter: ", counter);
  }, [counter]);

  const [jumping, setJumping] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms

  useEffect(() => {
    console.log("------------------");
    if (!jumping) return;
    const id = setInterval(() => {
      console.log("tick id =", id);
    }, speed);
    console.log("New interval id", id);

    // 🔓 Descomentar el return para que el cleanup funcione:
    return () => {
      console.log("------------------");
      console.log("Killing interval id", id);
      clearInterval(id);
    };
  }, [jumping, speed]);

  return (
    <main>
      <h1>useEffect</h1>
      <p>Abrí la consola del navegador para ver los logs.</p>

      <p>
        counter = <strong>{counter}</strong> · isFirstRender ={" "}
        <strong>{String(isFirstRender)}</strong>
      </p>

      <button onClick={() => setCounter((c) => c + 1)}>+1</button>

      <br />
      <br />

      <button onClick={() => setJumping((r) => !r)}>
        {jumping ? "Parar" : "Empezar"}
      </button>
      <button
        onClick={() => setSpeed((s) => (s === 1000 ? 500 : 1000))}
        disabled={!jumping}
      >
        Cambiar velocidad ({speed}ms)
      </button>

      <br />
      <br />

      <Persistent />

      <br />
      <br />

      <InfiniteLoop />
    </main>
  );
}
