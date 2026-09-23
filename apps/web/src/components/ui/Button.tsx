import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-jade text-canvas hover:opacity-90 focus-visible:ring-jade',
  secondary:
    'bg-surface-raised text-text-primary border border-border hover:border-jade focus-visible:ring-jade',
  danger: 'bg-danger text-canvas hover:opacity-90 focus-visible:ring-danger',
  ghost: 'bg-transparent text-text-muted hover:text-text-primary focus-visible:ring-jade',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className = '', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
      {...props}
    />
  );
});
