export default function RoomCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] w-full rounded-xl bg-bg" />
      <div className="mt-3 h-4 w-2/3 rounded bg-bg" />
      <div className="mt-2 h-3 w-1/2 rounded bg-bg" />
    </div>
  );
}
