import { FormEvent, useState } from 'react';
import type { IncidentSeverity, IncidentType } from '@rescue3d/contracts';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';

const TYPES: IncidentType[] = ['fire', 'flood', 'earthquake', 'medical', 'hazmat', 'structural'];
const SEVERITIES: IncidentSeverity[] = ['low', 'moderate', 'high', 'critical'];

interface Props {
  onSubmit: (input: {
    title: string;
    description: string;
    type: IncidentType;
    severity: IncidentSeverity;
    location: { lat: number; lng: number };
  }) => Promise<void>;
}

export function CreateIncidentForm({ onSubmit }: Props): JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IncidentType>('fire');
  const [severity, setSeverity] = useState<IncidentSeverity>('moderate');
  const [lat, setLat] = useState('6.9271');
  const [lng, setLng] = useState('79.8612');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        type,
        severity,
        location: { lat: Number(lat), lng: Number(lng) },
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary" htmlFor="incident-description">
          Description
        </label>
        <textarea
          id="incident-description"
          required
          minLength={10}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-jade"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary" htmlFor="incident-type">
            Type
          </label>
          <select
            id="incident-type"
            value={type}
            onChange={(e) => setType(e.target.value as IncidentType)}
            className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary" htmlFor="incident-severity">
            Severity
          </label>
          <select
            id="incident-severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
            className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Latitude"
          type="number"
          step="any"
          required
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <TextField
          label="Longitude"
          type="number"
          step="any"
          required
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Reporting...' : 'Report incident'}
      </Button>
    </form>
  );
}
