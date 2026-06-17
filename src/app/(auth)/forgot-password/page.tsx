'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Mic } from 'lucide-react';
import { resetPassword } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch {
      toast.error('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--orato-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--orato-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={19} color="#fff" />
            </div>
          </Link>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p style={{ fontSize: '0.95rem' }}>We'll send a reset link to your email</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(134,197,163,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Mail size={24} color="var(--orato-success)" />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Check your inbox</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link href="/login"><Button variant="secondary" fullWidth>Back to Sign In</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                autoComplete="email"
                required
              />
              <Button type="submit" fullWidth loading={loading}>
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--orato-text-secondary)', textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
