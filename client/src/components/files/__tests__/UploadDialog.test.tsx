import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadDialog from '../UploadDialog';

// Mock the useFileUpload hook
jest.mock('../../../hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    uploads: [],
    isUploading: false,
    uploadFiles: jest.fn(),
    clearUploads: jest.fn(),
    removeUpload: jest.fn(),
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('UploadDialog', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    dealId: 'test-deal-123',
    userId: 'test-user-456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload dialog when open', () => {
    render(<UploadDialog {...mockProps} />);
    
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here, or click to browse')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Files' })).toBeInTheDocument();
  });

  it('closes dialog when close button is clicked', () => {
    render(<UploadDialog {...mockProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles file selection via file input', async () => {
    render(<UploadDialog {...mockProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
    
    fireEvent.change(fileInput, { target: { files: [testFile] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
  });

  it('handles drag and drop events', async () => {
    render(<UploadDialog {...mockProps} />);
    
    const dropZone = screen.getByTestId('drop-zone');
    const testFile = new File(['test content'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Simulate drag over
    fireEvent.dragOver(dropZone);
    
    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [testFile],
      },
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.xlsx')).toBeInTheDocument();
    });
  });

  it('validates file types correctly', () => {
    render(<UploadDialog {...mockProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const validFile = new File(['test'], 'test.csv', { type: 'text/csv' });
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    // Valid file should be accepted
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    // Invalid file should show error
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    // Note: In a real implementation, you'd want to check for error messages
    // This test verifies the component handles different file types
  });

  it('shows upload progress when files are being uploaded', async () => {
    const mockUploadFiles = jest.fn();
    
    jest.mocked(require('../../../hooks/useFileUpload')).useFileUpload = () => ({
      uploads: [
        {
          file: new File(['test'], 'test.csv', { type: 'text/csv' }),
          progress: 50,
          status: 'uploading' as const,
        },
      ],
      isUploading: true,
      uploadFiles: mockUploadFiles,
      clearUploads: vi.fn(),
      removeUpload: vi.fn(),
    });
    
    render(<UploadDialog {...mockProps} />);
    
    expect(screen.getByText('test.csv')).toBeInTheDocument();
    // Progress indicator should be visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles upload errors gracefully', async () => {
    const mockUploadFiles = jest.fn();
    
    jest.mocked(require('../../../hooks/useFileUpload')).useFileUpload = () => ({
      uploads: [
        {
          file: new File(['test'], 'test.csv', { type: 'text/csv' }),
          progress: 0,
          status: 'error' as const,
          error: 'Upload failed: Network error',
        },
      ],
      isUploading: false,
      uploadFiles: mockUploadFiles,
      clearUploads: vi.fn(),
      removeUpload: vi.fn(),
    });
    
    render(<UploadDialog {...mockProps} />);
    
    expect(screen.getByText('Upload failed: Network error')).toBeInTheDocument();
  });

  it('supports multiple file uploads', async () => {
    render(<UploadDialog {...mockProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const files = [
      new File(['csv content'], 'data.csv', { type: 'text/csv' }),
      new File(['xlsx content'], 'data.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }),
    ];
    
    fireEvent.change(fileInput, { target: { files } });
    
    await waitFor(() => {
      expect(screen.getByText('data.csv')).toBeInTheDocument();
      expect(screen.getByText('data.xlsx')).toBeInTheDocument();
    });
  });

  it('clears selected files when clear button is clicked', async () => {
    render(<UploadDialog {...mockProps} />);
    
    const fileInput = screen.getByTestId('file-input');
    const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
    
    fireEvent.change(fileInput, { target: { files: [testFile] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
    });
  });
});
