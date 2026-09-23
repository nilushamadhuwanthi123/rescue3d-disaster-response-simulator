import { useEffect, useState } from 'react';
import type { IncidentEvent } from '@rescue3d/contracts';
import { Button } from '../../components/ui/Button';
import * as incidentApi from '../../lib/incidentApi';

interface Props {
  incidentId: string;
  /** Bumped by the parent whenever this incident's history may have changed. */
  refreshKey: number;
}

/** A chronological replay of everything that happened to one incident. */
export function IncidentTimeline({ incidentId, refreshKey }: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<IncidentEvent[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setLoading(true);
    incidentApi
      .getIncidentTimeline(incidentId)
      .then((timeline) => {
        if (!cancelled) setEvents(timeline);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Re-fetch whenever the panel opens or the parent signals new activity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, incidentId, refreshKey]);

  return (
    <div className="border-t border-border pt-2">
      <Button variant="ghost" onClick={() => setOpen((v) => !v)} className="!px-0 !py-1 text-xs">
        {open ? 'Hide history' : 'View history'}
      </Button>
      {open ? (
        <ol className="mt-2 flex flex-col gap-1 text-xs text-text-muted">
          {loading ? <li>Loading...</li> : null}
          {!loading && events?.length === 0 ? <li>No events recorded.</li> : null}
          {events?.map((event) => (
            <li key={event.id} className="flex gap-2">
              <span className="shrink-0 text-text-muted/70">
                {new Date(event.createdAt).toLocaleTimeString()}
              </span>
              <span>{event.message}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
