import { useEffect, useState } from "react";

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

  // Sincronizo el estado name con lo que haya en el localStoraga cada vez que name cambia
  useEffect(() => {
    if (name === "") return;
    localStorage.setItem("name", name);
  }, [name]);

  // Este se ejecuta en cada render porque no tiene deps
  useEffect(() => {
    console.log(name);
  });

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

export default Persistence;
