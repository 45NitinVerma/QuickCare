import React from 'react';
import { cn } from './Button';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-[var(--card)] rounded-2xl border border-[var(--border)]",
        "shadow-[var(--shadow-sm)] transition-shadow duration-300",
        "hover:shadow-[var(--shadow-md)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-[var(--border)]",
        "flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-[var(--text-primary)] tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
