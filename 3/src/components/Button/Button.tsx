type ButtonVariant = "green" | "red" | "default";

interface ButtonProps {
  children: React.ReactNode;
  handleClick: () => void;
  variant?: ButtonVariant;
}
// <Button />
// <Button>children</Button></Button>

// Es un componente reutilizable
const Button = ({
  children,
  handleClick,
  variant = "default",
}: ButtonProps) => {
  return (
    <button
      type="button"
      className={`counter ${variant}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default Button;
