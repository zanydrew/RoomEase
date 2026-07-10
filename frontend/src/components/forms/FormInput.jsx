export default function FormInput({ label, error, type = 'text', rightAdornment, className = '', ...rest }) {
  const inputId = rest.id || rest.name;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          id={inputId}
          className={`w-full rounded-lg border bg-bg-card px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold-dark/30 ${
            error ? 'border-danger' : 'border-border'
          } ${rightAdornment ? 'pr-11' : ''} ${className}`}
          aria-invalid={!!error}
          {...rest}
        />
        {rightAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightAdornment}</div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
