import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
  showHeader?: boolean;
  lines?: number;
  headerLines?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export function CardSkeleton({ 
  className, 
  showHeader = true, 
  lines = 3, 
  headerLines = 2,
  showAvatar = false,
  showActions = false
}: CardSkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader className="space-y-3">
          {showAvatar && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted/20 rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                {Array.from({ length: headerLines }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-3 bg-muted/20 rounded animate-pulse",
                      i === 0 ? "w-3/4" : "w-1/2"
                    )} 
                  />
                ))}
              </div>
            </div>
          )}
          {!showAvatar && (
            <div className="space-y-2">
              {Array.from({ length: headerLines }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-3 bg-muted/20 rounded animate-pulse",
                    i === 0 ? "w-3/4" : "w-1/2"
                  )} 
                />
              ))}
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-3 bg-muted/20 rounded animate-pulse",
              i === 0 ? "w-full" : i === 1 ? "w-5/6" : "w-4/6"
            )} 
          />
        ))}
        
        {showActions && (
          <div className="flex space-x-2 pt-2">
            <div className="h-8 bg-muted/20 rounded animate-pulse w-20" />
            <div className="h-8 bg-muted/20 rounded animate-pulse w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized skeleton variants
export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6 text-center space-y-3">
        <div className="h-8 bg-muted/20 rounded animate-pulse w-16 mx-auto" />
        <div className="h-4 bg-muted/20 rounded animate-pulse w-24 mx-auto" />
        <div className="h-6 bg-muted/20 rounded animate-pulse w-20 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-4 py-3", className)}>
      <div className="h-4 bg-muted/20 rounded animate-pulse w-32" />
      <div className="h-4 bg-muted/20 rounded animate-pulse w-24" />
      <div className="h-4 bg-muted/20 rounded animate-pulse w-20" />
      <div className="h-4 bg-muted/20 rounded animate-pulse w-16" />
      <div className="h-4 bg-muted/20 rounded animate-pulse w-12" />
    </div>
  );
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-3 py-2", className)}>
      <div className="w-8 h-8 bg-muted/20 rounded animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-muted/20 rounded animate-pulse w-3/4" />
        <div className="h-2 bg-muted/20 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
