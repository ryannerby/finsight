import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { qaService, type QAMessage, type Source } from '@/services/qaService';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  RotateCcw, 
  FileText,
  Sparkles,
  History,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types are now imported from qaService

interface QASectionProps {
  dealId?: string;
  className?: string;
  onOpenEvidenceDrawer?: (sources: Source[]) => void;
}

// Example questions for onboarding
const EXAMPLE_QUESTIONS = [
  'How have gross margins trended over the last 3 years?',
  'What is the working capital cycle and how has it changed?',
  'Are there any concerning trends in cash flow from operations?',
  'What are the key drivers of revenue growth?',
  'How does this company compare to industry benchmarks?',
  'What are the main risks in the financial statements?'
];

export function QASection({ dealId, className, onOpenEvidenceDrawer }: QASectionProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Q&A history on mount
  useEffect(() => {
    if (dealId) {
      loadHistory();
    }
  }, [dealId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Load Q&A history from the service
  const loadHistory = async () => {
    if (!dealId) return;
    
    try {
      const history = await qaService.getHistory(dealId);
      const formattedMessages: QAMessage[] = history.map(item => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        timestamp: new Date(item.created_at),
        status: 'completed',
        sources: qaService.generateMockSources(item.question),
        confidence: 0.9
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load Q&A history:', error);
      // Continue with empty messages array
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [question]);

  // Handle question submission
  const handleSubmit = async () => {
    if (!question.trim() || isLoading) return;

    // If no dealId, use demo mode
    if (!dealId) {
      await handleDemoSubmit();
      return;
    }

    const newMessage: QAMessage = {
      id: Date.now().toString(),
      question: question.trim(),
      answer: '',
      timestamp: new Date(),
      status: 'streaming',
      sources: []
    };

    setMessages(prev => [newMessage, ...prev]);
    setQuestion('');
    setIsLoading(true);
    setStreamingId(newMessage.id);
    setStreamingMessage('');

    try {
      // Ask the question using the real Q&A service
      const response = await qaService.askQuestion({
        deal_id: dealId,
        question: newMessage.question
      });

      // Update the message with the real response
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { 
              ...msg, 
              answer: response.ai_response, 
              status: 'completed',
              sources: qaService.generateMockSources(newMessage.question),
              confidence: response.confidence
            }
          : msg
      ));

    } catch (error) {
      console.error('Failed to get answer:', error);
      
      // Update the message with error status
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, status: 'error' }
          : msg
      ));
    } finally {
      setStreamingMessage('');
      setStreamingId(null);
      setIsLoading(false);
    }
  };

  // Demo mode for testing without a dealId
  const handleDemoSubmit = async () => {
    const newMessage: QAMessage = {
      id: Date.now().toString(),
      question: question.trim(),
      answer: '',
      timestamp: new Date(),
      status: 'streaming',
      sources: []
    };

    setMessages(prev => [newMessage, ...prev]);
    setQuestion('');
    setIsLoading(true);
    setStreamingId(newMessage.id);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a demo response based on the question
    const demoResponse = generateDemoResponse(newMessage.question);
    
    // Update the message with the demo response
    setMessages(prev => prev.map(msg => 
      msg.id === newMessage.id 
        ? { 
            ...msg, 
            answer: demoResponse, 
            status: 'completed',
            sources: qaService.generateMockSources(newMessage.question),
            confidence: 0.85
          }
        : msg
    ));

    setStreamingId(null);
    setIsLoading(false);
  };

  // Generate demo responses for testing
  const generateDemoResponse = (question: string): string => {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('margin') || questionLower.includes('gross')) {
      return `Based on the financial analysis, gross margins have shown a positive trend over the last three years. The data indicates margins improved from 28% in 2021 to 32% in 2023, representing a 4 percentage point increase. This improvement is primarily driven by operational efficiency gains and pricing optimization strategies. The trend suggests strong cost management and pricing power, which are positive indicators for the business.`;
    } else if (questionLower.includes('working capital') || questionLower.includes('ccc')) {
      return `The working capital cycle analysis shows significant improvement over the past year. The cash conversion cycle (CCC) has decreased from 45 days to 38 days, indicating better working capital efficiency. This improvement is attributed to faster receivables collection (down from 32 to 28 days) and optimized inventory management (reduced from 25 to 22 days). The company has also extended payables slightly from 12 to 16 days, contributing to overall working capital optimization.`;
    } else if (questionLower.includes('cash flow') || questionLower.includes('operations')) {
      return `Cash flow from operations has demonstrated strong performance with a 22% year-over-year increase. The improvement is primarily driven by better working capital management and operational efficiency gains. Operating cash flow margins have expanded from 18% to 22%, indicating the business is generating more cash per dollar of revenue. This strong cash generation provides flexibility for growth investments and debt reduction.`;
    } else if (questionLower.includes('revenue') || questionLower.includes('growth')) {
      return `Revenue growth analysis reveals a consistent upward trajectory with 15% year-over-year growth. The growth is well-distributed across business segments, with the core product line showing 18% growth and newer services contributing 12% growth. Customer acquisition costs have remained stable while customer lifetime value has increased, suggesting sustainable growth patterns. The company has successfully expanded into new markets, contributing approximately 25% of total growth.`;
    } else if (questionLower.includes('risk') || questionLower.includes('concern')) {
      return `Risk assessment identifies several areas requiring attention. The primary concern is customer concentration, with the top 3 customers representing 35% of revenue. There's also moderate risk in supply chain dependencies and foreign exchange exposure. However, the company has implemented mitigation strategies including customer diversification programs and hedging strategies. The overall risk profile is considered moderate with strong risk management practices in place.`;
    } else {
      return `Based on the comprehensive financial analysis, I can provide insights on your question about "${question}". The data shows several positive trends including improving profitability, strong cash flow generation, and solid working capital management. The company appears to be in a strong financial position with good growth prospects. For more specific analysis, please provide additional context about what aspects you'd like me to focus on.`;
    }
  };

  // These functions are now handled by the qaService

  // Handle example question click
  const handleExampleClick = (example: string) => {
    setQuestion(example);
    inputRef.current?.focus();
  };

  // Handle copy answer
  const handleCopyAnswer = async (answer: string) => {
    try {
      await navigator.clipboard.writeText(answer);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle retry question
  const handleRetry = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setQuestion(message.question);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      inputRef.current?.focus();
    }
  };

  // Handle opening evidence drawer
  const handleOpenEvidence = (sources: Source[]) => {
    if (onOpenEvidenceDrawer) {
      onOpenEvidenceDrawer(sources);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render streaming message
  const renderStreamingMessage = (message: QAMessage) => {
    if (message.status !== 'streaming' || streamingId !== message.id) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>AI is analyzing your question...</span>
        </div>
        <div className="text-sm text-muted-foreground">
          This may take a few moments as we analyze your financial data and generate insights.
        </div>
      </div>
    );
  };

  // Render completed message
  const renderCompletedMessage = (message: QAMessage) => {
    if (message.status !== 'completed') return null;

    return (
      <div className="space-y-3">
        <div className="text-sm text-foreground leading-relaxed">
          {message.answer}
        </div>
        
        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Sources used:
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source) => (
                <Badge
                  key={source.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleOpenEvidence([source])}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {source.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Score */}
        {message.confidence && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Confidence:</span>
            <Badge 
              variant={message.confidence > 0.8 ? 'success' : message.confidence > 0.6 ? 'warning' : 'destructive'}
              className="text-xs"
            >
              {Math.round(message.confidence * 100)}%
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopyAnswer(message.answer)}
            className="h-7 px-2 text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRetry(message.id)}
            className="h-7 px-2 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <MessageSquare className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Financial Q&A</h2>
          <p className="text-sm text-muted-foreground">
            Ask questions about your financial data and get AI-powered insights
          </p>
        </div>
      </div>

      {!dealId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="text-sm font-medium">Demo Mode</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            No deal ID provided. This is a demonstration of the Q&A functionality.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Left: Input Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Input */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <textarea
                    ref={inputRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={dealId ? "Ask a question about your financial data..." : "Ask a question to see the Q&A in action..."}
                    className="flex-1 min-h-[80px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                    aria-label="Ask a question about your financial data"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!question.trim() || isLoading}
                    className="px-4 py-2"
                    aria-label="Submit question"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Example Questions */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Try asking:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_QUESTIONS.map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleExampleClick(example)}
                        className="text-xs h-7 px-2"
                        disabled={isLoading}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                title="Start asking questions"
                helper="Try asking about trends, ratios, or specific financial metrics to get AI-powered insights."
                action={
                  <div className="flex flex-wrap gap-2 justify-center">
                    {EXAMPLE_QUESTIONS.slice(0, 3).map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleExampleClick(example)}
                        className="text-xs"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                }
              />
            ) : (
              messages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="p-4">
                    {/* Question */}
                    <div className="mb-3">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-blue-700">Q</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {message.question}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Answer */}
                    <div className="ml-8">
                      {message.status === 'streaming' && renderStreamingMessage(message)}
                      {message.status === 'completed' && renderCompletedMessage(message)}
                      {message.status === 'error' && (
                        <div className="text-sm text-destructive">
                          Sorry, I encountered an error. Please try again.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right: History Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4" />
                History
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="ml-auto h-6 w-6 p-0"
                  aria-label={historyOpen ? 'Collapse history' : 'Expand history'}
                >
                  {historyOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            
            {historyOpen && (
              <CardContent className="pt-0">
                {messages.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No questions yet</p>
                    <p className="text-xs">Your Q&A history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => {
                          setQuestion(message.question);
                          inputRef.current?.focus();
                        }}
                      >
                        <div className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                          {message.question}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatTimestamp(message.timestamp)}</span>
                          <Badge
                            variant={message.status === 'completed' ? 'success' : 'secondary'}
                            className="text-xs"
                          >
                            {message.status === 'completed' ? 'Answered' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
