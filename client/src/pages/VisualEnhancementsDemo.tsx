import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton, MetricCardSkeleton, TableRowSkeleton, ChartSkeleton } from '@/components/ui/skeleton';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { useToastHelpers } from '@/hooks/useToast';
import { MetricCard } from '@/components/ui/metric-card';

export default function VisualEnhancementsDemo() {
  const [loading, setLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const { success, error, warning, info } = useToastHelpers();

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'Please review your input before proceeding.',
      info: 'Here is some helpful information.'
    };

    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };

    if (type === 'success') success(messages.success, titles.success);
    else if (type === 'error') error(messages.error, titles.error);
    else if (type === 'warning') warning(messages.warning, titles.warning);
    else info(messages.info, titles.info);
  };

  const toggleLoading = () => {
    setLoading(!loading);
  };

  const toggleSkeletons = () => {
    setShowSkeletons(!showSkeletons);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            Visual Enhancements Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Showcasing enhanced visual feedback and micro-interactions
          </p>
        </div>

        {/* Toast Demonstrations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
            <CardDescription>
              Interactive toast notifications with smooth animations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleShowToast('success')} variant="default">
                Show Success Toast
              </Button>
              <Button onClick={() => handleShowToast('error')} variant="destructive">
                Show Error Toast
              </Button>
              <Button onClick={() => handleShowToast('warning')} variant="outline">
                Show Warning Toast
              </Button>
              <Button onClick={() => handleShowToast('info')} variant="secondary">
                Show Info Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Buttons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enhanced Buttons</CardTitle>
            <CardDescription>
              Buttons with improved hover effects and active states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Cards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enhanced Cards</CardTitle>
            <CardDescription>
              Cards with subtle hover effects and smooth transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hoverable className="transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg">Interactive Card 1</CardTitle>
                  <CardDescription>Hover over me to see subtle effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card has refined hover effects including shadow and border changes.
                  </p>
                </CardContent>
              </Card>

              <Card hoverable className="transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg">Interactive Card 2</CardTitle>
                  <CardDescription>Try hovering here too</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Smooth transitions make interactions feel polished and responsive.
                  </p>
                </CardContent>
              </Card>

              <Card hoverable className="transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg">Interactive Card 3</CardTitle>
                  <CardDescription>Professional interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Micro-interactions improve user experience without being distracting.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Inputs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enhanced Inputs</CardTitle>
            <CardDescription>
              Input fields with focus animations and hover effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input placeholder="Enter your email" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input placeholder="Enter your full name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Input placeholder="Enter company name" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Loading States & Skeletons</CardTitle>
            <CardDescription>
              Skeleton loading animations and loading states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Button onClick={toggleLoading} variant="outline">
                  {loading ? 'Stop Loading' : 'Start Loading'}
                </Button>
                <Button onClick={toggleSkeletons} variant="outline">
                  {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
                </Button>
              </div>

              {showSkeletons && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Basic Skeletons</h4>
                    <div className="space-y-2">
                      <Skeleton variant="text" lines={3} />
                      <Skeleton variant="circular" height="h-12" width="w-12" />
                      <Skeleton variant="rectangular" height="h-8" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Metric Card Skeleton</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MetricCardSkeleton />
                      <MetricCardSkeleton />
                      <MetricCardSkeleton />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Table Row Skeleton</h4>
                    <div className="space-y-2">
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Chart Skeleton</h4>
                    <ChartSkeleton />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced File Dropzone */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enhanced File Dropzone</CardTitle>
            <CardDescription>
              File upload area with hover effects and loading states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileDropzone
              onFilesSelected={(files) => console.log('Files selected:', files)}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Enhanced Metric Cards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enhanced Metric Cards</CardTitle>
            <CardDescription>
              Metric cards with hover effects and loading states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Revenue Growth"
                value={loading ? null : "12.5%"}
                status="good"
                loading={loading}
                hoverable={true}
              />
              <MetricCard
                label="Profit Margin"
                value={loading ? null : "8.2%"}
                status="warning"
                loading={loading}
                hoverable={true}
              />
              <MetricCard
                label="Customer Satisfaction"
                value={loading ? null : "94%"}
                status="good"
                loading={loading}
                hoverable={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Animation Showcase */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Animation Showcase</CardTitle>
            <CardDescription>
              Various subtle animation classes and effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center animate-bounce-in">
                <p className="text-sm font-medium">Bounce In</p>
              </div>
              <div className="p-4 border rounded-lg text-center animate-fade-in">
                <p className="text-sm font-medium">Fade In</p>
              </div>
              <div className="p-4 border rounded-lg text-center animate-slide-in-right">
                <p className="text-sm font-medium">Slide In</p>
              </div>
              <div className="p-4 border rounded-lg text-center bg-muted animate-shimmer">
                <p className="text-sm font-medium">Shimmer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
