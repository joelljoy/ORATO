'use client';

import { Bell, Search, ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Link from 'next/link';

interface TopBarProps {
  title?: string;
}

export const TopBar = ({ title }: TopBarProps) => {
  const { user, logout } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '2rem',
        gap: '1rem',
      }}
    >
      {title && (
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--orato-text-primary)' }}>
          {title}
        </h1>
      )}

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={15}
          style={{
            position: 'absolute', left: '0.875rem',
            color: 'var(--orato-text-secondary)',
            pointerEvents: 'none',
          }}
        />
        <input
          placeholder="Search..."
          style={{
            padding: '0.5rem 1rem 0.5rem 2.375rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--orato-border)',
            background: 'var(--orato-surface)',
            fontSize: '0.875rem',
            color: 'var(--orato-text-primary)',
            outline: 'none',
            width: 200,
            fontFamily: 'var(--font-sans)',
            transition: 'all var(--transition-fast)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--orato-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(180,139,175,0.15)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--orato-border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Notifications */}
      <button
        style={{
          position: 'relative',
          background: 'var(--orato-surface)',
          border: '1px solid var(--orato-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--orato-text-secondary)',
          transition: 'all var(--transition-fast)',
        }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span
          style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--orato-highlight)',
            border: '1.5px solid var(--orato-surface)',
          }}
        />
      </button>

      {/* User Menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDropOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--orato-surface)',
            border: '1px solid var(--orato-border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.375rem 0.75rem 0.375rem 0.375rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Avatar src={user?.photoURL} name={user?.displayName || user?.email || undefined} size={30} />
          <ChevronDown size={14} color="var(--orato-text-secondary)" />
        </button>

        {dropOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setDropOpen(false)} />
            <div
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--orato-surface)',
                border: '1px solid var(--orato-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-hover)',
                minWidth: 180, zIndex: 20,
                overflow: 'hidden',
                animation: 'scaleIn 0.15s ease both',
              }}
            >
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--orato-border)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--orato-text-primary)' }}>
                  {user?.displayName || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)' }}>
                  {user?.email}
                </div>
              </div>
              {[
                { href: '/profile', label: 'Profile' },
                { href: '/settings', label: 'Settings' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDropOpen(false)}
                  style={{
                    display: 'block', padding: '0.625rem 1rem',
                    fontSize: '0.875rem', color: 'var(--orato-text-secondary)',
                    textDecoration: 'none', transition: 'all var(--transition-fast)',
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => { setDropOpen(false); logout(); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem', color: 'var(--orato-error)',
                  background: 'transparent', border: 'none',
                  borderTop: '1px solid var(--orato-border)',
                  cursor: 'pointer', transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
