# Processing UX Components

This directory contains components for improving the user experience during analysis processing, including progress indicators, skeleton loading states, and error handling.

## Components

### AnalysisProgress

A comprehensive progress component that shows different states of analysis with visual feedback.

**Features:**
- 6 analysis states: queued, parsing, computing, summarizing, complete, error
- Determinate progress bar when server provides percentage
- Indeterminate progress for states without specific progress
- Color-coded states with appropriate icons
- Error handling with retry functionality
- Success completion message

**Usage:**
```tsx
import { AnalysisProgress, type AnalysisState } from '@/components/processing';

<AnalysisProgress
  state="parsing"
  progress={45}
  error={null}
  onRetry={handleRetry}
  className="mb-6"
/>
```

**Props:**
- `state`: AnalysisState - Current analysis state
- `progress?`: number - Progress percentage (0-100)
- `error?`: string | null - Error message if state is 'error'
- `onRetry?`: () => void - Retry function for error state
- `className?`: string - Additional CSS classes

### Analysis States

1. **queued** - File is in queue, waiting to be processed
2. **parsing** - Extracting and organizing financial data
3. **computing** - Calculating financial ratios and metrics
4. **summarizing** - Generating comprehensive analysis report
5. **complete** - Analysis finished successfully
6. **error** - Analysis failed with error details

## Skeleton Components

Located in `../skeletons/` directory:

- **ResultsHeaderSkeleton** - Loading placeholder for results header
- **CardSkeleton** - Generic card loading state
- **MetricCardSkeleton** - Specialized metric card loading
- **TableRowSkeleton** - Table row loading state
- **ListItemSkeleton** - List item loading state

## Error Handling

### ErrorBanner

A user-friendly error display component with retry functionality.

**Usage:**
```tsx
import { ErrorBanner } from '@/components/ui/error-banner';

<ErrorBanner
  error="Failed to connect to server"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
  variant="destructive"
/>
```

**Variants:**
- `default` - Blue theme for informational errors
- `destructive` - Red theme for critical errors
- `warning` - Yellow theme for warnings

## Integration

These components are integrated into the main DealDetail page to provide:

1. **Clear Progress Indication** - Users always see what's happening
2. **Reduced Perceived Latency** - Skeleton loading states show content structure
3. **Friendly Error Handling** - One-click retry for failed operations
4. **State Consistency** - Progress and loading states are synchronized

## Implementation Notes

- Progress simulation is currently client-side for demonstration
- In production, integrate with server-side progress tracking
- Skeleton components match the actual content layout
- Error states provide actionable feedback with retry options
- All components are fully responsive and accessible
