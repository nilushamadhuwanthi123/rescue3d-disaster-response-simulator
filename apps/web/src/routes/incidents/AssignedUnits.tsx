import { useEffect, useState } from 'react';
import type { Assignment, SceneRoute } from '@rescue3d/contracts';
import * as incidentApi from '../../lib/incidentApi';
import { formatDistance, formatDuration, formatRiskPercent } from './formatRoute';

interface RouteRow {
  assignment: Assignment;
  route: SceneRoute | null;
}

interface Props {
  incidentId: string;
  /** Bumped by the parent whenever it wants this list to refetch. */
  refreshKey: number;
}

export function AssignedUnits({ incidentId, refreshKey }: Props): JSX.Element | null {
  const [rows, setRows] = useState<RouteRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const assignments = await incidentApi.listAssignmentsForIncident(incidentId);
      const active = assignments.filter((a) => a.status !== 'released');
      const withRoutes = await Promise.all(
        active.map(async (assignment) => {
          try {
            const route = await incidentApi.getAssignmentRoute(assignment.id);
            return { assignment, route };
          } catch {
            return { assignment, route: null };
          }
        }),
      );
      if (!cancelled) setRows(withRoutes);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [incidentId, refreshKey]);

  if (rows.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1 border-t border-border pt-2 text-xs text-text-muted">
      {rows.map(({ assignment, route }) => (
        <li key={assignment.id} className="flex items-center justify-between gap-2">
          <span>Unit {assignment.unitId.slice(-6)}</span>
          {route ? (
            <span>
              {formatDistance(route.distanceMeters)} &middot; {formatDuration(route.estimatedSeconds)}{' '}
              &middot; risk {formatRiskPercent(route.riskScore)}
            </span>
          ) : (
            <span>route unavailable</span>
          )}
        </li>
      ))}
    </ul>
  );
}
