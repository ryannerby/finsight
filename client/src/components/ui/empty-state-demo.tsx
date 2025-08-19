import React from 'react';
import { EmptyState } from './empty-state';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export function EmptyStateDemo() {
  return (
    <div className="p-8 space-y-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Enhanced Empty States Demo</h1>
        <p className="text-muted-foreground">Showcasing contextual guidance, sample data, and actionable elements</p>
      </div>

      {/* Deals Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Deals Empty State (Full Featured)</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            variant="deals"
            title="Start your first deal analysis"
            helper="Upload financial documents to analyze deals and generate insights. Get started with our sample data or upload your own files."
            action={<Button>Create Deal</Button>}
            showSampleData={true}
            showQuickStart={true}
            showFileExamples={true}
            showTips={true}
          />
        </CardContent>
      </Card>

      {/* Saved Deals Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Deals Empty State</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            variant="saved-deals"
            title="No saved deals yet"
            helper="Deals you save will appear here for quick access and comparison. Start by browsing deals and saving the ones you want to track."
            action={<Button variant="outline">Browse Deals</Button>}
            showTips={true}
          />
        </CardContent>
      </Card>

      {/* Files Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Files Empty State</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            variant="files"
            title="No files uploaded yet"
            helper="Upload financial documents to start analyzing deals. We support CSV, Excel, and PDF formats."
            showFileExamples={true}
            showTips={true}
          />
        </CardContent>
      </Card>

      {/* Metrics Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Empty State</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            variant="metrics"
            title="No financial metrics available"
            helper="Upload financial statements to see comprehensive analysis and industry benchmarks."
            showSampleData={true}
          />
        </CardContent>
      </Card>

      {/* Analysis Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Empty State</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            variant="analysis"
            title="No analysis completed yet"
            helper="Run analysis on your uploaded files to generate financial metrics and insights."
            action={<Button>Run Analysis</Button>}
            showTips={true}
          />
        </CardContent>
      </Card>

      {/* Default Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Default Empty State</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No items found"
            helper="This is the basic empty state without additional features."
            action={<Button variant="outline">Add Item</Button>}
          />
        </CardContent>
      </Card>
    </div>
  );
}
