import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { DEMO_EMAIL, DEMO_PASSWORD } from '../features/auth/authService';
import { useSession } from '../features/auth/SessionProvider';
import {
  loginFormDefaults,
  loginFormSchema,
  type LoginFormValues,
} from '../features/auth/loginForm';

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';

  try {
    const target = new URL(value, window.location.origin);
    return target.origin === window.location.origin
      ? `${target.pathname}${target.search}${target.hash}`
      : '/';
  } catch {
    return '/';
  }
}

export default function LoginPage() {
  const { signIn, status } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get('returnTo'));
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: loginFormDefaults,
    resolver: zodResolver(loginFormSchema),
  });

  if (status === 'checking') return <p role="status">Checking session…</p>;
  if (status === 'authenticated') return <Navigate replace to={returnTo} />;

  const submitLogin = async (values: LoginFormValues) => {
    try {
      await signIn(values);
      navigate(returnTo, { replace: true });
    } catch {
      setError('root', {
        type: 'server',
        message: 'Email or password is incorrect.',
      });
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <header className="page__header">
          <p className="eyebrow">Member access</p>
          <h1 className="page__title" id="login-title">
            Sign in
          </h1>
          <p className="page__lead">Authenticate before creating a catalog entry.</p>
        </header>

        <form
          className="login-form"
          aria-label="Sign in"
          noValidate
          onSubmit={handleSubmit(submitLogin)}
        >
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
            {errors.email ? (
              <p className="form-error" id="login-email-error" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              aria-invalid={errors.password ? 'true' : 'false'}
              {...register('password')}
            />
            {errors.password ? (
              <p className="form-error" id="login-password-error" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="form-error form-error--panel" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <aside className="demo-credentials" aria-label="Demo credentials">
          <strong>Demo account</strong>
          <span>{DEMO_EMAIL}</span>
          <span>{DEMO_PASSWORD}</span>
        </aside>
      </section>
    </div>
  );
}
