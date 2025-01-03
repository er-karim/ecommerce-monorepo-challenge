interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  required,
  helperText,
  className,
  ...props
}: FormInputProps): JSX.Element {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      <input
        className={`input input-bordered w-full ${error ? "input-error" : ""} ${className}`}
        {...props}
      />
      {helperText && (
        <label className="label">
          <span className="label-text-alt text-gray-500">{helperText}</span>
        </label>
      )}
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
