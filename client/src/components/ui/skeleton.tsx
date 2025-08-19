import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  lines?: number;
  height?: string;
  width?: string;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  lines = 1, 
  height, 
  width 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded';
  
  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              height || 'h-4',
              width || (i === lines - 1 ? 'w-3/4' : 'w-full'),
              className
            )}
          />
        ))}
      </div>
    );
  }
  
  if (variant === 'circular') {
    return (
      <div
        className={cn(
          baseClasses,
          height || 'h-12',
          width || 'w-12',
          'rounded-full',
          className
        )}
      />
    );
  }
  
  if (variant === 'card') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className={cn(baseClasses, 'h-4 w-3/4')} />
        <div className={cn(baseClasses, 'h-4 w-full')} />
        <div className={cn(baseClasses, 'h-4 w-2/3')} />
        <div className={cn(baseClasses, 'h-4 w-4/5')} />
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        baseClasses,
        height || 'h-4',
        width || 'w-full',
        className
      )}
    />
  );
}

// Specialized skeleton components for common use cases
export function MetricCardSkeleton() {
  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="space-y-4">
        <Skeleton variant="text" lines={1} height="h-4" width="w-1/3" />
        <Skeleton variant="text" lines={1} height="h-8" width="w-1/2" />
        <Skeleton variant="text" lines={1} height="h-3" width="w-2/3" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4">
      <Skeleton variant="circular" height="h-10" width="w-10" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" lines={1} height="h-4" width="w-1/4" />
        <Skeleton variant="text" lines={1} height="h-3" width="w-1/3" />
      </div>
      <Skeleton variant="text" lines={1} height="h-4" width="w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="space-y-4">
        <Skeleton variant="text" lines={1} height="h-6" width="w-1/3" />
        <div className="h-64 bg-muted rounded animate-pulse">
          <div className="h-full w-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
        </div>
        <div className="flex justify-between">
          <Skeleton variant="text" lines={1} height="h-3" width="w-16" />
          <Skeleton variant="text" lines={1} height="h-3" width="w-16" />
        </div>
      </div>
    </div>
  );
}
