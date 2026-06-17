'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signUpEmail, signInGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters required';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signUpEmail(form.email, form.password, form.name);
      toast.success('Account created! Welcome to ORATO 🎉');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('email-already-in-use')) toast.error('Email already in use. Try signing in.');
      else toast.error('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInGoogle();
      toast.success('Welcome to ORATO 🎉');
      router.push('/dashboard');
    } catch {
      toast.error('Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--orato-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--orato-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={19} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--orato-text-primary)', letterSpacing: '-0.02em' }}>ORATO</span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create your account</h1>
          <p style={{ fontSize: '0.95rem' }}>Start practicing interviews for free</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
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
            Sign up with Google
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--orato-text-secondary)', whiteSpace: 'nowrap' }}>or with email</span>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Full name" type="text" placeholder="Your full name" value={form.name} onChange={update('name')} error={errors.name} icon={<User size={16} />} autoComplete="name" />
            <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} error={errors.email} icon={<Mail size={16} />} autoComplete="email" />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={update('password')} error={errors.password} icon={<Lock size={16} />} autoComplete="new-password" />
            <Input label="Confirm password" type="password" placeholder="Repeat your password" value={form.confirm} onChange={update('confirm')} error={errors.confirm} icon={<Lock size={16} />} autoComplete="new-password" />
            <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.25rem' }}>
              Create Free Account
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--orato-text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--orato-highlight)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
