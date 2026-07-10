import AppRouter from './routes/AppRouter';
import AuthProvider from './context/AuthContext';
import { AppToaster } from './context/ToastConfig';

export default function App() {
  return (
    <AuthProvider>
      <AppToaster />
      <AppRouter />
    </AuthProvider>
  );
}
