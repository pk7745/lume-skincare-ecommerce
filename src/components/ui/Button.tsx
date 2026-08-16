import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-sand-50 hover:bg-ink-800 active:bg-ink-900 shadow-soft',
  secondary:
    'bg-clay-500 text-sand-50 hover:bg-clay-600 active:bg-clay-700 shadow-soft',
  outline:
    'border border-ink-300 text-ink-900 hover:border-ink-900 hover:bg-ink-50 bg-transparent',
  ghost:
    'text-ink-700 hover:bg-ink-100 hover:text-ink-900 bg-transparent',
  link:
    'text-ink-900 underline-offset-4 hover:underline bg-transparent p-0 h-auto',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs tracking-wide',
  md: 'h-11 px-6 text-sm tracking-wide',
  lg: 'h-14 px-8 text-sm tracking-wide',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-token font-medium uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
