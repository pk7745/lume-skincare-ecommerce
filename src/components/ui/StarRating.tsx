import { cn } from '@/lib/utils';
import { starArray } from '@/lib/utils';

export function StarRating({
  rating,
  size = 'sm',
  showValue = false,
  reviewCount,
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}) {
  const stars = starArray(rating);
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((star, i) => (
          <span key={i} className={cn('relative inline-block', sizeClass)}>
            <span className="absolute inset-0 text-ink-200">★</span>
            {star.filled && (
              <span className="absolute inset-0 text-clay-500">★</span>
            )}
            {star.half && (
              <span
                className="absolute inset-0 overflow-hidden text-clay-500"
                style={{ width: '50%' }}
              >
                ★
              </span>
            )}
          </span>
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-ink-600">
          {rating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
}
