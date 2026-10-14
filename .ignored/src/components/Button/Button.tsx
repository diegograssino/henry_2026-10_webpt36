import React from "react";
import "./Button.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger" | "active";
}

export function Button({
  variant = "default",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const variantClass = variant === "default" ? "" : `counter-${variant}`;
  const combinedClassName = `counter ${variantClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
}
