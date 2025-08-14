import { Anthropic } from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Response interface for enhanced analysis
 */
export interface EnhancedAnalysisResponse {
  content: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

/**
 * Enhanced analysis request interface
 */
export interface EnhancedAnalysisRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Enhanced analysis service class
 */
export class AnthropicService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = anthropic;
  }

  /**
   * Generate enhanced analysis using Claude API
   * Optimized for financial report generation with evidence tracking
   */
  async generateEnhancedAnalysis(request: EnhancedAnalysisRequest): Promise<EnhancedAnalysisResponse> {
    try {
      const {
        prompt,
        model = "claude-3-5-sonnet-20240620",
        maxTokens = 4000,
        temperature = 0.1,
        systemPrompt = this.getDefaultSystemPrompt()
      } = request;

      const response = await this.anthropic.messages.create(
        {
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
        },
        { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } }
      );

      const content = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';

      return {
        content,
        confidence: this.calculateConfidence(response),
        metadata: {
          model,
          usage: response.usage,
          finish_reason: response.stop_reason
        }
      };
    } catch (error) {
      console.error('Enhanced analysis generation failed:', error);
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate structured financial analysis with specific output format
   */
  async generateStructuredAnalysis(
    prompt: string, 
    outputFormat: 'json' | 'markdown' | 'text' = 'markdown'
  ): Promise<EnhancedAnalysisResponse> {
    const structuredPrompt = this.buildStructuredPrompt(prompt, outputFormat);
    
    return this.generateEnhancedAnalysis({
      prompt: structuredPrompt,
      temperature: 0.05, // Lower temperature for more consistent structured output
      maxTokens: 6000
    });
  }

  /**
   * Generate Q&A insights with evidence tracking
   */
  async generateQAInsights(
    question: string,
    context: string,
    evidence: string[]
  ): Promise<EnhancedAnalysisResponse> {
    const qaPrompt = this.buildQAPrompt(question, context, evidence);
    
    return this.generateEnhancedAnalysis({
      prompt: qaPrompt,
      temperature: 0.2,
      maxTokens: 3000
    });
  }

  /**
   * Generate executive summary with key insights
   */
  async generateExecutiveSummary(
    dealData: any,
    financialMetrics: any
  ): Promise<EnhancedAnalysisResponse> {
    const summaryPrompt = this.buildExecutiveSummaryPrompt(dealData, financialMetrics);
    
    return this.generateEnhancedAnalysis({
      prompt: summaryPrompt,
      temperature: 0.15,
      maxTokens: 2500
    });
  }

  /**
   * Get default system prompt for financial analysis
   */
  private getDefaultSystemPrompt(): string {
    return `You are an expert financial analyst specializing in comprehensive deal analysis and reporting.

Your role is to:
1. Analyze financial data and documents with precision and insight
2. Generate professional, actionable financial reports
3. Identify key risks, opportunities, and recommendations
4. Provide evidence-based insights with clear reasoning
5. Maintain consistent, professional tone throughout

Key Requirements:
- Always base your analysis on the provided data and evidence
- Be specific and quantitative when possible
- Highlight both strengths and areas of concern
- Provide actionable recommendations
- Use clear, professional language suitable for business stakeholders
- Maintain objectivity and analytical rigor

Output Format:
- Use clear headings and structure
- Include specific data points and metrics when available
- Provide bullet points for key insights
- End with clear recommendations and next steps`;
  }

  /**
   * Build structured prompt for specific output formats
   */
  private buildStructuredPrompt(prompt: string, outputFormat: string): string {
    const formatInstructions = {
      json: 'Please provide your response in valid JSON format with clear structure and keys.',
      markdown: 'Please format your response using Markdown with clear headings, bullet points, and structure.',
      text: 'Please provide your response in clear, structured text with appropriate paragraphs and sections.'
    };

    return `${prompt}

${formatInstructions[outputFormat as keyof typeof formatInstructions]}

Ensure your response is well-organized and easy to read.`;
  }

  /**
   * Build Q&A prompt with evidence context
   */
  private buildQAPrompt(question: string, context: string, evidence: string[]): string {
    return `Question: ${question}

Context: ${context}

Available Evidence:
${evidence.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Please provide a comprehensive answer that:
1. Directly addresses the question
2. References specific evidence when possible
3. Provides clear, actionable insights
4. Maintains professional financial analysis tone
5. Includes confidence level in your assessment`;
  }

  /**
   * Build executive summary prompt
   */
  private buildExecutiveSummaryPrompt(dealData: any, financialMetrics: any): string {
    return `Generate an executive summary for a financial analysis report.

Deal Information:
- Title: ${dealData.title || 'N/A'}
- Description: ${dealData.description || 'N/A'}

Financial Metrics:
${Object.entries(financialMetrics || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Please provide:
1. Executive Summary (2-3 paragraphs)
2. Key Financial Highlights (bullet points)
3. Risk Assessment (top 3-5 risks)
4. Recommendations (3-5 actionable items)
5. Next Steps

Focus on high-level insights that would be relevant to senior executives and decision-makers.`;
  }

  /**
   * Calculate confidence score based on response characteristics
   */
  private calculateConfidence(response: any): number {
    // Base confidence on response quality indicators
    let confidence = 0.8; // Base confidence
    
    // Adjust based on finish reason
    if (response.stop_reason === 'end_turn') {
      confidence += 0.1;
    } else if (response.stop_reason === 'max_tokens') {
      confidence -= 0.1;
    }
    
    // Adjust based on content length (longer responses often indicate more thorough analysis)
    const contentLength = response.content[0]?.type === 'text' ? response.content[0].text.length : 0;
    if (contentLength > 500) {
      confidence += 0.05;
    } else if (contentLength < 100) {
      confidence -= 0.1;
    }
    
    // Ensure confidence is within bounds
    return Math.max(0.1, Math.min(1.0, confidence));
  }
}

// Export singleton instance
export const anthropicService = new AnthropicService();

// Legacy function for backward compatibility
export async function jsonCall(
  {system, prompt, model="claude-3-5-sonnet-20240620"}:{ system: string; prompt: string; model?: string }
) {
  const resp = await anthropic.messages.create(
    {
      model,
      max_tokens: 4000,
      temperature: 0.1,
      system,
      messages: [{ role: "user", content: prompt }],
    },
    { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } }
  );
  return resp;
}
