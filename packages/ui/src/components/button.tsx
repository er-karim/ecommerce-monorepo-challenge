interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "accent";
}

export function Button({
  children,
  loading,
  variant = "primary",
  className,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`btn ${variant === "primary" ? "btn-primary" : variant === "secondary" ? "btn-secondary" : "btn-accent"} ${
        loading ? "loading" : ""
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : null}
      {children}
    </button>
  );
}
