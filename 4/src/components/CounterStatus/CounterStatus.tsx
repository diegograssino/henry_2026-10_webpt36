import "./CounterStatus.css";

type CounterStatusStatuses = "negative" | "zero" | "positive";

interface CounterStatusProps {
  count: number;
}

const CounterStatus = ({ count }: CounterStatusProps) => {
  const getStatus = (count: number): CounterStatusStatuses => {
    let status: CounterStatusStatuses = "positive";

    if (count < 0) {
      status = "negative";
    } else if (count === 0) {
      status = "zero";
    }

    return status;
  };

  const getLabel = (count: number): string => {
    let label: string = "El count es positivo";

    if (count < 0) {
      label = "El count es negativo";
    } else if (count === 0) {
      label = "El count es igual a cero";
    }

    return label;
  };
  return <p className={getStatus(count)}>{getLabel(count)}</p>;
};

export default CounterStatus;
