import { useState, type ChangeEvent } from "react";
import "./index.css"; // Ensure styles are imported

export default function App() {
  // req-3: Estado explícitamente numérico, permitimos string vacío para el estado inicial
  const [celsius, setCelsius] = useState<number | "">("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setCelsius("");
    } else {
      setCelsius(parseFloat(val));
    }
  };

  // req-6: Cálculo automático
  const getFahrenheit = (): string => {
    // req-8: Si está vacío, mostrar 32°F
    if (celsius === "") return (32).toFixed(1);
    
    // req-7: 1 decimal
    const fahrenheit = (celsius * 9) / 5 + 32;
    return fahrenheit.toFixed(1);
  };

  return (
    <div className="container">
      <h1>Conversor de Temperatura Editado</h1>
      <div className="converter">
        <div className="input-group">
          <label htmlFor="celsius">Celsius</label>
          <div className="input-wrapper">
            <input
              type="number"
              id="celsius"
              placeholder="0"
              value={celsius}
              onChange={handleChange}
            />
            <span className="unit">°C</span>
          </div>
        </div>

        <div className="arrow">→</div>

        <div className="output-group">
          <label>Fahrenheit</label>
          <div className="result">
            <span id="fahrenheit">{getFahrenheit()}</span>
            <span className="unit">°F</span>
          </div>
        </div>
      </div>

      <div className="formula">
        Formula: °F = (°C × 9/5) + 32
      </div>
    </div>
  );
}
