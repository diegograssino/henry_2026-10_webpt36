/**
 * Persistent — input que se persiste en localStorage
 *
 *  ① useEffect(fn, [])     → al montar: lee localStorage y carga el valor
 *  ② useEffect(fn, [name])  → cuando name cambia: guarda en localStorage
 *  ③ useEffect(fn)         → en cada render: log
 */
import { useEffect, useState } from "react";

export default function Persistent() {
  const [name, setName] = useState("");

  // ① Deps [] → corre SOLO al montar
  useEffect(() => {
    const saved = localStorage.getItem("persistent-name");
    if (saved !== null) setName(saved);
    console.log("Persistent mounted · loaded from localStorage:", saved);

    return () => {
      console.log("Persistent unmounted");
    };
  }, []);

  // ② Deps [name] → corre cuando name cambia
  useEffect(() => {
    if (name === "") return; // no guardar vacío al montar
    localStorage.setItem("persistent-name", name);
    console.log("Persistent saved to localStorage:", name);
  }, [name]);

  // ③ Sin deps → corre en cada render
  useEffect(() => {
    console.log("Persistent render · name =", name);
  });

  return (
    <div>
      <h2>Persistent</h2>
      <p>Escribí algo, recargá la página: el valor se mantiene.</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Escribí tu nombre"
      />
      <button
        onClick={() => {
          localStorage.removeItem("persistent-name");
          setName("");
          console.log("Persistent cleared");
        }}
      >
        Limpiar
      </button>
    </div>
  );
}
