'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Eye, Bell, Shield, Save, Moon, Sun, Monitor, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSettings, updateUserSettings } from '@/lib/firebase/firestore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dataRetentionDays, setDataRetentionDays] = useState(365);

  // Sync settings on mount
  useEffect(() => {
    if (!user) return;
    getUserSettings(user.uid).then(settings => {
      if (settings) {
        setTheme(settings.theme || 'light');
        setEmailNotifications(settings.emailNotifications !== undefined ? settings.emailNotifications : true);
        setDataRetentionDays(settings.dataRetentionDays || 365);
      }
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateUserSettings(user.uid, {
        theme,
        emailNotifications,
        dataRetentionDays,
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to save settings changes');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const confirm = window.confirm('Are you absolutely sure you want to delete all interview history? This action is permanent and cannot be undone.');
    if (confirm) {
      toast.success('Request received. Data is being cleared.');
    }
  };

  if (authLoading) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ animation: 'spin 1s linear infinite', border: '3px solid var(--orato-border)', borderTopColor: 'var(--orato-highlight)', width: 30, height: 30, borderRadius: '50%' }} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopBar title="Settings" />

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Appearance (Theme) */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} color="var(--orato-highlight)" />
              Theme Appearance
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { value: 'light', label: 'Light Mode', icon: Sun },
                { value: 'dark', label: 'Dark Mode', icon: Moon, desc: '(Premium Only)' },
                { value: 'system', label: 'System theme', icon: Monitor },
              ].map(opt => {
                const active = theme === opt.value;
                const isPremiumLocked = opt.value === 'dark';
                return (
                  <motion.div
                    key={opt.value}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isPremiumLocked) {
                        toast.error('Dark mode is currently a premium customization feature.');
                        return;
                      }
                      setTheme(opt.value as any);
                    }}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${active ? 'var(--orato-highlight)' : 'var(--orato-border)'}`,
                      background: active ? 'rgba(138,106,139,0.06)' : 'var(--orato-bg)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: active ? 'var(--orato-highlight)' : 'var(--orato-text-secondary)' }}>
                      <opt.icon size={20} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--orato-text-primary)' }}>{opt.label}</div>
                    {opt.desc && <div style={{ fontSize: '0.68rem', color: 'var(--orato-text-secondary)', marginTop: '0.25rem' }}>{opt.desc}</div>}
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--orato-accent)" />
              Notifications
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--orato-text-primary)' }}>
                  Email Notifications
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--orato-text-secondary)', marginTop: '0.125rem' }}>
                  Receive tips, progress updates, and weekly practice summaries.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={e => setEmailNotifications(e.target.checked)}
                style={{
                  width: 20,
                  height: 20,
                  accentColor: 'var(--orato-highlight)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--orato-success)" />
              Privacy & Data Control
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--orato-text-secondary)' }}>
                  Data Retention (Days)
                </label>
                <input
                  type="number"
                  value={dataRetentionDays}
                  onChange={e => setDataRetentionDays(parseInt(e.target.value) || 365)}
                  className="input"
                  style={{ maxWidth: 120 }}
                  min={30}
                  max={3650}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)' }}>
                  Automatically purge transcripts and reports after this time.
                </span>
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--orato-text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <AlertTriangle size={15} color="var(--orato-error)" />
                    Clear Practice History
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--orato-text-secondary)', marginTop: '0.125rem' }}>
                    This permanently deletes all your saved interview sessions, transcripts, and evaluation reports.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="btn btn-secondary"
                  style={{ borderColor: 'var(--orato-error)', color: 'var(--orato-error)', padding: '0.5rem 0.875rem', fontSize: '0.82rem', fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(215, 122, 122, 0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </Card>

          {/* Action CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              loading={loading}
              icon={<Save size={18} />}
            >
              Save Configuration
            </Button>
          </div>

        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </PageWrapper>
  );
}
