import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute(): JSX.Element | null {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        Loading session...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
