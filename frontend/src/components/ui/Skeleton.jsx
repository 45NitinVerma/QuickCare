import React, { useState } from 'react';
import { cn } from './Button';

export function Skeleton({ className }) {
  return (
    <div className={cn("rounded-xl shimmer", className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 space-y-3 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-[var(--border)] last:border-0">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}
