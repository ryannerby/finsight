# Finsight Design System

This directory contains the design tokens and styling foundation for the Finsight application.

## Files

- `globals.css` - Main design tokens, CSS variables, and utility classes
- `README.md` - This documentation file

## Design Tokens

### Color Palette

#### Core Colors
- `--primary`: Brand primary color (#062650)
- `--secondary`: Brand secondary color (#7495B5)
- `--muted`: Muted/secondary color
- `--card`: Card background color
- `--border`: Border color

#### Status Colors (WCAG AA Compliant)
- `--good`: Green-600 for positive status (4.5:1 contrast)
- `--caution`: Amber-500 for warning status (4.5:1 contrast)
- `--risk`: Red-500 for critical status (4.5:1 contrast)
- `--info`: Sky-400 for informational status (4.5:1 contrast)

### Typography Scale

- `h1`: 24px, bold, tight tracking
- `h2`: 18px, semibold, tight tracking
- `h3`: 16px, semibold, tight tracking
- `h4`: 14px, semibold, tight tracking
- `h5`: 12px, medium weight
- `h6`: 12px, medium weight
- `p`: 16px, relaxed line height
- `small`: 14px, relaxed line height

### Spacing System

- `section-y`: 1.5rem vertical padding
- `section-x`: 1.5rem horizontal padding
- `container-padding`: Responsive horizontal padding

## Usage

### CSS Variables

All colors are available as CSS custom properties:

```css
.my-element {
  background-color: hsl(var(--good));
  color: hsl(var(--good-foreground));
}
```

### Tailwind Classes

The design tokens are integrated with Tailwind CSS:

```tsx
<div className="bg-good text-good-foreground">
  Good status content
</div>
```

### StatusChip Component

Use the StatusChip component for consistent status indicators:

```tsx
import { StatusChip } from '@/components/ui/status-chip'

<StatusChip variant="good">Strong</StatusChip>
<StatusChip variant="caution">Medium</StatusChip>
<StatusChip variant="risk">Critical</StatusChip>
<StatusChip variant="info">Processing</StatusChip>
```

## Accessibility

All color combinations meet WCAG AA contrast requirements (4.5:1 ratio) for normal text and 3:1 for large text.

## Dark Mode Support

The design system includes dark mode variants that maintain accessibility standards while providing appropriate contrast in low-light environments.

## Testing

Visit `/design-system` route to see all components and tokens in action.
