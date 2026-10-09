interface ButtonProps {
  children: React.ReactNode;
  handleClick: () => void;
}

// Es un componente reutilizable
const Button = ({ children, handleClick }: ButtonProps) => {
  return (
    <button type="button" className="counter" onClick={handleClick}>
      {children}
    </button>
  );
};

export default Button;
