import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const base = [
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[var(--primary)]",
    "disabled:opacity-50 disabled:pointer-events-none",
    "active:scale-[0.97]",
    "select-none"
  ].join(' ');

  const variants = {
    primary: [
      "bg-[var(--primary)] text-white shadow-md",
      "hover:bg-[var(--primary-hover)] hover:shadow-lg hover:shadow-blue-500/25",
    ].join(' '),
    secondary: [
      "bg-white text-gray-700 border border-[var(--border)]",
      "hover:bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]",
      "dark:bg-[var(--card-elevated)] dark:text-[var(--text-primary)] dark:border-[var(--border)]",
      "dark:hover:bg-slate-700",
      "shadow-sm"
    ].join(' '),
    accent: [
      "bg-[var(--accent)] text-white shadow-md",
      "hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-green-500/25",
    ].join(' '),
    ghost: [
      "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]",
      "dark:hover:bg-slate-800 dark:text-[var(--text-secondary)]"
    ].join(' '),
    danger: [
      "bg-[var(--danger)] text-white shadow-md",
      "hover:opacity-90 hover:shadow-lg hover:shadow-red-500/25",
    ].join(' '),
    outline: [
      "border border-[var(--primary)] text-[var(--primary)] bg-transparent",
      "hover:bg-[var(--primary-muted)]",
      "dark:border-[var(--primary)] dark:text-[var(--primary)]",
    ].join(' '),
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
