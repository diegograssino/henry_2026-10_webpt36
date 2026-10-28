import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonVariants = "default" | "ghost" | "danger" | "google";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariants;
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
