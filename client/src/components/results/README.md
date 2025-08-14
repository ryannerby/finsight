# EvidenceDrawer Component

## Overview

The `EvidenceDrawer` component provides a fully accessible, responsive interface for displaying supporting evidence for financial metrics and insights. It automatically adapts between a bottom sheet drawer on mobile devices and a modal dialog on desktop.

## Features

### 🎯 Core Functionality
- **Responsive Design**: Automatically switches between Drawer (mobile) and Dialog (desktop)
- **Full Accessibility**: ARIA labels, keyboard navigation, focus management
- **Evidence Display**: Shows excerpts, source documents, confidence scores, and metadata
- **Cross-Panel Integration**: Works seamlessly with HealthPanel and InsightsPanel

### ♿ Accessibility Features
- **Keyboard Navigation**: Full Tab, Enter, and Escape key support
- **Focus Management**: Automatic focus trapping and restoration
- **ARIA Labels**: Proper labeling for screen readers
- **Screen Reader Support**: Semantic HTML structure with proper roles

### 📱 Responsive Behavior
- **Mobile (< 768px)**: Bottom sheet drawer with swipe gestures
- **Desktop (≥ 768px)**: Centered modal dialog
- **Adaptive Layout**: Content automatically adjusts to viewport size

## Usage

### Basic Implementation

```tsx
import { EvidenceDrawer } from '@/components/results/EvidenceDrawer';

function MyComponent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [evidenceItems, setEvidenceItems] = useState([]);

  return (
    <EvidenceDrawer
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      items={evidenceItems}
      title="Supporting Evidence"
    />
  );
}
```

### Integration with HealthPanel

The HealthPanel automatically integrates with EvidenceDrawer when evidence is available:

```tsx
// Evidence buttons automatically open the drawer
{metric.evidence && metric.evidence.length > 0 && (
  <Button onClick={() => handleOpenEvidence(metric.evidence, metric.label)}>
    <Info className="w-3 h-3 mr-1" />
    Evidence
  </Button>
)}
```

### Integration with InsightsPanel

The InsightsPanel provides evidence viewing for strengths and risks:

```tsx
// View Evidence buttons open the drawer with relevant evidence
<Button onClick={() => handleViewEvidence(item)}>
  <Eye className="w-4 h-4 mr-1" />
  View Evidence
</Button>
```

## Props

### EvidenceDrawerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls drawer/dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `items` | `EvidenceDrawerItem[]` | - | Array of evidence items to display |
| `title` | `string` | "Supporting Evidence" | Title displayed in header |
| `className` | `string` | - | Additional CSS classes |

### EvidenceDrawerItem

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the evidence item |
| `excerpt` | `string` | Text excerpt or context from the source |
| `metricId` | `string` | Associated metric identifier |
| `sourceDocName` | `string` | Name of the source document |
| `page` | `number?` | Page number in the source document |
| `row` | `number?` | Row number in the source document |
| `link` | `string?` | URL to open document in viewer |
| `confidence` | `number` | Confidence score (0-1) |
| `type` | `string` | Type of evidence (e.g., 'financial_data') |
| `documentId` | `string?` | Source document identifier |
| `extractedAt` | `string?` | ISO timestamp of extraction |
| `extractedBy` | `string?` | Name of extraction system/user |

## Data Transformation

### From Evidence Schema

The component automatically transforms the shared `Evidence` type to `EvidenceDrawerItem`:

```tsx
const transformEvidenceForDrawer = (evidence: Evidence[], metricLabel: string) => {
  return evidence.map((item, idx) => ({
    id: item.ref || `evidence-${idx}`,
    excerpt: item.context || item.quote || `Evidence from ${item.type}`,
    metricId: item.ref,
    sourceDocName: item.document_id || 'Unknown Document',
    page: item.page,
    confidence: item.confidence,
    type: item.type,
    // ... other properties
  }));
};
```

## Styling

### CSS Classes

The component uses Tailwind CSS classes and follows the Finsight design system:

- **Header**: `border-b pb-3` for clean separation
- **Evidence Items**: `bg-card hover:bg-accent/5` for interactive feedback
- **Confidence Badges**: Dynamic colors based on confidence levels
- **Responsive Layout**: `max-h-[calc(100vh-200px)]` for proper scrolling

### Customization

You can override styles using the `className` prop:

```tsx
<EvidenceDrawer
  className="custom-evidence-drawer"
  // ... other props
/>
```

## Testing

### Demo Page

A dedicated demo page is available at `/evidence-demo` for testing:

- Sample evidence data with various confidence levels
- Responsive behavior testing
- Accessibility validation
- Keyboard navigation testing

### Testing Checklist

- [ ] Opens/closes with button clicks
- [ ] Responds to Escape key
- [ ] Focus management works correctly
- [ ] Mobile vs desktop behavior
- [ ] Screen reader compatibility
- [ ] ARIA labels are present
- [ ] Content scrolling works

## Future Enhancements

### Document Viewer Integration
- Enhanced "Open in viewer" functionality
- Direct navigation to specific pages/rows
- Highlighted evidence in document context

### Advanced Filtering
- Filter by confidence level
- Filter by document type
- Search within evidence excerpts

### Export Features
- Export evidence as PDF
- Include evidence in reports
- Evidence summary generation

## Dependencies

- `@/components/ui/drawer` - Mobile drawer implementation
- `@/components/ui/dialog` - Desktop modal implementation
- `@/hooks/useMediaQuery` - Responsive behavior detection
- `lucide-react` - Icon components
- `@/lib/utils` - Utility functions (cn)

## Related Components

- **HealthPanel**: Displays financial health metrics with evidence
- **InsightsPanel**: Shows strengths and risks with evidence
- **EvidencePopover**: Legacy popover component (being replaced)
- **StatusChip**: Status indicators for metrics
