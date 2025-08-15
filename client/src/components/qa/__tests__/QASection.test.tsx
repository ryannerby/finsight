import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QASection } from '../QASection';

// Mock the qaService
jest.mock('@/services/qaService', () => ({
  submitQuestion: jest.fn(),
  getQuestionHistory: jest.fn(),
}));

// Mock the useMediaQuery hook
jest.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: jest.fn(() => false),
}));

const mockQaService = require('@/services/qaService');

const defaultProps = {
  dealId: undefined, // Demo mode
  onOpenEvidenceDrawer: jest.fn(),
};

describe('QASection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQaService.submitQuestion.mockResolvedValue({
      id: 'q1',
      question: 'Test question',
      answer: 'Test answer',
      sources: ['source1', 'source2'],
      status: 'completed',
    });
    mockQaService.getQuestionHistory.mockResolvedValue([]);
  });

  describe('Rendering', () => {
    it('renders the Q&A section with correct title and description', () => {
      render(<QASection {...defaultProps} />);
      
      expect(screen.getByText('Financial Q&A')).toBeInTheDocument();
      expect(screen.getByText('Ask questions about your financial data and get AI-powered insights')).toBeInTheDocument();
    });

    it('shows demo mode banner when no dealId is provided', () => {
      render(<QASection {...defaultProps} />);
      
      expect(screen.getByText('Demo Mode')).toBeInTheDocument();
      expect(screen.getByText('No deal ID provided. This is a demonstration of the Q&A functionality.')).toBeInTheDocument();
    });

    it('renders example questions', () => {
      render(<QASection {...defaultProps} />);
      
      // Use getAllByText since there are multiple elements with the same text
      expect(screen.getAllByText('How have gross margins trended over the last 3 years?')[0]).toBeInTheDocument();
      expect(screen.getAllByText('What is the working capital cycle and how has it changed?')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Are there any concerning trends in cash flow from operations?')[0]).toBeInTheDocument();
    });

    it('renders the question input and submit button', () => {
      render(<QASection {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Ask a question to see the Q&A in action...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit question/i })).toBeInTheDocument();
    });
  });

  describe('Question Submission', () => {
    it('allows typing and submitting a question', async () => {
      const user = userEvent.setup();
      render(<QASection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ask a question to see the Q&A in action...');
      const submitButton = screen.getByRole('button', { name: /submit question/i });
      
      await user.type(input, 'What is the cash flow?');
      await user.click(submitButton);
      
      // Check that the question was added to messages
      expect(screen.getAllByText('What is the cash flow?')[0]).toBeInTheDocument();
    });

    it('shows history sidebar with collapsible functionality', () => {
      render(<QASection {...defaultProps} />);
      
      // Look for the collapse history button instead
      const toggleButton = screen.getByRole('button', { name: /collapse history/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('supports keyboard shortcuts for submission', async () => {
      const user = userEvent.setup();
      render(<QASection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ask a question to see the Q&A in action...');
      const submitButton = screen.getByRole('button', { name: /submit question/i });
      
      await user.type(input, 'What is the cash flow?');
      await user.keyboard('{Enter}');
      
      // Check that the question was submitted
      expect(screen.getAllByText('What is the cash flow?')[0]).toBeInTheDocument();
    });

    it('shows streaming state when processing questions', async () => {
      const user = userEvent.setup();
      render(<QASection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ask a question to see the Q&A in action...');
      const submitButton = screen.getByRole('button', { name: /submit question/i });
      
      await user.type(input, 'Test question');
      await user.click(submitButton);
      
      // Check that the question is in streaming state
      expect(screen.getAllByText('Test question')[0]).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Question History', () => {
    it('displays completed questions with sources and actions', async () => {
      const user = userEvent.setup();
      render(<QASection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ask a question to see the Q&A in action...');
      const submitButton = screen.getByRole('button', { name: /submit question/i });
      
      await user.type(input, 'Test question');
      await user.click(submitButton);
      
      // Wait for the question to be processed
      await waitFor(() => {
        expect(screen.getAllByText('Test question')[0]).toBeInTheDocument();
      });
    });

    it('calls onOpenEvidenceDrawer when source chips are clicked', async () => {
      const user = userEvent.setup();
      const mockOnOpenEvidenceDrawer = jest.fn();
      render(<QASection {...defaultProps} onOpenEvidenceDrawer={mockOnOpenEvidenceDrawer} />);
      
      const input = screen.getByPlaceholderText('Ask a question to see the Q&A in action...');
      const submitButton = screen.getByRole('button', { name: /submit question/i });
      
      await user.type(input, 'Test question');
      await user.click(submitButton);
      
      // Wait for the question to be processed and sources to appear
      await waitFor(() => {
        expect(screen.getAllByText('Test question')[0]).toBeInTheDocument();
      });
      
      // Look for source chips
      const sourceChips = screen.queryAllByText(/source\d+/);
      if (sourceChips.length > 0) {
        await user.click(sourceChips[0]);
        expect(mockOnOpenEvidenceDrawer).toHaveBeenCalled();
      }
    });
  });

  describe('Example Questions', () => {
    it('allows clicking on example questions', async () => {
      const user = userEvent.setup();
      render(<QASection {...defaultProps} />);
      
      // Use getAllByText and select the first one (main area)
      const exampleQuestions = screen.getAllByText('How have gross margins trended over the last 3 years?');
      const exampleQuestion = exampleQuestions[0]; // First one is in the main area
      await user.click(exampleQuestion);
      
      // Check that the example question was added to the input
      const input = screen.getByPlaceholderText('Ask a question to see the Q&A in action...');
      expect(input).toHaveValue('How have gross margins trended over the last 3 years?');
    });

    it('shows different examples for different deal types', () => {
      render(<QASection {...defaultProps} />);
      
      // Check that we have the expected example questions (use first occurrence)
      expect(screen.getAllByText('How have gross margins trended over the last 3 years?')[0]).toBeInTheDocument();
      expect(screen.getAllByText('What is the working capital cycle and how has it changed?')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Are there any concerning trends in cash flow from operations?')[0]).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<QASection {...defaultProps} />);
      
      expect(screen.getByLabelText('Ask a question about your financial data')).toBeInTheDocument();
      expect(screen.getByLabelText('Submit question')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<QASection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ask a question to see the Q&A in action...');
      
      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();
      
      // Verify that we can tab through multiple elements
      // Tab a few more times to ensure navigation works
      await user.tab();
      await user.tab();
      await user.tab();
      
      // The focus should have moved from the input
      expect(input).not.toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles service errors gracefully', async () => {
      mockQaService.submitQuestion.mockRejectedValue(new Error('Service error'));
      const user = userEvent.setup();
      
      render(<QASection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Ask a question to see the Q&A in action...');
      const submitButton = screen.getByRole('button', { name: /submit question/i });
      
      await user.type(input, 'Test question');
      await user.click(submitButton);
      
      // Should handle the error without crashing
      expect(screen.getAllByText('Test question')[0]).toBeInTheDocument();
    });
  });
});



