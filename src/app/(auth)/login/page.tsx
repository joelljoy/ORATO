'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signInGoogle, signInEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signInEmail(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      if (message.includes('user-not-found') || message.includes('wrong-password') || message.includes('invalid-credential')) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInGoogle();
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch {
      toast.error('Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--orato-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--orato-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={19} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--orato-text-primary)', letterSpacing: '-0.02em' }}>ORATO</span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ fontSize: '0.95rem' }}>Sign in to your interview dashboard</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Google Button */}
          <Button
            variant="secondary"
            fullWidth
            loading={googleLoading}
            onClick={handleGoogle}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            }
            style={{ marginBottom: '1.5rem' }}
          >
            Continue with Google
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)', whiteSpace: 'nowrap' }}>or with email</span>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
              error={errors.password}
              icon={<Lock size={16} />}
              autoComplete="current-password"
            />
            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <Link href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--orato-highlight)', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.25rem' }}>
              Sign In
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--orato-text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--orato-highlight)', fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
