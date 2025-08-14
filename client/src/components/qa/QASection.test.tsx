import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QASection } from './QASection';

// Mock the EvidenceDrawer component
jest.mock('@/components/results/EvidenceDrawer', () => ({
  EvidenceDrawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('QASection', () => {
  const mockOnOpenEvidenceDrawer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Q&A section with header', () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    expect(screen.getByText('Financial Q&A')).toBeInTheDocument();
    expect(screen.getByText('Ask questions about your financial data and get AI-powered insights')).toBeInTheDocument();
  });

  it('displays example questions for onboarding', () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    expect(screen.getByText('How have gross margins trended over the last 3 years?')).toBeInTheDocument();
    expect(screen.getByText('What is the working capital cycle and how has it changed?')).toBeInTheDocument();
  });

  it('shows empty state when no questions have been asked', () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    expect(screen.getByText('Start asking questions')).toBeInTheDocument();
    expect(screen.getByText('Try asking about trends, ratios, or specific financial metrics to get AI-powered insights.')).toBeInTheDocument();
  });

  it('allows typing and submitting questions', async () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    const input = screen.getByPlaceholderText('Ask a question about your financial data...');
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    // Type a question
    fireEvent.change(input, { target: { value: 'How are margins trending?' } });
    
    // Submit the question
    fireEvent.click(submitButton);
    
    // Wait for the question to appear in history
    await waitFor(() => {
      expect(screen.getByText('How are margins trending?')).toBeInTheDocument();
    });
  });

  it('shows history sidebar with collapsible functionality', () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    expect(screen.getByText('History')).toBeInTheDocument();
    
    // History should be open by default
    expect(screen.getByText('No questions yet')).toBeInTheDocument();
  });

  it('allows clicking example questions to populate input', () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    const exampleQuestion = screen.getByText('How have gross margins trended over the last 3 years?');
    fireEvent.click(exampleQuestion);
    
    const input = screen.getByPlaceholderText('Ask a question about your financial data...');
    expect(input).toHaveValue('How have gross margins trended over the last 3 years?');
  });

  it('supports keyboard shortcuts for submission', async () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    const input = screen.getByPlaceholderText('Ask a question about your financial data...');
    
    // Type and press Enter
    fireEvent.change(input, { target: { value: 'What is the cash flow?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Wait for the question to appear
    await waitFor(() => {
      expect(screen.getByText('What is the cash flow?')).toBeInTheDocument();
    });
  });

  it('shows streaming state when processing questions', async () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    const input = screen.getByPlaceholderText('Ask a question about your financial data...');
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);
    
    // Should show streaming indicator
    await waitFor(() => {
      expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();
    });
  });

  it('displays completed questions with sources and actions', async () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    const input = screen.getByPlaceholderText('Ask a question about your financial data...');
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('calls onOpenEvidenceDrawer when source chips are clicked', async () => {
    render(<QASection onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
    
    const input = screen.getByPlaceholderText('Ask a question about your financial data...');
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);
    
    // Wait for completion and sources to appear
    await waitFor(() => {
      expect(screen.getByText('Sources used:')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Click on a source chip
    const sourceChip = screen.getByText('Financial Statements 2023');
    fireEvent.click(sourceChip);
    
    expect(mockOnOpenEvidenceDrawer).toHaveBeenCalled();
  });
});
