import type { Incident, IncidentStatus, ResponseUnit } from '@rescue3d/contracts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { severityTone } from './severityTone';

const NEXT_STATUS: Partial<Record<IncidentStatus, IncidentStatus>> = {
  reported: 'dispatched',
  dispatched: 'in_progress',
  in_progress: 'contained',
  contained: 'resolved',
};

interface Props {
  incident: Incident;
  availableUnits: ResponseUnit[];
  onAdvanceStatus: (id: string) => void;
  onAssignUnit: (incidentId: string, unitId: string) => void;
}

export function IncidentCard({ incident, availableUnits, onAdvanceStatus, onAssignUnit }: Props): JSX.Element {
  const nextStatus = NEXT_STATUS[incident.status];

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{incident.title}</h3>
          <p className="mt-1 text-xs text-text-muted">{incident.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
          <Badge tone="neutral">{incident.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {nextStatus ? (
          <Button variant="secondary" onClick={() => onAdvanceStatus(incident.id)}>
            Move to {nextStatus.replace('_', ' ')}
          </Button>
        ) : null}

        {availableUnits.length > 0 ? (
          <select
            aria-label="Assign a unit"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onAssignUnit(incident.id, e.target.value);
              e.target.value = '';
            }}
            className="rounded-md border border-border bg-surface-raised px-2 py-1.5 text-xs text-text-primary"
          >
            <option value="" disabled>
              Assign a unit...
            </option>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.type.replace('_', ' ')})
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-text-muted">No available units</span>
        )}
      </div>
    </Card>
  );
}
