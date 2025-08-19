# Enhanced Empty States Component

The `EmptyState` component has been significantly enhanced to provide contextual guidance, sample data previews, and actionable elements for first-time users.

## Features

### 🎯 Contextual Variants
- **`deals`** - For deal analysis pages with sample deal cards
- **`saved-deals`** - For saved deals with bookmark icon
- **`analysis`** - For analysis pages with calculator icon
- **`files`** - For file upload pages with document icon
- **`metrics`** - For metrics pages with trending chart icon
- **`default`** - Generic empty state with document icon

### 📊 Sample Data Previews
- **Sample Deal Cards** - Shows what a deal analysis looks like
- **Sample Metrics** - Displays example financial ratios
- **File Examples** - Lists supported file formats with icons

### 🚀 Quick Start Templates
- **Growth Company Analysis** - Perfect for SaaS and tech companies
- **Manufacturing Deep Dive** - Ideal for industrial businesses
- Customizable templates with relevant icons and descriptions

### 💡 Pro Tips
- **Upload multiple files** - Combine P&L, balance sheet, and cash flow
- **Use consistent formats** - Ensure clear headers and data structure
- **Include multiple periods** - Historical data for trend analysis

### 📁 File Format Support
- CSV files (sample_pnl.csv, sample_cf.csv)
- Excel files (sample_bs.xlsx)
- PDF documents
- Clear format indicators with badges

## Usage Examples

### Basic Empty State
```tsx
<EmptyState
  title="No items found"
  helper="This is a basic empty state."
  action={<Button>Add Item</Button>}
/>
```

### Full-Featured Deals Empty State
```tsx
<EmptyState
  variant="deals"
  title="Start your first deal analysis"
  helper="Upload financial documents to analyze deals and generate insights."
  action={<Button>Create Deal</Button>}
  showSampleData={true}
  showQuickStart={true}
  showFileExamples={true}
  showTips={true}
/>
```

### Files Empty State with Guidance
```tsx
<EmptyState
  variant="files"
  title="No files uploaded yet"
  helper="Upload financial documents to start analyzing deals."
  showFileExamples={true}
  showTips={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Main heading text |
| `helper` | `string` | - | Descriptive text below title |
| `action` | `ReactNode` | - | Primary action button/component |
| `variant` | `string` | `"default"` | Context-specific variant |
| `showSampleData` | `boolean` | `false` | Show sample data previews |
| `showQuickStart` | `boolean` | `false` | Show quick start templates |
| `showFileExamples` | `boolean` | `false` | Show supported file formats |
| `showTips` | `boolean` | `false` | Show helpful tips for users |

## Implementation Details

### Icons
- Uses Lucide React icons for consistency
- Context-specific icons for each variant
- Fallback to generic document icon for default

### Sample Data
- **Deal Cards**: Interactive preview with hover effects
- **Metrics**: Visual representation of financial ratios
- **File Examples**: Clear format indicators with badges

### Quick Start Templates
- Button-based templates with descriptive text
- Industry-specific guidance
- Visual hierarchy with icons and descriptions

### Tips Section
- Lightbulb icons for visual appeal
- Actionable advice for first-time users
- Structured format for easy scanning

## Benefits

1. **Reduced User Abandonment** - Clear guidance on next steps
2. **Improved Onboarding** - Sample data shows expected outcomes
3. **Contextual Help** - Relevant tips based on current page
4. **Professional Appearance** - Polished, branded empty states
5. **Actionable Elements** - Clear calls-to-action for users

## Future Enhancements

- **Interactive Tutorials** - Step-by-step guided tours
- **Dynamic Content** - Personalized tips based on user behavior
- **Progress Indicators** - Show completion status for multi-step processes
- **A/B Testing** - Different empty state variations for optimization
