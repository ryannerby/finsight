import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { qaService, type Source } from '@/services/qaService';
import { useToast } from '@/components/ui/toast-context';
import { FetchError } from '@/lib/fetchJson';
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

interface QAMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  status: 'streaming' | 'completed' | 'error';
  sources: Source[];
  confidence: number;
  context?: {
    hasSufficientData: boolean;
    dataQuality: 'high' | 'medium' | 'low';
    missingContext: string[];
  };
  guardrail_results?: {
    passed: boolean;
    warnings: string[];
    suggestions: string[];
    requiresManualReview: boolean;
  };
  rag_context?: {
    enabled: boolean;
    chunks_retrieved: number;
    total_available_chunks: number;
    search_confidence?: number;
  };
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

export function QASection({ dealId, className, onOpenEvidenceDrawer }: { dealId?: string; className?: string; onOpenEvidenceDrawer?: (sources: Source[]) => void }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const { addToast } = useToast();
  
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
      sources: [],
      confidence: 0.5
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
              sources: response.sources || [],
              confidence: response.confidence,
              context: response.context,
              guardrail_results: response.guardrail_results,
              rag_context: response.rag_context
            }
          : msg
      ));

    } catch (error) {
      console.error('Failed to get answer:', error);
      
      const errorMessage = error instanceof FetchError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Failed to get answer';
      
      const requestId = error instanceof FetchError ? error.requestId : undefined;
      
      // Show error toast
      addToast({
        type: 'error',
        message: `Failed to get answer: ${errorMessage}`,
        requestId,
        details: `Question: ${newMessage.question}`
      });
      
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
      sources: [],
      confidence: 0.5
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
      addToast({
        type: 'success',
        message: 'Answer copied to clipboard!'
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      addToast({
        type: 'error',
        message: 'Failed to copy answer to clipboard'
      });
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

  // Render message with enhanced information
  const renderMessage = (message: QAMessage) => (
    <div key={message.id} className="space-y-3">
      {/* Question */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="font-medium text-blue-900">{message.question}</p>
        <p className="text-sm text-blue-600 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>

      {/* Answer */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <p className="text-gray-800 whitespace-pre-wrap">{message.answer}</p>
        
        {/* RAG Context Info */}
        {message.rag_context && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">RAG Context:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                message.rag_context.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {message.rag_context.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {message.rag_context.enabled && (
              <div className="text-xs text-gray-500 mt-1">
                Retrieved {message.rag_context.chunks_retrieved} of {message.rag_context.total_available_chunks} chunks
                {message.rag_context.search_confidence && (
                  <span> • Confidence: {(message.rag_context.search_confidence * 100).toFixed(0)}%</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Context Assessment */}
        {message.context && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="font-medium">Data Quality:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                message.context.dataQuality === 'high' ? 'bg-green-100 text-green-800' :
                message.context.dataQuality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {message.context.dataQuality.charAt(0).toUpperCase() + message.context.dataQuality.slice(1)}
              </span>
            </div>
            {!message.context.hasSufficientData && message.context.missingContext.length > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                Missing: {message.context.missingContext.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Guardrail Results */}
        {message.guardrail_results && (
          <div className={`mt-3 p-2 rounded text-sm ${
            message.guardrail_results.passed ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${
                message.guardrail_results.passed ? 'text-green-700' : 'text-yellow-700'
              }`}>
                Quality Check:
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                message.guardrail_results.passed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {message.guardrail_results.passed ? 'Passed' : 'Issues Found'}
              </span>
            </div>
            {message.guardrail_results.warnings.length > 0 && (
              <div className="text-xs text-yellow-700 mt-1">
                <span className="font-medium">Warnings:</span> {message.guardrail_results.warnings.join(', ')}
              </div>
            )}
            {message.guardrail_results.suggestions.length > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                <span className="font-medium">Suggestions:</span> {message.guardrail_results.suggestions.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Confidence and Sources */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Confidence:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              message.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
              message.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {(message.confidence * 100).toFixed(0)}%
            </span>
          </div>
          
          {message.sources.length > 0 && (
            <button
              onClick={() => onOpenEvidenceDrawer?.(message.sources)}
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              View {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
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
              messages.map(renderMessage)
            )}
            
            {/* Streaming message */}
            {streamingMessage && streamingId && (
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">Processing...</p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Generating response...</span>
                  </div>
                </div>
              </div>
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
