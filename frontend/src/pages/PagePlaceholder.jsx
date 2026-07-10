export default function PagePlaceholder({ title }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      <p className="mt-2 text-sm text-text-soft">This page is coming soon.</p>
    </div>
  );
}
