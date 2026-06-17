'use client';

import Image from 'next/image';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const Avatar = ({ src, name, size = 40, className = '' }: AvatarProps) => {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--orato-surface-secondary)',
    border: '2px solid var(--orato-border)',
    fontSize: size * 0.35,
    fontWeight: 700,
    color: 'var(--orato-highlight)',
  };

  if (src) {
    return (
      <div style={style} className={className}>
        <Image src={src} alt={name || 'Avatar'} width={size} height={size} style={{ objectFit: 'cover' }} />
      </div>
    );
  }

  if (name) {
    return (
      <div style={style} className={className}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div style={style} className={className}>
      <User size={size * 0.45} />
    </div>
  );
};
