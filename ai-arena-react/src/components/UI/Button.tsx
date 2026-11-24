import "./UI.css";

export type ButtonProps = {
  variant?: "primary" | "secondary";
  onClick: () => void;
  children: React.ReactNode;
};

export const Button = ({
  variant = "primary",
  onClick,
  children,
}: ButtonProps) => {
  return (
    <button
      className={`button ${variant === "secondary" ? "btn-secondary" : "btn-primary"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
