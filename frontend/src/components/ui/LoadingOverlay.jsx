import loading from '../../assets/laodingv2.gif';

export default function LoadingOverlay({ message = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="flex flex-col items-center p-6">
        <img src={loading} alt="Loading..." className="h-32 w-32 object-contain" />
        <p className="mt-4 text-sm font-semibold text-white">{message}</p>
      </div>
    </div>
  );
}