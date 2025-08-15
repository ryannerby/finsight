import { env } from '../lib/env';

export interface GuardrailResult {
  passed: boolean;
  warnings: string[];
  suggestions: string[];
  requiresManualReview: boolean;
}

export interface QAResponse {
  answer: string;
  confidence: number;
  sources: any[];
  guardrailResults: GuardrailResult;
  context: {
    hasSufficientData: boolean;
    dataQuality: 'high' | 'medium' | 'low';
    missingContext: string[];
  };
}

export class QAGuardrails {
  private confidenceThreshold = 0.7;
  private maxAnswerLength = 2000;

  /**
   * Validate Q&A response against guardrails
   */
  validateResponse(
    question: string,
    answer: string,
    sources: any[],
    confidence: number,
    availableMetrics?: Record<string, any>
  ): GuardrailResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let requiresManualReview = false;

    // 1. Check for invented numbers
    const numberViolations = this.checkForInventedNumbers(answer, availableMetrics);
    if (numberViolations.length > 0) {
      warnings.push(...numberViolations);
      requiresManualReview = true;
    }

    // 2. Check answer length
    if (answer.length > this.maxAnswerLength) {
      warnings.push(`Answer exceeds maximum length (${this.maxAnswerLength} chars)`);
      suggestions.push('Consider breaking the response into multiple parts');
    }

    // 3. Check confidence level
    if (confidence < this.confidenceThreshold) {
      warnings.push(`Low confidence response (${confidence.toFixed(2)})`);
      suggestions.push('Consider requesting additional context or clarification');
      requiresManualReview = true;
    }

    // 4. Check for proper citations
    if (sources.length === 0) {
      warnings.push('No sources provided for the answer');
      suggestions.push('Include specific references to source documents or metrics');
    }

    // 5. Check for vague language
    const vagueLanguage = this.checkForVagueLanguage(answer);
    if (vagueLanguage.length > 0) {
      warnings.push(...vagueLanguage);
      suggestions.push('Provide specific, actionable insights when possible');
    }

    return {
      passed: warnings.length === 0,
      warnings,
      suggestions,
      requiresManualReview
    };
  }

  /**
   * Check if the answer contains invented numbers not in available metrics
   */
  private checkForInventedNumbers(
    answer: string,
    availableMetrics?: Record<string, any>
  ): string[] {
    const violations: string[] = [];
    
    // Extract numbers from the answer
    const numberPattern = /(\d+(?:\.\d+)?%?)/g;
    const numbers = answer.match(numberPattern) || [];
    
    if (!availableMetrics || Object.keys(availableMetrics).length === 0) {
      // If no metrics available, flag all numbers as potentially invented
      if (numbers.length > 0) {
        violations.push('Numbers mentioned without available metrics for validation');
      }
      return violations;
    }

    // Check each number against available metrics
    for (const number of numbers) {
      const cleanNumber = number.replace('%', '');
      const numericValue = parseFloat(cleanNumber);
      
      if (isNaN(numericValue)) continue;
      
      // Check if this number appears in available metrics
      const foundInMetrics = Object.values(availableMetrics).some(metric => {
        if (typeof metric === 'number') {
          return Math.abs(metric - numericValue) < 0.01; // Allow for small rounding differences
        }
        return false;
      });
      
      if (!foundInMetrics) {
        violations.push(`Number "${number}" not found in available metrics`);
      }
    }

    return violations;
  }

  /**
   * Check for vague or non-specific language
   */
  private checkForVagueLanguage(answer: string): string[] {
    const vaguePatterns = [
      /\b(some|many|few|several|various|multiple)\b/gi,
      /\b(good|bad|high|low|significant|substantial)\b/gi,
      /\b(improved|declined|increased|decreased)\b/gi,
      /\b(around|approximately|roughly|about)\b/gi
    ];
    
    const violations: string[] = [];
    
    for (const pattern of vaguePatterns) {
      const matches = answer.match(pattern);
      if (matches && matches.length > 2) { // Allow some vague language but not too much
        violations.push('Excessive use of vague language detected');
        break;
      }
    }
    
    return violations;
  }

  /**
   * Generate context assessment
   */
  assessContext(
    sources: any[],
    question: string,
    availableMetrics?: Record<string, any>
  ): QAResponse['context'] {
    const hasSufficientData = sources.length > 0 && 
      (availableMetrics ? Object.keys(availableMetrics).length > 0 : true);
    
    let dataQuality: 'high' | 'medium' | 'low' = 'low';
    if (sources.length >= 3 && availableMetrics && Object.keys(availableMetrics).length >= 5) {
      dataQuality = 'high';
    } else if (sources.length >= 1 || (availableMetrics && Object.keys(availableMetrics).length >= 2)) {
      dataQuality = 'medium';
    }
    
    const missingContext: string[] = [];
    
    if (sources.length === 0) {
      missingContext.push('No source documents available');
    }
    
    if (!availableMetrics || Object.keys(availableMetrics).length === 0) {
      missingContext.push('No computed metrics available');
    }
    
    if (question.toLowerCase().includes('trend') && sources.length < 2) {
      missingContext.push('Multiple time periods needed for trend analysis');
    }
    
    if (question.toLowerCase().includes('compare') && sources.length < 2) {
      missingContext.push('Multiple sources needed for comparison');
    }
    
    return {
      hasSufficientData,
      dataQuality,
      missingContext
    };
  }

  /**
   * Generate "insufficient context" response
   */
  generateInsufficientContextResponse(
    question: string,
    context: QAResponse['context']
  ): string {
    let response = `I don't have sufficient context to provide a complete answer to "${question}". `;
    
    if (context.missingContext.length > 0) {
      response += `\n\nMissing context:\n${context.missingContext.map(item => `• ${item}`).join('\n')}`;
    }
    
    response += `\n\nSuggestions:\n• Upload additional financial documents\n• Ensure documents have been parsed and analyzed\n• Ask more specific questions about available data`;
    
    return response;
  }

  /**
   * Check if guardrails are enabled
   */
  isEnabled(): boolean {
    return env.ENABLE_QA;
  }

  /**
   * Get guardrail configuration
   */
  getConfig() {
    return {
      enabled: env.ENABLE_QA,
      confidenceThreshold: this.confidenceThreshold,
      maxAnswerLength: this.maxAnswerLength
    };
  }
}

export const qaGuardrails = new QAGuardrails();
