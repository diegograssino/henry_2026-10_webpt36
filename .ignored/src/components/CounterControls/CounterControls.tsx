import type { MouseEventHandler } from "react";
import { Button } from "../Button/Button";
import "./CounterControls.css";

interface CounterControlsProps {
  onIncrement: MouseEventHandler<HTMLButtonElement>;
  onDecrement: MouseEventHandler<HTMLButtonElement>;
  onReset: MouseEventHandler<HTMLButtonElement>;
  step: number;
  onStepChange: (step: number) => void;
  canIncrement: boolean;
  canDecrement: boolean;
}

export function CounterControls({
  onIncrement,
  onDecrement,
  onReset,
  step,
  onStepChange,
  canIncrement,
  canDecrement,
}: CounterControlsProps) {
  return (
    <div className="counter-controls">
      <div className="counter-actions">
        <Button onClick={onDecrement} disabled={!canDecrement}>
          - {step}
        </Button>

        <Button onClick={onIncrement} disabled={!canIncrement} variant="primary">
          + {step}
        </Button>

        <Button onClick={onReset} variant="danger">
          Reset
        </Button>
      </div>

      <div className="counter-steps">
        <span className="step-label">Paso:</span>
        <Button onClick={() => onStepChange(1)} variant={step === 1 ? "active" : "default"}>
          1
        </Button>
        <Button onClick={() => onStepChange(2)} variant={step === 2 ? "active" : "default"}>
          2
        </Button>
        <Button onClick={() => onStepChange(5)} variant={step === 5 ? "active" : "default"}>
          5
        </Button>
      </div>
    </div>
  );
}
