export function FormGroup({ label, name, children, error }) {
  return (
    <div className="mb-4">
      <label className="form-label" htmlFor={name}>{label}</label>
      {children}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
