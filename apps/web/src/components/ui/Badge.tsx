import type { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'danger' | 'warning' | 'success';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-surface-raised text-text-muted border-border',
  danger: 'bg-danger/10 text-danger border-danger/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  success: 'bg-jade/10 text-jade border-jade/30',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps): JSX.Element {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
        className,
      ].join(' ')}
      {...props}
    />
  );
}
