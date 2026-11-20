export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
