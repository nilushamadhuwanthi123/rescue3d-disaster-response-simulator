import { FormEvent, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/TextField';

export function RegisterPage(): JSX.Element {
  const status = useAuthStore((s) => s.status);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
