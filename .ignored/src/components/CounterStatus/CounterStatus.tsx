import "./CounterStatus.css";

interface CounterStatusProps {
  count: number;
}

export function CounterStatus({ count }: CounterStatusProps) {
  const getStatusText = (): string => {
    if (count > 0) return "positivo";
    if (count < 0) return "negativo";
    return "0 (cero)";
  };

  const getStatusClass = (): string => {
    if (count > 0) return "status-positive";
    if (count < 0) return "status-negative";
    return "status-zero";
  };

  return (
    <div className="counter-status">
      <p className="counter-value">{count}</p>
      <p className={`status-message ${getStatusClass()}`}>
        El contador es {getStatusText()}
      </p>
    </div>
  );
}
