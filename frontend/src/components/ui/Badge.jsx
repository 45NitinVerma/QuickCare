import React from 'react';
import { cn } from './Button';

const variantMap = {
  default:  { base: "bg-[var(--bg-secondary)] text-[var(--text-secondary)] ring-1 ring-[var(--border)]" },
  success:  { base: "bg-[var(--success-light)] text-[var(--accent)] ring-1 ring-green-200 dark:ring-green-900/40" },
  warning:  { base: "bg-[var(--warning-light)] text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-900/40" },
  danger:   { base: "bg-[var(--danger-light)] text-[var(--danger)] ring-1 ring-red-200 dark:ring-red-900/40" },
  primary:  { base: "bg-[var(--primary-muted)] text-[var(--primary)] ring-1 ring-blue-200 dark:ring-blue-900/40" },
  info:     { base: "bg-[var(--info-light)] text-[var(--info)] ring-1 ring-blue-200 dark:ring-blue-900/40" },
};

export function Badge({ children, variant = "default", className }) {
  const v = variantMap[variant] || variantMap.default;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap",
      v.base,
      className
    )}>
      {children}
    </span>
  );
}
