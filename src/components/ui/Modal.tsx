'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const maxWidth = { sm: '400px', md: '560px', lg: '720px', xl: '900px' }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(47, 36, 48, 0.35)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <div style={{ position: 'fixed', inset: 0, zIndex: 51, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                background: 'var(--orato-surface)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-modal)',
                border: '1px solid var(--orato-border)',
                width: '100%',
                maxWidth,
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              {title && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.5rem 1rem' }}>
                  <h3 style={{ color: 'var(--orato-text-primary)', fontSize: '1.125rem', fontWeight: 700 }}>{title}</h3>
                  <button
                    onClick={onClose}
                    className="btn-ghost btn"
                    style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <div style={{ padding: title ? '0 1.5rem 1.5rem' : '1.5rem' }}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
