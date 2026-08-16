export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function starArray(rating: number): { filled: boolean; half: boolean }[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return { filled: true, half: false };
    if (rating >= i + 0.5) return { filled: false, half: true };
    return { filled: false, half: false };
  });
}
