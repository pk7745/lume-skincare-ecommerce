import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);

  if (!initialized || loading) {
    return (
      <div className="pt-24 flex min-h-[60vh] items-center justify-center text-sm text-ink-500">
        Authenticating admin session...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth?redirect=/admin" replace />;
  }

  return <>{children}</>;
}
