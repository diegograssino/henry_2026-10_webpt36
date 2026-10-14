import { useState } from "react";
import type { MouseEvent } from "react";
import "./App.css";
import { CounterControls } from "./components/CounterControls/CounterControls";
import { CounterStatus } from "./components/CounterStatus/CounterStatus";

const MIN_COUNT = -10;
const MAX_COUNT = 20;

function App() {
  const [count, setCount] = useState<number>(0);
  const [step, setStep] = useState<number>(1);

  const canIncrement = count + step <= MAX_COUNT;
  const canDecrement = count - step >= MIN_COUNT;

  // Named event handlers tipados con React.MouseEvent<HTMLButtonElement>
  const handleIncrement = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!canIncrement) return;
    setCount((prev) => prev + step);
  };

  const handleDecrement = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!canDecrement) return;
    setCount((prev) => prev - step);
  };

  const handleReset = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCount(0);
  };

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
  };

  return (
    <section id="center">
      <div>
        <h1>Contador Interactivo</h1>
        <p>
          Límites: Min ({MIN_COUNT}) | Max ({MAX_COUNT})
        </p>
      </div>

      {/* Componente que muestra el estado actual */}
      <CounterStatus count={count} />

      {/* Componente con los controles del contador */}
      <CounterControls
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onReset={handleReset}
        step={step}
        onStepChange={handleStepChange}
        canIncrement={canIncrement}
        canDecrement={canDecrement}
      />
    </section>
  );
}

export default App;
