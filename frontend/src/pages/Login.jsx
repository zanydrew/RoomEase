import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import FormInput from '../components/forms/FormInput';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import useAuth from '../hooks/useAuth';
import { getRoleHomeRoute } from '../utils/roleRedirect';
import { notify } from '../context/ToastConfig';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  function goToDestination(user) {
    const redirectTo = location.state?.from?.pathname || getRoleHomeRoute(user);
    navigate(redirectTo, { replace: true });
  }

  async function onSubmit(data) {
    try {
      const user = await login(data);
      notify.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      goToDestination(user);
    } catch (err) {
      notify.error(err);
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Enter your details to access your account.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormInput
          label="Email"
          type="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required.',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
          })}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-text">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-gold-dark hover:underline">
              Forgot password?
            </Link>
          </div>
          <FormInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            rightAdornment={
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((show) => !show)}
                className="text-text-muted hover:text-text-soft"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            {...register('password', { required: 'Password is required.' })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-dark transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
          {!isSubmitting && <ArrowRight size={16} />}
        </button>

        <div className="my-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase text-text-muted">Or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton onAuthenticated={goToDestination} onError={notify.error} />
      </form>
    </AuthLayout>
  );
}
