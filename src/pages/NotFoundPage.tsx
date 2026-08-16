import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="pt-16 lg:pt-20 flex min-h-[60vh] flex-col items-center justify-center text-center container-page">
      <p className="font-display text-6xl font-light text-ink-300 sm:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-light text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="mt-6"><Button variant="primary">Back to Home</Button></Link>
    </div>
  );
}
