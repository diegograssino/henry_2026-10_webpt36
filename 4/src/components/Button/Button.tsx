import "./Button.css";

type ButtonVariants = "default" | "ghost" | "danger";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariants;
  // Esta es la manera mas especifica, pero menos generica
  // children: React.ReactNode;
  // onClick?: () => void;
}

const Button = ({
  children,
  variant = "default",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button className={`button ${variant} ${className ?? ""}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
