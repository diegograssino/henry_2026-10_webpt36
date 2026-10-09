// Recomendacion: Instalar extension ES7/React ... snippets
import { useState } from "react";
import Button from "../Button/Button";
// Utilizar el rafce para escribir rapido componentes
const Counter = () => {
  // Esto es un estado, es el equivalente dentro del mundo React (V-Dom) de un const, let, var PERO que dispara renders
  // Este estado vuelve a su valor inicial (0 en este caso) cuando recargo la pagina, NO PERSISTE
  // Vamos a aplicar un patron que se llama container/ presentational, el container sera dueño de la logica, y el presentational se encargara de mostrarlo en pantalla (uno solo logica, el otro solo muestra)
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <Button><OtroCompnente/></Button> */}
      <Button handleClick={() => setCount((prev) => prev + 1)}>
        {/* Debo usar las {} para mezclar JS dentro de HTML en JSX, pueden ser estados, variables, constantes, funciones, lo que sea (hasta un if else) */}
        Count is {count}
      </Button>
      <Button handleClick={() => console.log(count)}>
        Mostrar console.log
      </Button>
      <Button handleClick={() => setCount(0)}>Reset </Button>
      <Button handleClick={() => setCount((prev) => prev * 2)}>Duplicar</Button>
    </>
  );
};

export default Counter;
