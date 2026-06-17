'use client';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

export const Skeleton = ({ width = '100%', height = '1rem', className = '', rounded = false }: SkeletonProps) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: rounded ? '50%' : 'var(--radius-sm)' }}
  />
);

export const SkeletonCard = () => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <Skeleton height="1.25rem" width="60%" />
    <Skeleton height="0.875rem" width="40%" />
    <Skeleton height="3rem" />
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height="0.875rem" width={i === lines - 1 ? '70%' : '100%'} />
    ))}
  </div>
);
