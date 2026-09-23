import { useEffect, useState } from 'react';
import type { AnalyticsSummary } from '@rescue3d/contracts';
import { Card } from '../components/ui/Card';
import { SimulationDisclaimer } from '../components/SimulationDisclaimer';
import * as incidentApi from '../lib/incidentApi';
import { formatDuration } from './incidents/formatRoute';

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <Card>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
    </Card>
  );
}

function BreakdownTable({
  title,
  counts,
}: {
  title: string;
  counts: Record<string, number>;
}): JSX.Element {
  const entries = Object.entries(counts);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">{title}</h2>
      <ul className="flex flex-col gap-2">
        {entries.map(([key, count]) => (
          <li key={key} className="flex items-center justify-between text-sm">
            <span className="text-text-muted">{key.replace('_', ' ')}</span>
            <span className="text-text-primary">
              {count}
              {total > 0 ? ` (${Math.round((count / total) * 100)}%)` : ''}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AnalyticsPage(): JSX.Element {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    incidentApi
      .getAnalyticsSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <SimulationDisclaimer />
      <h1 className="text-lg font-semibold text-text-primary">Analytics &amp; reports</h1>

      {loading ? <p className="text-sm text-text-muted">Loading...</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {summary ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total incidents" value={String(summary.totalIncidents)} />
            <StatCard label="Total units" value={String(summary.totalUnits)} />
            <StatCard label="Unit utilization" value={`${summary.unitUtilizationPercent}%`} />
            <StatCard
              label="Avg. time to dispatch"
              value={
                summary.averageDispatchSeconds === null
                  ? 'no data yet'
                  : formatDuration(summary.averageDispatchSeconds)
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <BreakdownTable title="Incidents by status" counts={summary.incidentsByStatus} />
            <BreakdownTable title="Incidents by severity" counts={summary.incidentsBySeverity} />
            <BreakdownTable title="Units by status" counts={summary.unitsByStatus} />
          </div>

          {Object.keys(summary.incidentsByType).length > 0 ? (
            <BreakdownTable title="Incidents by type" counts={summary.incidentsByType} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
