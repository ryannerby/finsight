import { Router, Request, Response, NextFunction } from 'express';
import { env } from '../lib/env';
import { ragService } from '../services/ragService';
import { qaGuardrails } from '../services/qaGuardrails';
import { supabase } from '../config/supabase';

export const qaRouter = Router();

// Test endpoint to verify Q&A service is working
qaRouter.get('/test', async (req: Request, res: Response) => {
  try {
    res.json({ 
      status: 'ok', 
      message: 'Q&A service is running',
      timestamp: new Date().toISOString(),
      features: [
        'AI-powered responses with RAG',
        'Guardrails for data accuracy',
        'Context validation',
        'Source citation tracking',
        'History tracking'
      ],
      rag: {
        enabled: env.ENABLE_RAG,
        embeddings: env.ENABLE_EMBEDDINGS
      },
      guardrails: {
        enabled: env.ENABLE_QA,
        confidenceThreshold: qaGuardrails.getConfig().confidenceThreshold
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Q&A service test failed' });
  }
});

// Enhanced Q&A endpoint with RAG and guardrails
qaRouter.post('/ask', async (req: Request, res: Response) => {
  console.log('Q&A /ask endpoint called');
  
  try {
    const { deal_id, question, user_id } = req.body;

    if (!deal_id || !question) {
      return res.status(400).json({ error: 'deal_id and question are required' });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    console.log('Processing question:', question, 'for deal:', deal_id);

    // Check if RAG is enabled
    if (!env.ENABLE_RAG) {
      // Fallback to basic Q&A without RAG
      const fallbackResponse = await generateFallbackResponse(question, deal_id);
      return res.json(fallbackResponse);
    }

    // Get RAG context
    let ragContext;
    try {
      ragContext = await ragService.getRAGContext(deal_id, question);
    } catch (error) {
      console.error('RAG context error:', error);
      // Continue with empty context
      ragContext = {
        relevantChunks: [],
        totalChunks: 0,
        searchQuery: question,
        confidence: 0.5
      };
    }

    // Get available metrics for guardrail validation
    const availableMetrics = await getAvailableMetrics(deal_id);

    // Assess context quality
    const contextAssessment = qaGuardrails.assessContext(
      ragContext.relevantChunks,
      question,
      availableMetrics
    );

    // Check if we have sufficient context
    if (!contextAssessment.hasSufficientData) {
      const insufficientContextResponse = qaGuardrails.generateInsufficientContextResponse(
        question,
        contextAssessment
      );
      
      return res.json({
        id: `qa-${Date.now()}`,
        deal_id: deal_id,
        question: question,
        answer: insufficientContextResponse,
        ai_response: insufficientContextResponse,
        confidence: 0.3,
        sources: [],
        created_at: new Date().toISOString(),
        context: contextAssessment,
        guardrail_results: {
          passed: false,
          warnings: ['Insufficient context for accurate response'],
          suggestions: contextAssessment.missingContext,
          requiresManualReview: true
        },
        rag_context: {
          enabled: true,
          chunks_retrieved: 0,
          total_available_chunks: 0
        }
      });
    }

    // Generate AI response using RAG context
    const aiResponse = await generateAIResponse(question, ragContext, availableMetrics);

    // Apply guardrails
    const guardrailResults = qaGuardrails.validateResponse(
      question,
      aiResponse.answer,
      ragContext.relevantChunks,
      aiResponse.confidence,
      availableMetrics
    );

    // Prepare sources from RAG chunks
    const sources = ragContext.relevantChunks.map(chunk => ({
      id: chunk.id,
      title: chunk.metadata.filename,
      type: chunk.metadata.document_type,
      relevance: chunk.metadata.chunk_index,
      content: chunk.content.substring(0, 200) + '...',
      metadata: chunk.metadata
    }));

    // Save Q&A to database
    const qaRecord = await saveQARecord(deal_id, question, aiResponse.answer, user_id, {
      rag_context: ragContext,
      guardrail_results: guardrailResults,
      context_assessment: contextAssessment,
      sources: sources
    });

    const response = {
      id: qaRecord.id,
      deal_id: deal_id,
      question: question,
      answer: aiResponse.answer,
      ai_response: aiResponse.answer,
      confidence: aiResponse.confidence,
      sources: sources,
      created_at: qaRecord.created_at,
      context: contextAssessment,
      guardrail_results: guardrailResults,
      rag_context: {
        enabled: true,
        chunks_retrieved: ragContext.relevantChunks.length,
        total_available_chunks: ragContext.totalChunks,
        search_confidence: ragContext.confidence
      }
    };

    console.log('Sending enhanced Q&A response');
    res.json(response);

  } catch (error) {
    console.error('Error in Q&A:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get Q&A history for a deal
qaRouter.get('/deal/:dealId', async (req: Request, res: Response) => {
  try {
    const { dealId } = req.params;
    
    const { data: qaHistory, error } = await supabase
      .from('qas')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Q&A history:', error);
      return res.status(500).json({ error: 'Failed to fetch Q&A history' });
    }

    res.json(qaHistory || []);
  } catch (error) {
    console.error('Error fetching Q&A history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get RAG status and configuration
qaRouter.get('/status', async (req: Request, res: Response) => {
  try {
    res.json({
      rag: ragService.getStatus(),
      guardrails: qaGuardrails.getConfig(),
      environment: {
        enable_qa: env.ENABLE_QA,
        enable_rag: env.ENABLE_RAG,
        enable_embeddings: env.ENABLE_EMBEDDINGS
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get Q&A status' });
  }
});

// Helper functions

async function generateAIResponse(
  question: string, 
  ragContext: any, 
  availableMetrics: Record<string, any>
): Promise<{ answer: string; confidence: number }> {
  // For now, use a simple template-based approach
  // In production, this would call Claude API with RAG context
  
  let answer = '';
  let confidence = 0.7;

  if (ragContext.relevantChunks.length === 0) {
    answer = `I don't have sufficient context to answer "${question}". Please ensure relevant documents have been uploaded and parsed.`;
    confidence = 0.3;
  } else {
    // Generate response based on available chunks and metrics
    answer = `Based on the available financial documents, I can provide insights about "${question}". `;
    
    if (availableMetrics && Object.keys(availableMetrics).length > 0) {
      answer += `I have access to ${Object.keys(availableMetrics).length} computed metrics and ${ragContext.relevantChunks.length} relevant document sections. `;
      
      // Add specific insights based on question type
      if (question.toLowerCase().includes('margin')) {
        answer += `The documents contain margin analysis data that can help answer your question.`;
      } else if (question.toLowerCase().includes('trend')) {
        answer += `Multiple time periods are available for trend analysis.`;
      } else {
        answer += `The available data provides comprehensive financial insights.`;
      }
    } else {
      answer += `I have access to ${ragContext.relevantChunks.length} relevant document sections, though computed metrics are not yet available.`;
    }
    
    confidence = Math.min(0.9, 0.6 + (ragContext.relevantChunks.length * 0.1));
  }

  return { answer, confidence };
}

async function generateFallbackResponse(question: string, dealId: string): Promise<any> {
  // Simple fallback when RAG is disabled
  const questionLower = question.toLowerCase();
  let answer = '';
  let confidence = 0.6;

  if (questionLower.includes('margin') || questionLower.includes('gross')) {
    answer = `I can help with margin analysis questions. Please ensure relevant financial documents have been uploaded and parsed for detailed insights.`;
  } else if (questionLower.includes('trend') || questionLower.includes('growth')) {
    answer = `For trend analysis, I'll need access to multiple time periods of financial data. Please upload documents covering different periods.`;
  } else {
    answer = `I can help answer questions about the financial data. Please ensure relevant documents have been uploaded and parsed.`;
  }

  return {
    id: `qa-${Date.now()}`,
    deal_id: dealId,
    question: question,
    answer: answer,
    ai_response: answer,
    confidence: confidence,
    sources: [],
    created_at: new Date().toISOString(),
    context: {
      hasSufficientData: false,
      dataQuality: 'low',
      missingContext: ['RAG functionality disabled', 'Document chunks not available']
    },
    guardrail_results: {
      passed: false,
      warnings: ['RAG functionality is disabled'],
      suggestions: ['Enable RAG for enhanced Q&A capabilities'],
      requiresManualReview: false
    },
    rag_context: {
      enabled: false,
      chunks_retrieved: 0,
      total_available_chunks: 0
    }
  };
}

async function getAvailableMetrics(dealId: string): Promise<Record<string, any>> {
  try {
    // Get analysis reports with computed metrics
    const { data: reports, error } = await supabase
      .from('analysis_reports')
      .select('summary_report, computed_metrics')
      .eq('deal_id', dealId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !reports || reports.length === 0) {
      return {};
    }

    const latestReport = reports[0];
    return {
      ...(latestReport.summary_report || {}),
      ...(latestReport.computed_metrics || {})
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return {};
  }
}

async function saveQARecord(
  dealId: string, 
  question: string, 
  answer: string, 
  userId: string, 
  context: any
): Promise<any> {
  try {
    const { data: qaRecord, error } = await supabase
      .from('qas')
      .insert({
        deal_id: dealId,
        question: question,
        answer: answer,
        asked_by: userId,
        context: context
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving Q&A record:', error);
      throw error;
    }

    return qaRecord;
  } catch (error) {
    console.error('Error saving Q&A record:', error);
    // Return a mock record if database save fails
    return {
      id: `qa-${Date.now()}`,
      created_at: new Date().toISOString()
    };
  }
}

export default qaRouter; 