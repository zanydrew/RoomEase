export default function EmptyState({ title = 'Nothing here yet', description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
      {Icon && <Icon size={28} className="mb-3 text-text-muted" />}
      <p className="text-sm font-semibold text-text">{title}</p>
      {description && <p className="mt-1 text-sm text-text-soft">{description}</p>}
    </div>
  );
}
