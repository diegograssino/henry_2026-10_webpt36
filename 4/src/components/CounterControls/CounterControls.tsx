import { useState } from "react";
import Button from "../Button/Button";
import CounterStatus from "../CounterStatus/CounterStatus";

const CounterControls = () => {
  const MIN_COUNT = -10;
  const MAX_COUNT = 10;
  const STEPS = [1, 2, 5];

  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const handleIncrement = () => {
    //   Early return
    if (count >= MAX_COUNT) return;

    setCount((prev) => prev + step);
  };

  const handleDecrement = () => {
    //   Early return
    if (count <= MIN_COUNT) return;

    setCount((prev) => prev - step);
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleStep = (s: number) => {
    setStep(s);
  };

  return (
    <article>
      <h2>Counter interactivo</h2>
      <p>
        Minimo: {MIN_COUNT}, maximo {MAX_COUNT}
      </p>
      <p>
        El valor es: {count} y el step es {step}
      </p>
      <CounterStatus count={count} />
      <Button onClick={handleIncrement}>Incrementar</Button>
      <Button variant="danger" onClick={handleDecrement}>
        Decrementar
      </Button>
      <Button onClick={handleReset}>Reset</Button>
      {/* const STEPS = [1, 2, 5]; */}
      {STEPS.map((s, i) => (
        <Button
          key={i}
          variant={step === s ? "danger" : "default"}
          onClick={() => handleStep(s)}
        >
          {s}
        </Button>
      ))}
      {/* <Button
        variant={step === 1 ? "danger" : "default"}
        onClick={() => handleStep(1)}
      >
        1
      </Button>
      <Button
        variant={step === 2 ? "danger" : "default"}
        onClick={() => handleStep(2)}
      >
        2
      </Button>
      <Button
        variant={step === 5 ? "danger" : "default"}
        onClick={() => handleStep(5)}
      >
        5
      </Button> */}
    </article>
  );
};

export default CounterControls;
