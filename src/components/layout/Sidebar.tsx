'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Video, BarChart2,
  User, Settings, LogOut, Mic, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { useState } from 'react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resume', label: 'Resume Center', icon: FileText },
  { href: '/interview', label: 'Interview', icon: Mic },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Sign out failed');
    }
  };

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.25rem 0.75rem',
        gap: '0.25rem',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 0.75rem 1.5rem',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 32, height: 32,
                borderRadius: '10px',
                background: 'var(--orato-highlight)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mic size={17} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--orato-text-primary)', letterSpacing: '-0.02em' }}>
              ORATO
            </span>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              width: 32, height: 32,
              borderRadius: '10px',
              background: 'var(--orato-highlight)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Mic size={17} color="#fff" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="btn-ghost btn"
          style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', display: 'none' }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem',
            marginBottom: '0.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--orato-surface-secondary)',
          }}
        >
          <Avatar src={user?.photoURL} name={user?.displayName || user?.email || undefined} size={36} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--orato-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.displayName || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--orato-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.targetRole || 'Set target role'}
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <Avatar src={user?.photoURL} name={user?.displayName || user?.email || undefined} size={36} />
        </div>
      )}

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: active ? 600 : 500,
                fontSize: '0.9rem',
                color: active ? 'var(--orato-highlight)' : 'var(--orato-text-secondary)',
                background: active ? 'var(--orato-surface-secondary)' : 'transparent',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              className="sidebar-link"
            >
              <Icon size={19} />
              {!collapsed && label}
              {active && !collapsed && (
                <div
                  style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: 'var(--radius-full)',
                    background: 'var(--orato-highlight)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--orato-error)', fontSize: '0.9rem', fontWeight: 500,
          transition: 'all var(--transition-fast)',
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%',
        }}
        className="sidebar-logout"
      >
        <LogOut size={19} />
        {!collapsed && 'Sign Out'}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          background: 'var(--orato-surface)',
          borderRight: '1px solid var(--orato-border)',
          zIndex: 30,
          overflow: 'hidden',
        }}
        className="hidden md:block"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 40,
          background: 'var(--orato-surface)',
          border: '1px solid var(--orato-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-card)',
          cursor: 'pointer',
        }}
        aria-label="Open menu"
      >
        <LayoutDashboard size={20} color="var(--orato-highlight)" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(47, 36, 48, 0.4)',
                backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, zIndex: 50,
                background: 'var(--orato-surface)',
                borderRight: '1px solid var(--orato-border)',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', color: 'var(--orato-text-secondary)',
                }}
              >
                <X size={20} />
              </button>
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .sidebar-link:hover {
          background: var(--orato-surface-secondary) !important;
          color: var(--orato-text-primary) !important;
        }
        .sidebar-logout:hover {
          background: rgba(215, 122, 122, 0.08) !important;
        }
      `}</style>
    </>
  );
};
