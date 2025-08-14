import React, { useEffect } from 'react'
import { StatusChip } from '@/components/ui/status-chip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { logContrastValidation } from '@/utils/contrast-checker'

export default function DesignSystem() {
  useEffect(() => {
    // Log contrast validation results to console
    logContrastValidation()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1>Finsight Design System</h1>
          <p className="text-muted-foreground text-lg">
            Design tokens, components, and UI consistency showcase
          </p>
        </div>

        {/* Status Chips Section */}
        <Card>
          <CardHeader>
            <CardTitle>Status Chips</CardTitle>
            <CardDescription>
              Semantic status indicators with WCAG AA contrast compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Status Chips */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Default Variants</h3>
              <div className="flex flex-wrap gap-3">
                <StatusChip variant="good">Good</StatusChip>
                <StatusChip variant="caution">Caution</StatusChip>
                <StatusChip variant="risk">Risk</StatusChip>
                <StatusChip variant="info">Info</StatusChip>
              </div>
            </div>

            {/* Size Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Size Variants</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <StatusChip variant="good" size="sm">Small</StatusChip>
                <StatusChip variant="caution" size="default">Default</StatusChip>
                <StatusChip variant="risk" size="lg">Large</StatusChip>
              </div>
            </div>

            {/* Context Examples */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Context Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Financial Health</span>
                    <StatusChip variant="good">Strong</StatusChip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Company shows excellent financial performance
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Risk Level</span>
                    <StatusChip variant="caution">Medium</StatusChip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Some areas require attention
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Compliance</span>
                    <StatusChip variant="risk">Critical</StatusChip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Immediate action required
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Analysis Status</span>
                    <StatusChip variant="info">Processing</StatusChip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Report generation in progress
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Tokens Section */}
        <Card>
          <CardHeader>
            <CardTitle>Color Tokens</CardTitle>
            <CardDescription>
              Semantic color palette with accessibility compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Colors */}
              <div className="space-y-3">
                <h4 className="font-semibold">Status Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-good"></div>
                    <span className="text-sm">Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-caution"></div>
                    <span className="text-sm">Caution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-risk"></div>
                    <span className="text-sm">Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-info"></div>
                    <span className="text-sm">Info</span>
                  </div>
                </div>
              </div>

              {/* Core Colors */}
              <div className="space-y-3">
                <h4 className="font-semibold">Core Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                    <span className="text-sm">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary"></div>
                    <span className="text-sm">Secondary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted"></div>
                    <span className="text-sm">Muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-border"></div>
                    <span className="text-sm">Border</span>
                  </div>
                </div>
              </div>

              {/* Surface Colors */}
              <div className="space-y-3">
                <h4 className="font-semibold">Surface Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-background border"></div>
                    <span className="text-sm">Background</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-card border"></div>
                    <span className="text-sm">Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-popover border"></div>
                    <span className="text-sm">Popover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-surface border"></div>
                    <span className="text-sm">Surface</span>
                  </div>
                </div>
              </div>

              {/* Text Colors */}
              <div className="space-y-3">
                <h4 className="font-semibold">Text Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-foreground"></div>
                    <span className="text-sm">Foreground</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted-foreground"></div>
                    <span className="text-sm">Muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-card-foreground"></div>
                    <span className="text-sm">Card Text</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-popover-foreground"></div>
                    <span className="text-sm">Popover Text</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle>Typography Scale</CardTitle>
            <CardDescription>
              Consistent text hierarchy and spacing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h1>Heading 1 - Main Title</h1>
              <h2>Heading 2 - Section Title</h2>
              <h3>Heading 3 - Subsection</h3>
              <h4>Heading 4 - Card Title</h4>
              <h5>Heading 5 - Small Title</h5>
              <h6>Heading 6 - Label</h6>
            </div>
            
            <div className="space-y-2">
              <p>This is a regular paragraph with body text styling. It provides good readability and appropriate line height for comfortable reading.</p>
              <small>This is small text, typically used for captions, metadata, or secondary information.</small>
            </div>
          </CardContent>
        </Card>

        {/* Spacing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Spacing System</CardTitle>
            <CardDescription>
              Consistent spacing utilities and patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4>Section Spacing</h4>
                <div className="space-y-4">
                  <div className="p-4 border rounded bg-card">
                    <p className="text-sm">Section 1 with consistent spacing</p>
                  </div>
                  <div className="p-4 border rounded bg-card">
                    <p className="text-sm">Section 2 with consistent spacing</p>
                  </div>
                  <div className="p-4 border rounded bg-card">
                    <p className="text-sm">Section 3 with consistent spacing</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4>Utility Classes</h4>
                <div className="flex gap-4">
                  <div className="section-y section-x border rounded bg-card">
                    <p className="text-sm">section-y + section-x</p>
                  </div>
                  <div className="container-padding border rounded bg-card">
                    <p className="text-sm">container-padding</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Section */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Compliance</CardTitle>
            <CardDescription>
              WCAG AA contrast ratios and focus states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-good rounded-lg">
                  <h4 className="text-good-foreground font-semibold mb-2">Good Status</h4>
                  <p className="text-good-foreground text-sm">
                    White text on green background - 4.5:1 contrast ratio ✓
                  </p>
                </div>
                
                <div className="p-4 bg-caution rounded-lg">
                  <h4 className="text-caution-foreground font-semibold mb-2">Caution Status</h4>
                  <p className="text-caution-foreground text-sm">
                    Black text on amber background - 4.5:1 contrast ratio ✓
                  </p>
                </div>
                
                <div className="p-4 bg-risk rounded-lg">
                  <h4 className="text-risk-foreground font-semibold mb-2">Risk Status</h4>
                  <p className="text-risk-foreground text-sm">
                    White text on red background - 4.5:1 contrast ratio ✓
                  </p>
                </div>
                
                <div className="p-4 bg-info rounded-lg">
                  <h4 className="text-info-foreground font-semibold mb-2">Info Status</h4>
                  <p className="text-info-foreground text-sm">
                    Black text on sky background - 4.5:1 contrast ratio ✓
                  </p>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Focus States</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  All interactive elements have visible focus indicators
                </p>
                <div className="flex gap-3">
                  <Button>Primary Button</Button>
                  <Button variant="outline">Secondary Button</Button>
                  <StatusChip variant="info">Focusable Chip</StatusChip>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
