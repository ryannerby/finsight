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
})
