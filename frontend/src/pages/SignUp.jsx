import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, Home, KeyRound } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import FormInput from '../components/forms/FormInput';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import useAuth from '../hooks/useAuth';
import { getRoleHomeRoute } from '../utils/roleRedirect';
import { notify } from '../context/ToastConfig';
import { ROLES } from '../utils/constants';

const ROLE_OPTIONS = [
  { value: ROLES.RENTER, label: 'Rent a Room', icon: Home },
  { value: ROLES.OWNER, label: 'Post a Room', icon: KeyRound },
];

export default function SignUp() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(ROLES.RENTER);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { full_name: '', email: '', password: '' } });

  function goToDestination(user) {
    navigate(getRoleHomeRoute(user), { replace: true });
  }

  async function onSubmit(data) {
    try {
      const user = await registerUser({ ...data, role });
      notify.success(`Welcome to RoomEase, ${user.full_name.split(' ')[0]}!`);
      goToDestination(user);
    } catch (err) {
      notify.error(err);
    }
  }

  return (
    <AuthLayout title="Create an Account" subtitle="Join RoomEase to find or list your premium space.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-text">I am looking to...</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((option) => {
              const isSelected = role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center gap-2 rounded-lg border py-4 text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'border-gold-dark bg-gold/20 text-gold-dark'
                      : 'border-border text-text-soft hover:border-text-muted'
                  }`}
                >
                  <option.icon size={20} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <FormInput
          label="Full Name"
          placeholder="John Doe"
          error={errors.full_name?.message}
          {...register('full_name', { required: 'Full name is required.' })}
        />

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

        <FormInput
          label="Password"
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
          {...register('password', {
            required: 'Password is required.',
            minLength: { value: 8, message: 'Password must be at least 8 characters.' },
          })}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-dark transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
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
