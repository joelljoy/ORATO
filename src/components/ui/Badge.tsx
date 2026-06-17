'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'accent' | 'success' | 'warning' | 'error' | 'default';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge = ({ children, variant = 'accent', className = '', style }: BadgeProps) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {children}
    </span>
  );
};
