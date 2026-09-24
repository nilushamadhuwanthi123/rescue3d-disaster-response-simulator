import { FormEvent, useRef, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/TextField';
import { ApiRequestError } from '../lib/apiClient';
import {
  firstInvalidField,
  mapServerFieldErrors,
  validateEmail,
  validateName,
  validateNewPassword,
  validateRegisterForm,
  PASSWORD_MIN_LENGTH,
  type FieldErrors,
  type RegisterField,
} from '../lib/authValidation';

const FIELD_ORDER = ['name', 'email', 'password'] as const;

const VALIDATORS: Record<RegisterField, (value: string) => string | undefined> = {
  name: validateName,
  email: validateEmail,
  password: validateNewPassword,
};

/** The rules, shown up front rather than revealed one rejection at a time. */
const PASSWORD_RULES: ReadonlyArray<{ label: string; met: (v: string) => boolean }> = [
  { label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: (v) => v.length >= PASSWORD_MIN_LENGTH },
  { label: 'An uppercase letter', met: (v) => /[A-Z]/.test(v) },
  { label: 'A number', met: (v) => /[0-9]/.test(v) },
];

export function RegisterPage(): JSX.Element {
  const status = useAuthStore((s) => s.status);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const [values, setValues] = useState<Record<RegisterField, string>>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [touched, setTouched] = useState<Partial<Record<RegisterField, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const refs: Record<RegisterField, React.RefObject<HTMLInputElement>> = {
    name: nameRef,
    email: emailRef,
    password: passwordRef,
  };

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  function setFieldError(field: RegisterField, message: string | undefined) {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  function handleBlur(field: RegisterField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldError(field, VALIDATORS[field](values[field]));
  }

  function handleChange(field: RegisterField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Re-check only a field already showing an error, so it clears as soon as
    // it is fixed without scolding anyone mid-word.
    if (errors[field]) setFieldError(field, VALIDATORS[field](value));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const found = validateRegisterForm(values);
    setTouched({ name: true, email: true, password: true });
    setErrors(found);
    const firstBad = firstInvalidField(found, FIELD_ORDER);
    if (firstBad) {
      refs[firstBad].current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
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
        /* An address already in use is the one conflict worth naming, and it
           belongs on the email input rather than in a sentence at the bottom. */
        if (err.status === 409) {
          setErrors({ email: 'An account with this email already exists.' });
          emailRef.current?.focus();
          return;
        }
        setFormError(err.message);
        return;
      }
      setFormError('Something went wrong creating your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const passwordValue = values.password;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-lg font-semibold text-text-primary">Create an account</h1>
        <p className="mb-6 text-sm text-text-muted">
          Already have one?{' '}
          <Link to="/login" className="text-jade hover:underline">
            Sign in
          </Link>
        </p>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            ref={nameRef}
            label="Name"
            autoComplete="name"
            autoFocus
            value={values.name}
            error={touched.name ? errors.name : undefined}
            onBlur={() => handleBlur('name')}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <TextField
            ref={emailRef}
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            error={touched.email ? errors.email : undefined}
            onBlur={() => handleBlur('email')}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <TextField
              ref={passwordRef}
              label="Password"
              type="password"
              autoComplete="new-password"
              value={passwordValue}
              error={touched.password ? errors.password : undefined}
              onBlur={() => handleBlur('password')}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            <ul className="flex flex-col gap-0.5" aria-label="Password requirements">
              {PASSWORD_RULES.map((rule) => {
                const met = rule.met(passwordValue);
                return (
                  <li
                    key={rule.label}
                    className={`text-xs ${met ? 'text-jade' : 'text-text-muted'}`}
                  >
                    {/* The tick is decorative; the state is already carried by
                        the words "met"/"not met" for anyone not seeing colour. */}
                    <span aria-hidden="true">{met ? '✓' : '•'}</span> {rule.label}
                    <span className="sr-only">{met ? ' — met' : ' — not met'}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <p role="alert" aria-live="polite" className="text-sm text-danger empty:hidden">
            {formError ?? ''}
          </p>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
