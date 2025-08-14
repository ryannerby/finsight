# Q&A Module

A comprehensive financial Q&A module with AI-powered insights, streaming responses, and evidence integration.

## Features

### 🚀 Onboarding
- **Example Questions**: Clickable financial analysis questions to get users started
- **Meaningful Empty State**: Clear guidance when no questions have been asked
- **Smart Suggestions**: Context-aware question examples based on financial data

### 📚 History & Organization
- **Collapsible History Sidebar**: Right-side panel with question history
- **Timestamps & Status**: Each question shows when it was asked and completion status
- **Click to Reuse**: Click any historical question to ask it again
- **Status Badges**: Visual indicators for pending, completed, and error states

### ⚡ Streaming & Sources
- **Typewriter Effect**: Real-time streaming of AI responses
- **Source Integration**: Evidence chips linking to supporting documents
- **Copy & Retry**: Easy actions to copy answers or retry questions
- **Evidence Drawer**: Deep integration with the existing evidence system

## Components

### QASection
The main Q&A component that orchestrates the entire experience.

**Props:**
- `dealId?: string` - Optional deal identifier for context
- `className?: string` - Additional CSS classes
- `onOpenEvidenceDrawer?: (sources: Source[]) => void` - Callback to open evidence drawer

**Features:**
- Responsive grid layout (2/3 for Q&A, 1/3 for history)
- Keyboard shortcuts (Enter to submit, Shift+Enter for new line)
- Auto-scroll to latest messages
- Loading states and error handling

## Usage

### Basic Implementation
```tsx
import { QASection } from '@/components/qa';

function MyPage() {
  const handleOpenEvidence = (sources: Source[]) => {
    // Open your evidence drawer with the sources
    console.log('Opening evidence for:', sources);
  };

  return (
    <QASection
      dealId="deal-123"
      onOpenEvidenceDrawer={handleOpenEvidence}
    />
  );
}
```

### With Evidence Integration
```tsx
import { QASection } from '@/components/qa';
import { EvidenceDrawer } from '@/components/results/EvidenceDrawer';

function MyPage() {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Source[]>([]);

  const handleOpenEvidence = (sources: Source[]) => {
    setSelectedSources(sources);
    setEvidenceOpen(true);
  };

  return (
    <>
      <QASection
        dealId="deal-123"
        onOpenEvidenceDrawer={handleOpenEvidence}
      />
      
      <EvidenceDrawer
        open={evidenceOpen}
        onOpenChange={setEvidenceOpen}
        items={selectedSources}
        title="Supporting Evidence"
      />
    </>
  );
}
```

## Data Flow

1. **User Input**: User types a question or clicks an example
2. **Question Submission**: Question is added to history with 'streaming' status
3. **AI Processing**: Simulated streaming response (replace with actual API)
4. **Response Completion**: Message status changes to 'completed' with sources
5. **Evidence Integration**: Source chips link to evidence drawer

## Customization

### Example Questions
Modify the `EXAMPLE_QUESTIONS` array in `QASection.tsx` to customize the onboarding experience:

```tsx
const EXAMPLE_QUESTIONS = [
  'How have gross margins trended over the last 3 years?',
  'What is the working capital cycle and how has it changed?',
  // Add your own questions...
];
```

### Streaming Response
Replace the `simulateStreamingResponse` function with your actual AI streaming implementation:

```tsx
const simulateStreamingResponse = async (messageId: string) => {
  // Replace with actual API call
  const response = await fetch('/api/qa/stream', {
    method: 'POST',
    body: JSON.stringify({ question: question, dealId }),
  });
  
  // Handle streaming response...
};
```

### Source Generation
Customize the `generateMockSources` function to integrate with your evidence system:

```tsx
const generateMockSources = async (question: string): Promise<Source[]> => {
  // Query your evidence database
  const sources = await queryEvidence(question);
  return sources.map(transformToSource);
};
```

## Accessibility

- **Keyboard Navigation**: Full keyboard support with Enter to submit
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Focus Management**: Automatic focus on input after actions
- **Status Announcements**: Clear status indicators for all states

## Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Grid Layout**: Responsive grid that adapts to screen size
- **Touch Friendly**: Large touch targets and intuitive gestures
- **Collapsible History**: History sidebar collapses on smaller screens

## Future Enhancements

- **Real-time Streaming**: Integration with actual AI streaming APIs
- **Question Templates**: Pre-built question templates for common analyses
- **Export Q&A**: Save Q&A sessions as reports
- **Collaboration**: Share questions and answers with team members
- **Analytics**: Track question patterns and user engagement
- **Multi-language**: Support for international financial terms

## Dependencies

- React 18+ with hooks
- Tailwind CSS for styling
- Lucide React for icons
- Radix UI components for accessibility
- Custom UI components from `@/components/ui`

## Testing

The module includes comprehensive TypeScript types and is designed for easy testing:

```tsx
// Test question submission
fireEvent.change(screen.getByRole('textbox'), {
  target: { value: 'How are margins trending?' }
});
fireEvent.click(screen.getByRole('button', { name: /submit/i }));

// Verify streaming state
expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();
```

## Performance

- **Lazy Loading**: Messages are rendered on-demand
- **Virtual Scrolling**: Large history lists use efficient rendering
- **Debounced Input**: Prevents excessive API calls during typing
- **Memoized Callbacks**: Optimized event handlers with useCallback
