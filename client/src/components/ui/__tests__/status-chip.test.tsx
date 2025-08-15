import { render, screen } from '@testing-library/react'
import { StatusChip } from '../status-chip'

describe('StatusChip', () => {
  it('renders with default props', () => {
    render(<StatusChip>Info</StatusChip>)
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('renders with good variant', () => {
    render(<StatusChip variant="good">Good</StatusChip>)
    const chip = screen.getByText('Good')
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveClass('bg-good', 'text-good-foreground')
  })

  it('renders with caution variant', () => {
    render(<StatusChip variant="caution">Caution</StatusChip>)
    const chip = screen.getByText('Caution')
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveClass('bg-caution', 'text-caution-foreground')
  })

  it('renders with risk variant', () => {
    render(<StatusChip variant="risk">Risk</StatusChip>)
    const chip = screen.getByText('Risk')
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveClass('bg-risk', 'text-risk-foreground')
  })

  it('renders with info variant', () => {
    render(<StatusChip variant="info">Info</StatusChip>)
    const chip = screen.getByText('Info')
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveClass('bg-info', 'text-info-foreground')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<StatusChip size="sm">Small</StatusChip>)
    expect(screen.getByText('Small')).toHaveClass('px-2', 'py-0.5', 'text-xs')

    rerender(<StatusChip size="lg">Large</StatusChip>)
    expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1', 'text-sm')
  })

  it('applies custom className', () => {
    render(<StatusChip className="custom-class">Custom</StatusChip>)
    expect(screen.getByText('Custom')).toHaveClass('custom-class')
  })

  // Enhanced accessibility tests
  it('has proper role and aria-label for accessibility', () => {
    render(<StatusChip variant="good" status="Revenue Growth">Good</StatusChip>)
    const chip = screen.getByRole('status')
    expect(chip).toHaveAttribute('aria-label')
    expect(chip.getAttribute('aria-label')).toBe('Revenue Growth: Good status')
  })

  it('includes status icon for all variants', () => {
    const { rerender } = render(<StatusChip variant="good">Good</StatusChip>)
    expect(screen.getByText('✓')).toBeInTheDocument()

    rerender(<StatusChip variant="caution">Caution</StatusChip>)
    expect(screen.getByText('⚠')).toBeInTheDocument()

    rerender(<StatusChip variant="risk">Risk</StatusChip>)
    expect(screen.getByText('✗')).toBeInTheDocument()

    rerender(<StatusChip variant="info">Info</StatusChip>)
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })

  it('has proper focus styles for keyboard navigation', () => {
    render(<StatusChip variant="good">Good</StatusChip>)
    const chip = screen.getByRole('status')
    expect(chip).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring')
  })

  it('handles empty status prop gracefully', () => {
    render(<StatusChip variant="good">Good</StatusChip>)
    const chip = screen.getByRole('status')
    expect(chip.getAttribute('aria-label')).toBe('Good: Good status')
  })

  it('applies all variant classes correctly', () => {
    const { rerender } = render(<StatusChip variant="good">Good</StatusChip>)
    let chip = screen.getByRole('status')
    expect(chip).toHaveClass('border-transparent', 'bg-good', 'text-good-foreground')

    rerender(<StatusChip variant="caution">Caution</StatusChip>)
    chip = screen.getByRole('status')
    expect(chip).toHaveClass('border-transparent', 'bg-caution', 'text-caution-foreground')

    rerender(<StatusChip variant="risk">Risk</StatusChip>)
    chip = screen.getByRole('status')
    expect(chip).toHaveClass('border-transparent', 'bg-risk', 'text-risk-foreground')

    rerender(<StatusChip variant="info">Info</StatusChip>)
    chip = screen.getByRole('status')
    expect(chip).toHaveClass('border-transparent', 'bg-info', 'text-info-foreground')
  })

  it('spreads additional props correctly', () => {
    render(<StatusChip data-testid="test-chip" onClick={() => {}}>Test</StatusChip>)
    const chip = screen.getByTestId('test-chip')
    expect(chip).toHaveAttribute('data-testid', 'test-chip')
    // React doesn't set onclick attributes, it uses event handlers
    expect(chip).toBeInTheDocument()
  })
})
