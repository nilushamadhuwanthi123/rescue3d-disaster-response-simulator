import { FormEvent, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/TextField';
import { ApiRequestError } from '../lib/apiClient';
import {
  firstInvalidField,
  mapServerFieldErrors,
  validateEmail,
  validateLoginForm,
  validateLoginPassword,
  type FieldErrors,
  type LoginField,
} from '../lib/authValidation';

/** Visual order, so focus after a failed submit lands on the topmost problem. */
const FIELD_ORDER = ['email', 'password'] as const;

export function LoginPage(): JSX.Element {
  const status = useAuthStore((s) => s.status);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<LoginField>>({});
  /* A field is only allowed to show an error once the person has finished with
     it. Validating on every keystroke from the first character means "e" is
     marked invalid while someone is still typing their address, which reads as
     the form arguing with them. */
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const refs: Record<LoginField, React.RefObject<HTMLInputElement>> = {
    email: emailRef,
    password: passwordRef,
  };

  if (status === 'authenticated') {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
    return <Navigate to={from} replace />;
  }

  function setFieldError(field: LoginField, message: string | undefined) {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  function handleBlur(field: LoginField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldError(field, field === 'email' ? validateEmail(email) : validateLoginPassword(password));
  }

  /* Once a field has been marked invalid, re-check it as the person types, so
     the error clears the moment it is fixed instead of lingering until blur. */
  function handleChange(field: LoginField, value: string) {
    if (field === 'email') setEmail(value);
    else setPassword(value);
    if (errors[field]) {
      setFieldError(field, field === 'email' ? validateEmail(value) : validateLoginPassword(value));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const found = validateLoginForm({ email, password });
    setTouched({ email: true, password: true });
    setErrors(found);
    const firstBad = firstInvalidField(found, FIELD_ORDER);
    if (firstBad) {
      refs[firstBad].current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      // The server lowercases and trims anyway; doing it here too means the
      // value that failed and the value that gets sent are the same string.
      await login({ email: email.trim().toLowerCase(), password });
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const serverFields = mapServerFieldErrors(err.fields, FIELD_ORDER);
        if (Object.keys(serverFields).length > 0) {
          setErrors(serverFields);
          const bad = firstInvalidField(serverFields, FIELD_ORDER);
          if (bad) refs[bad].current?.focus();
          return;
        }
        /* Wrong email and wrong password are reported identically on purpose:
           telling them apart would let anyone check which addresses have an
           account here. */
        setFormError(
          err.status === 401 ? 'That email and password do not match an account.' : err.message,
        );
        return;
      }
      setFormError('Something went wrong signing in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-lg font-semibold text-text-primary">Sign in to Rescue3D</h1>
        <p className="mb-6 text-sm text-text-muted">
          Incident command simulation console. No account?{' '}
          <Link to="/register" className="text-jade hover:underline">
            Create one
          </Link>
          .
        </p>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            ref={emailRef}
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            error={touched.email ? errors.email : undefined}
            onBlur={() => handleBlur('email')}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <TextField
            ref={passwordRef}
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            error={touched.password ? errors.password : undefined}
            onBlur={() => handleBlur('password')}
            onChange={(e) => handleChange('password', e.target.value)}
          />
          {/* Kept in the DOM at all times so a screen reader announces the
              message when it appears, rather than having to discover a node
              that was only just inserted. */}
          <p role="alert" aria-live="polite" className="text-sm text-danger empty:hidden">
            {formError ?? ''}
          </p>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
