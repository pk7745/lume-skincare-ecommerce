import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'sale' | 'new' | 'bestseller' | 'low-stock';

const variantClasses: Record<Variant, string> = {
  default: 'bg-ink-100 text-ink-700',
  sale: 'bg-clay-100 text-clay-700',
  new: 'bg-sage-100 text-sage-700',
  bestseller: 'bg-ink-900 text-sand-50',
  'low-stock': 'bg-warning-500/10 text-warning-600',
};

export function Badge({
  variant = 'default',
  children,
  className,
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
