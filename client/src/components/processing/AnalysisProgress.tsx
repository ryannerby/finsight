import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  FileText, 
  Calculator, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnalysisState = 'queued' | 'parsing' | 'computing' | 'summarizing' | 'complete' | 'error';

interface AnalysisProgressProps {
  state: AnalysisState;
  progress?: number; // 0-100, optional for indeterminate states
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

const stateConfig = {
  queued: {
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'Queued for Analysis',
    description: 'Your file is in the queue and will be processed shortly.',
    progressColor: 'bg-blue-500'
  },
  parsing: {
    icon: FileText,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Parsing Documents',
    description: 'Extracting and organizing financial data from your files.',
    progressColor: 'bg-yellow-500'
  },
  computing: {
    icon: Calculator,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: 'Computing Metrics',
    description: 'Calculating financial ratios and performance indicators.',
    progressColor: 'bg-purple-500'
  },
  summarizing: {
    icon: MessageSquare,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    title: 'Generating Summary',
    description: 'Creating your comprehensive financial analysis report.',
    progressColor: 'bg-indigo-500'
  },
  complete: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Analysis Complete',
    description: 'Your financial analysis is ready to review.',
    progressColor: 'bg-green-500'
  },
  error: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Analysis Failed',
    description: 'Something went wrong during the analysis process.',
    progressColor: 'bg-red-500'
  }
};

export function AnalysisProgress({ 
  state, 
  progress, 
  error, 
  onRetry, 
  className 
}: AnalysisProgressProps) {
  const config = stateConfig[state];
  const Icon = config.icon;
  const isComplete = state === 'complete';
  const isError = state === 'error';
  const isInProgress = !isComplete && !isError && state !== 'queued';
  const showProgress = isInProgress && progress !== undefined;

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            config.bgColor,
            config.borderColor,
            "border-2"
          )}>
            <Icon className={cn("w-8 h-8", config.color)} />
          </div>
        </div>
        <CardTitle className={cn("text-xl font-semibold", config.color)}>
          {config.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {config.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {isInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              {showProgress && (
                <span className="font-medium">{Math.round(progress)}%</span>
              )}
            </div>
            {showProgress ? (
              <Progress 
                value={progress} 
                max={100} 
                className="h-3"
                variant={state === 'parsing' ? 'warning' : state === 'computing' ? 'default' : 'success'}
              />
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className={cn("h-3 rounded-full animate-pulse", config.progressColor)} />
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge 
            variant={isError ? 'destructive' : isComplete ? 'success' : 'secondary'}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              isError && "bg-red-100 text-red-800 border-red-200",
              isComplete && "bg-green-100 text-green-800 border-green-200"
            )}
          >
            <Icon className="w-4 h-4 mr-2" />
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </Badge>
        </div>

        {/* Error Message */}
        {isError && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">Error Details:</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Retry Button */}
        {isError && onRetry && (
          <div className="flex justify-center">
            <Button 
              onClick={onRetry}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Success Message */}
        {isComplete && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-800 font-medium">
              Your analysis is ready! Scroll down to view the results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
