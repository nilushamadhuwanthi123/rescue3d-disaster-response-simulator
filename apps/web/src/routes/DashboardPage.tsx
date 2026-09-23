import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SimulationDisclaimer } from '../components/SimulationDisclaimer';

export function DashboardPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col gap-6">
      <SimulationDisclaimer />
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Welcome{user ? `, ${user.name}` : ''}
            </h1>
            <p className="text-sm text-text-muted">
              The incident command center, routing engine and analytics views land in the
              branches that follow this one.
            </p>
          </div>
          {user ? <Badge tone="success">{user.role}</Badge> : null}
        </div>
      </Card>
    </div>
  );
}
