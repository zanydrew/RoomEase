import { Toaster, toast } from 'react-hot-toast';

// Mounted once near the root of the app (see App.jsx).
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#1D1D1D',
          border: '1px solid #E8E5E0',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#16A34A',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#DC2626',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  );
}

// Shared helpers so every page raises toasts the same way, and so
// backend error messages are unwrapped consistently in one place.
export const notify = {
  success: (message) => toast.success(message),
  error: (errOrMessage) => {
    const message =
      typeof errOrMessage === 'string'
        ? errOrMessage
        : errOrMessage?.response?.data?.message || errOrMessage?.message || 'Something went wrong.';
    toast.error(message);
  },
  loading: (message) => toast.loading(message),
  dismiss: (toastId) => toast.dismiss(toastId),
};
