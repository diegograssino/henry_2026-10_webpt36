/**
 * InfiniteLoop — useEffect sin deps + setState adentro = loop infinito
 *
 * ⚠️  El efecto está COMENTADO.
 *     Descomentalo y mirá la consola. El navegador se va a congelar.
 *     La única manera de pararlo es cerrar la pestaña.
 */
import { useEffect, useState } from "react";

export default function InfiniteLoop() {
  const [infiniteCounter, setInfiniteCounter] = useState(0);
  // Para que TS no se queje: estos se usan en el efecto comentado de abajo.
  void infiniteCounter;
  void setInfiniteCounter;
  void useEffect;

  // useEffect(() => {
  //   console.log(
  //     "Esto se va a descontrolar - infiniteCounter =",
  //     infiniteCounter,
  //   );
  //   setInfiniteCounter((c) => c + 1);
  // }, [infiniteCounter]);

  return (
    <div>
      <h2>InfiniteLoop</h2>
      <p>
        Descomentar el <code>useEffect</code> de arriba para ver el loop.
      </p>
    </div>
  );
}