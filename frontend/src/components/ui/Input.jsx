import React, { forwardRef } from 'react';
import { cn } from './Button';

export const Input = forwardRef(({ className, type = "text", error, label, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl px-3 py-2 text-sm",
          "bg-white dark:bg-[#1E293B]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "border border-[var(--border)]",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-0",
          "focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-muted)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[var(--danger)] focus:ring-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1 animate-fade-up">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
