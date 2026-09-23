import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/TextField';
import { Badge } from '../components/ui/Badge';
import { SimulationDisclaimer } from '../components/SimulationDisclaimer';

const TOKEN_SWATCHES = [
  { name: 'canvas', className: 'bg-canvas' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'surface-raised', className: 'bg-surface-raised' },
  { name: 'ember', className: 'bg-ember' },
  { name: 'jade', className: 'bg-jade' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'warning', className: 'bg-warning' },
  { name: 'success', className: 'bg-success' },
];

/** Dev-only route: a living reference for every token and shared component. */
export function DesignSystemPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-lg font-semibold text-text-primary">Design System</h1>
        <SimulationDisclaimer />
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-text-muted">Color tokens</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {TOKEN_SWATCHES.map((swatch) => (
            <div key={swatch.name} className="flex flex-col items-center gap-1">
              <div className={`h-12 w-12 rounded-md border border-border ${swatch.className}`} />
              <span className="text-xs text-text-muted">{swatch.name}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-text-muted">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-text-muted">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-text-muted">Form fields</h2>
        <div className="grid max-w-sm gap-4">
          <TextField label="Email" placeholder="you@example.com" />
          <TextField label="Password" type="password" error="Password must be at least 8 characters" />
        </div>
      </Card>
    </div>
  );
}
