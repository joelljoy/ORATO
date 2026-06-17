'use client';

import { useState, InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

export const Input = ({ label, error, icon, hint, className = '', type, ...props }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--orato-text-primary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--orato-text-secondary)' }}
          >
            {icon}
          </div>
        )}
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className={`input ${error ? 'error' : ''} ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-60"
            style={{ color: 'var(--orato-text-secondary)' }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs font-medium" style={{ color: 'var(--orato-error)' }}>
          {error}
        </span>
      )}
      {hint && !error && (
        <span className="text-xs" style={{ color: 'var(--orato-text-secondary)' }}>
          {hint}
        </span>
      )}
    </div>
  );
};
