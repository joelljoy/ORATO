'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

export const ProgressRing = ({
  value,
  size = 100,
  strokeWidth = 8,
  color = 'var(--orato-accent)',
  trackColor = 'var(--orato-border)',
  label,
  sublabel,
  animate = true,
}: ProgressRingProps) => {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((animate ? displayValue : value) / 100) * circumference;
  const dashOffset = circumference - progress;

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, animate]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="progress-ring-circle"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {(label || sublabel) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {label && (
            <span style={{ fontSize: size * 0.2, fontWeight: 700, color: 'var(--orato-text-primary)', lineHeight: 1 }}>
              {label}
            </span>
          )}
          {sublabel && (
            <span style={{ fontSize: size * 0.13, color: 'var(--orato-text-secondary)', marginTop: 2 }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
