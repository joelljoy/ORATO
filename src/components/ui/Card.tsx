'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  secondary?: boolean;
  style?: React.CSSProperties;
}

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
  secondary = false,
  style,
}: CardProps) => {
  const paddingClass = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: '',
  }[padding];

  const baseClass = secondary ? 'card-secondary' : 'card';

  const content = (
    <div
      className={`${baseClass} ${paddingClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={hover || onClick ? undefined : style}
    >
      {children}
    </div>
  );

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: 'var(--shadow-hover)' }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: 'var(--radius-lg)', ...style }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
