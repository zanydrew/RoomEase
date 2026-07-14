import loading from '../../assets/laodingv2.gif';

export default function LoadingOverlay({ message = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="flex flex-col items-center rounded-2xl bg-bg-card p-6 shadow-xl border border-border">
        <img src={loading} alt="Loading..." className="h-64 w-64 object-contain" />
        <p className="mt-4 text-sm font-semibold text-text">{message}</p>
      </div>
    </div>
  );
}