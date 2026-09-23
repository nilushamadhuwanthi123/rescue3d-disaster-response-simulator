import type { IncidentSeverity } from '@rescue3d/contracts';

export function severityTone(severity: IncidentSeverity): 'neutral' | 'warning' | 'danger' {
  if (severity === 'critical' || severity === 'high') return 'danger';
  if (severity === 'moderate') return 'warning';
  return 'neutral';
}
