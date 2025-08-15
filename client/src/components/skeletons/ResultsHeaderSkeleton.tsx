import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResultsHeaderSkeletonProps {
  className?: string;
}

export function ResultsHeaderSkeleton({ className }: ResultsHeaderSkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="text-center space-y-4">
        {/* Health Score Ring Skeleton */}
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full bg-muted/20 animate-pulse" />
        </div>
        
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-muted/20 rounded animate-pulse mx-auto w-64" />
          <div className="h-4 bg-muted/20 rounded animate-pulse mx-auto w-96" />
        </div>
        
        {/* Recommendation Badge Skeleton */}
        <div className="flex justify-center">
          <div className="h-10 bg-muted/20 rounded-full animate-pulse w-32" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Top Highlights Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-muted/20 rounded animate-pulse w-24" />
              <div className="h-3 bg-muted/20 rounded animate-pulse w-full" />
              <div className="h-3 bg-muted/20 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-muted/20 rounded animate-pulse w-16" />
            </div>
          ))}
        </div>
        
        {/* Summary Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-8 bg-muted/20 rounded animate-pulse w-16 mx-auto" />
              <div className="h-3 bg-muted/20 rounded animate-pulse w-20 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
