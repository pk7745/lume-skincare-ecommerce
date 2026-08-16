import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signIn, signUp, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const rawRedirect = params.get('redirect') ?? '';
  const redirectPath = rawRedirect
    ? rawRedirect.startsWith('/')
      ? rawRedirect
      : `/${rawRedirect}`
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (!error) {
        const loggedInUser = useAuthStore.getState().user;
        if (redirectPath) {
          navigate(redirectPath);
        } else if (loggedInUser?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (!error) {
        const loggedInUser = useAuthStore.getState().user;
        if (redirectPath) {
          navigate(redirectPath);
        } else if (loggedInUser?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      }
    }
  };

  return (
    <div className="pt-16 lg:pt-20 flex min-h-[calc(100vh-5rem)] items-center justify-center bg-sand-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md px-5"
      >
        <div className="rounded-token-xl border border-ink-100 bg-sand-50 p-8 shadow-soft">
          <div className="mb-8 text-center">
            <Link to="/" className="font-display text-2xl text-ink-900">LUMÉ</Link>
            <h1 className="mt-4 font-display text-2xl font-light text-ink-900">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              {mode === 'signin' ? 'Sign in to your account to continue' : 'Join LUMÉ for a better skincare experience'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Doe"
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              required
              placeholder="jane@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              required
              placeholder="••••••••"
              minLength={6}
            />
            {error && <p className="text-sm text-error-500">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-500">
            {mode === 'signin' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); clearError(); }} className="font-medium text-clay-600 hover:text-clay-700 underline underline-offset-2">
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); clearError(); }} className="font-medium text-clay-600 hover:text-clay-700 underline underline-offset-2">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
