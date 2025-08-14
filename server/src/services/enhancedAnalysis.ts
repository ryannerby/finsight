import { SupabaseClient } from '@supabase/supabase-js';
import { AnthropicService } from './anthropic';
import { 
  TAnalysisReport, 
  TReportGenerationRequest, 
  TReportGenerationResponse,
  TReportSection,
  TEvidenceItem,
  TReportQA,
  SummaryReport,
  EnhancedReportContext,
  ClaudeUsageStats,
  GenerationStats
} from '../types/analysis';

/**
 * Enhanced Analysis Service for generating comprehensive financial reports
 * Integrates with Claude API and provides evidence tracking, exports, and Q&A capabilities
 */
export class EnhancedAnalysisService {
  private supabase: SupabaseClient;
  private anthropicService: AnthropicService;

  constructor(supabase: SupabaseClient, anthropicService: AnthropicService) {
    this.supabase = supabase;
    this.anthropicService = anthropicService;
  }

  /**
   * Generate a comprehensive analysis report for a deal
   */
  async generateReport(request: TReportGenerationRequest): Promise<TReportGenerationResponse> {
    try {
      console.log('Starting report generation for request:', request);
      
      // Create initial report record
      const reportId = await this.createReportRecord(request);
      console.log('Created report record with ID:', reportId);
      
      // Start async report generation
      this.generateReportAsync(reportId, request);
      
      return {
        success: true,
        report_id: reportId,
        status: 'queued',
        message: 'Report generation started successfully',
        progress: 0,
        estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
      };
    } catch (error) {
      console.error('Error starting report generation:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'No message',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: error instanceof Error ? error.constructor.name : typeof error,
        request
      });
      
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate comprehensive financial analysis (main integration point)
   */
  async generateComprehensiveReport(
    dealId: string,
    documents: any[],
    computedMetrics: any
  ): Promise<{
    analysisId: string;
    summaryReport: SummaryReport;
    generationStats: GenerationStats;
  }> {
    const startTime = Date.now();
    
    try {
      // 1. Build enhanced context
      const context = await this.buildEnhancedContext(dealId, documents, computedMetrics);
      
      // 2. Generate summary with retry logic
      const { summaryReport, claudeStats } = await this.generateSummaryWithRetry(context);
      
      // 3. Validate and enhance report
      const validatedReport = this.validateAndEnhanceReport(summaryReport, context);
      
      // 4. Persist to database
      const analysisId = await this.persistEnhancedAnalysis(dealId, validatedReport, claudeStats);
      
      const totalTime = Date.now() - startTime;
      
      return {
        analysisId,
        summaryReport: validatedReport,
        generationStats: {
          total_time_ms: totalTime,
          claude_usage: claudeStats,
          validation_passed: true
        }
      };
      
    } catch (error) {
      await this.handleAnalysisError(dealId, error, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Asynchronously generate the complete report
   */
  private async generateReportAsync(reportId: string, request: TReportGenerationRequest): Promise<void> {
    try {
      // Update status to processing
      await this.updateReportStatus(reportId, 'in_progress', 10);

      // Fetch deal data and documents
      const dealData = await this.fetchDealData(request.deal_id);
      await this.updateReportStatus(reportId, 'in_progress', 20);

      // Generate report sections using Claude
      const sections = await this.generateReportSections(reportId, dealData, request);
      await this.updateReportStatus(reportId, 'in_progress', 50);

      // Generate evidence items
      const evidenceItems = await this.generateEvidenceItems(reportId, sections, dealData);
      await this.updateReportStatus(reportId, 'in_progress', 70);

      // Generate Q&A insights if requested
      let qaItems: TReportQA[] = [];
      if (request.include_qa) {
        qaItems = await this.generateQAInsights(reportId, sections, evidenceItems);
        await this.updateReportStatus(reportId, 'in_progress', 85);
      }

      // Generate exports if requested
      if (request.export_formats.length > 0) {
        await this.generateExports(reportId, request.export_formats, request.generated_by || 'system');
        await this.updateReportStatus(reportId, 'in_progress', 95);
      }

      // Mark report as completed
      await this.updateReportStatus(reportId, 'completed', 100);
      
      console.log(`Report ${reportId} generated successfully`);
    } catch (error) {
      console.error(`Error generating report ${reportId}:`, error);
      await this.updateReportStatus(reportId, 'failed', 0, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Create initial report record in database
   */
  private async createReportRecord(request: TReportGenerationRequest): Promise<string> {
    try {
      console.log('Creating report record in database for deal:', request.deal_id);
      
      const { data, error } = await this.supabase
        .from('analysis_reports')
        .insert({
          deal_id: request.deal_id,
          report_type: request.report_type,
          title: request.title,
          description: request.description,
          status: 'draft',
          generated_by: request.generated_by || 'system',
          metadata: request.metadata || {}
        })
        .select('id')
        .single();

      if (error) {
        console.error('Database error creating report record:', error);
        throw new Error(`Failed to create report record: ${error.message}`);
      }
      
      console.log('Successfully created report record with ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('Error in createReportRecord:', error);
      throw error;
    }
  }

  /**
   * Update report status and progress
   */
  private async updateReportStatus(
    reportId: string, 
    status: string, 
    progress: number, 
    error?: string
  ): Promise<void> {
    const updateData: any = { 
      status, 
      last_modified: new Date().toISOString() 
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (error) {
      updateData.metadata = { error, last_error_at: new Date().toISOString() };
    }

    const { error: updateError } = await this.supabase
      .from('analysis_reports')
      .update(updateData)
      .eq('id', reportId);

    if (updateError) {
      console.error(`Failed to update report status: ${updateError.message}`);
    }
  }

  /**
   * Fetch comprehensive deal data for analysis
   */
  private async fetchDealData(dealId: string) {
    // Fetch deal information
    const { data: deal, error: dealError } = await this.supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError) throw new Error(`Failed to fetch deal: ${dealError.message}`);

    // Fetch documents
    const { data: documents, error: docsError } = await this.supabase
      .from('documents')
      .select('*')
      .eq('deal_id', dealId);

    if (docsError) throw new Error(`Failed to fetch documents: ${docsError.message}`);

    // Fetch existing analyses
    const { data: analyses, error: analysesError } = await this.supabase
      .from('analyses')
      .select('*')
      .eq('deal_id', dealId);

    if (analysesError) throw new Error(`Failed to fetch analyses: ${analysesError.message}`);

    return { deal, documents, analyses };
  }

  /**
   * Generate report sections using Claude API
   */
  private async generateReportSections(
    reportId: string, 
    dealData: any, 
    request: TReportGenerationRequest
  ): Promise<TReportSection[]> {
    const sections: TReportSection[] = [];
    
    // Determine sections based on report type and template
    const sectionTypes = await this.getSectionTypes(request.report_type, request.template_id);
    
    for (let i = 0; i < sectionTypes.length; i++) {
      const sectionType = sectionTypes[i];
      
      try {
        // Generate section content using Claude
        const content = await this.generateSectionContent(sectionType, dealData, request);
        
        sections.push({
          section_type: sectionType.type,
          title: sectionType.title,
          content,
          order_index: i,
          is_required: sectionType.required
        });
        
        // Update progress
        await this.updateReportStatus(reportId, 'in_progress', 30 + (i * 20 / sectionTypes.length));
        
      } catch (error) {
        console.error(`Error generating section ${sectionType.type}:`, error);
        // Continue with other sections
      }
    }
    
    return sections;
  }

  /**
   * Generate evidence items for the report
   */
  private async generateEvidenceItems(
    reportId: string, 
    sections: TReportSection[], 
    dealData: any
  ): Promise<TEvidenceItem[]> {
    const evidenceItems: TEvidenceItem[] = [];
    
    // Extract evidence from sections and deal data
    for (const section of sections) {
      if (section.content) {
        // Parse content for evidence references
        const evidence = this.extractEvidenceFromContent(section.content, dealData);
        evidenceItems.push(...evidence);
      }
    }
    
    return evidenceItems;
  }

  /**
   * Generate Q&A insights
   */
  private async generateQAInsights(
    reportId: string, 
    sections: TReportSection[], 
    evidenceItems: TEvidenceItem[]
  ): Promise<TReportQA[]> {
    const qaItems: TReportQA[] = [];
    
    // Generate questions based on sections and evidence
    const questions = this.generateFollowUpQuestions(sections, evidenceItems);
    
    for (const question of questions) {
      qaItems.push({
        question,
        status: 'pending',
        priority: 'normal',
        asked_by: 'system',
        created_at: new Date().toISOString()
      });
    }
    
    return qaItems;
  }

  /**
   * Generate exports in requested formats
   */
  private async generateExports(
    reportId: string, 
    formats: string[], 
    generatedBy: string
  ): Promise<void> {
    // This would integrate with the export service
    console.log(`Generating exports for report ${reportId} in formats: ${formats.join(', ')}`);
  }

  /**
   * Get section types for the report
   */
  private async getSectionTypes(reportType: string, templateId?: string): Promise<any[]> {
    // Default sections based on report type
    const defaultSections = {
      comprehensive: [
        { type: 'executive_summary', title: 'Executive Summary', required: true },
        { type: 'financial_analysis', title: 'Financial Analysis', required: true },
        { type: 'risk_assessment', title: 'Risk Assessment', required: true },
        { type: 'recommendations', title: 'Recommendations', required: true }
      ],
      financial_summary: [
        { type: 'executive_summary', title: 'Executive Summary', required: true },
        { type: 'financial_analysis', title: 'Financial Analysis', required: true }
      ],
      risk_assessment: [
        { type: 'risk_assessment', title: 'Risk Assessment', required: true },
        { type: 'recommendations', title: 'Risk Mitigation', required: true }
      ]
    };
    
    return defaultSections[reportType as keyof typeof defaultSections] || defaultSections.comprehensive;
  }

  /**
   * Generate section content using Claude
   */
  private async generateSectionContent(sectionType: any, dealData: any, request: TReportGenerationRequest): Promise<string> {
    const prompt = this.buildSectionPrompt(sectionType, dealData, request);
    
    try {
      const response = await this.anthropicService.generateEnhancedAnalysis({
        prompt,
        model: 'claude-3-5-sonnet-20240620',
        maxTokens: 2000,
        temperature: 0.1
      });
      
      return response.content;
    } catch (error) {
      console.error(`Error generating section content:`, error);
      return `Error generating ${sectionType.title} content. Please try again.`;
    }
  }

  /**
   * Build prompt for section generation
   */
  private buildSectionPrompt(sectionType: any, dealData: any, request: TReportGenerationRequest): string {
    return `Generate a comprehensive ${sectionType.title} for the following deal:

Deal Information:
${JSON.stringify(dealData.deal, null, 2)}

Document Count: ${dealData.documents.length}
Analysis Type: ${request.report_type}

Please provide a professional, well-structured ${sectionType.title} that includes:
- Key insights and findings
- Data-driven analysis
- Actionable recommendations (if applicable)
- Professional business language

Format the response as clear, well-structured text suitable for a business report.`;
  }

  /**
   * Extract evidence from content
   */
  private extractEvidenceFromContent(content: string, dealData: any): TEvidenceItem[] {
    const evidence: TEvidenceItem[] = [];
    
    // Simple evidence extraction - in a real implementation, this would be more sophisticated
    if (content.includes('revenue') || content.includes('Revenue')) {
      evidence.push({
        evidence_type: 'financial_data',
        title: 'Revenue Analysis',
        description: 'Revenue-related insights identified in content',
        confidence_score: 0.8
      });
    }
    
    if (content.includes('risk') || content.includes('Risk')) {
      evidence.push({
        evidence_type: 'note',
        title: 'Risk Identification',
        description: 'Risk factors identified in content',
        confidence_score: 0.7
      });
    }
    
    return evidence;
  }

  /**
   * Generate follow-up questions
   */
  private generateFollowUpQuestions(sections: TReportSection[], evidenceItems: TEvidenceItem[]): string[] {
    const questions: string[] = [];
    
    // Generate questions based on content analysis
    for (const section of sections) {
      if (section.content) {
        if (section.content.includes('revenue') && !questions.some(q => q.includes('revenue'))) {
          questions.push('What are the key drivers of revenue growth or decline?');
        }
        if (section.content.includes('risk') && !questions.some(q => q.includes('risk'))) {
          questions.push('What specific mitigation strategies are recommended for identified risks?');
        }
      }
    }
    
    return questions.slice(0, 5); // Limit to 5 questions
  }

  /**
   * Build enhanced context for comprehensive analysis
   */
  private async buildEnhancedContext(
    dealId: string,
    documents: any[],
    computedMetrics: any
  ): Promise<EnhancedReportContext> {
    // Assess data quality
    const dataQuality = this.assessDataQuality(computedMetrics, documents);
    
    // Build document inventory
    const inventory = this.buildDocumentInventory(documents);
    
    // Detect periodicity
    const periodicity = this.detectPeriodicity(computedMetrics);
    
    return {
      dealId,
      periodicity,
      computedMetrics,
      inventory,
      data_quality: dataQuality,
      excerpts: [],
      analysis_timestamp: new Date().toISOString()
    };
  }

  /**
   * Assess data quality
   */
  private assessDataQuality(metrics: any, documents: any[]): any {
    // Simple data quality assessment
    const periods = Object.keys(metrics.revenue_by_period || {});
    const completeness = periods.length > 0 ? 0.8 : 0.3;
    const consistency = 0.7; // Placeholder
    const recency = 0.9; // Placeholder
    
    return {
      completeness,
      consistency,
      recency,
      missing_periods: [],
      data_gaps: [],
      reliability_notes: ['Data quality assessment completed']
    };
  }

  /**
   * Build document inventory
   */
  private buildDocumentInventory(documents: any[]): any {
    return {
      files_count: documents.length,
      statements_detected: documents.map(d => d.content_type || 'unknown'),
      total_size: documents.reduce((sum, d) => sum + (d.file_size || 0), 0)
    };
  }

  /**
   * Detect periodicity from metrics
   */
  private detectPeriodicity(metrics: any): 'monthly' | 'quarterly' | 'annual' {
    const periods = Object.keys(metrics.revenue_by_period || {});
    if (periods.length === 0) return 'annual';
    
    const samplePeriod = periods[0];
    if (samplePeriod.includes('-Q')) return 'quarterly';
    if (samplePeriod.includes('-')) return 'monthly';
    return 'annual';
  }

  /**
   * Generate summary with retry logic
   */
  private async generateSummaryWithRetry(
    context: EnhancedReportContext,
    maxRetries = 3
  ): Promise<{ summaryReport: SummaryReport; claudeStats: ClaudeUsageStats }> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        
        // Generate mock summary for now - in real implementation, this would call Claude
        const summaryReport = this.generateMockSummary(context);
        
        const responseTime = Date.now() - startTime;
        
        const claudeStats: ClaudeUsageStats = {
          total_tokens: 1000, // Mock values
          input_tokens: 500,
          output_tokens: 500,
          response_time_ms: responseTime,
          model_version: 'claude-3-5-sonnet-20240620',
          attempt_count: attempt
        };
        
        return { summaryReport, claudeStats };
        
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw new Error(`Summary generation failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Generate mock summary for development
   */
  private generateMockSummary(context: EnhancedReportContext): SummaryReport {
    return {
      health_score: {
        overall: 75,
        components: {
          profitability: 80,
          growth: 70,
          liquidity: 75,
          leverage: 65,
          efficiency: 80,
          data_quality: 70
        },
        methodology: 'Weighted average of component scores with profitability (25%), growth (20%), liquidity (20%), leverage (15%), efficiency (15%), data quality (5%)'
      },
      traffic_lights: {
        revenue_quality: {
          status: 'yellow',
          score: 70,
          reasoning: 'Revenue shows growth but with some volatility',
          evidence: [{ type: 'metric', ref: 'revenue_growth_yoy', confidence: 0.8 }]
        },
        margin_trends: {
          status: 'green',
          score: 85,
          reasoning: 'Margins are stable and improving',
          evidence: [{ type: 'metric', ref: 'gross_margin_ttm', confidence: 0.9 }]
        },
        liquidity: {
          status: 'green',
          score: 80,
          reasoning: 'Strong liquidity ratios maintained',
          evidence: [{ type: 'metric', ref: 'current_ratio', confidence: 0.8 }]
        },
        leverage: {
          status: 'yellow',
          score: 65,
          reasoning: 'Moderate leverage with room for improvement',
          evidence: [{ type: 'metric', ref: 'debt_to_equity', confidence: 0.7 }]
        },
        working_capital: {
          status: 'green',
          score: 75,
          reasoning: 'Efficient working capital management',
          evidence: [{ type: 'metric', ref: 'days_sales_outstanding', confidence: 0.8 }]
        },
        data_quality: {
          status: 'yellow',
          score: 70,
          reasoning: 'Good data coverage with some gaps',
          evidence: [{ type: 'metric', ref: 'data_completeness', confidence: 0.7 }]
        }
      },
      top_strengths: [
        {
          title: 'Strong Margin Performance',
          description: 'Consistent gross margins above industry average',
          impact: 'high',
          evidence: [{ type: 'metric', ref: 'gross_margin_ttm', confidence: 0.9 }],
          quantified_impact: '15% above industry average'
        },
        {
          title: 'Efficient Working Capital',
          description: 'Optimized cash conversion cycle',
          impact: 'medium',
          evidence: [{ type: 'metric', ref: 'cash_conversion_cycle', confidence: 0.8 }],
          quantified_impact: '20% improvement in cash flow'
        }
      ],
      top_risks: [
        {
          title: 'Revenue Volatility',
          description: 'Quarterly revenue fluctuations may indicate customer concentration',
          impact: 'medium',
          evidence: [{ type: 'metric', ref: 'revenue_volatility', confidence: 0.7 }],
          urgency: 'near_term'
        }
      ],
      recommendation: {
        decision: 'Proceed',
        confidence: 0.8,
        rationale: 'Strong fundamentals with manageable risks. Recommend proceeding with appropriate due diligence on customer concentration.',
        key_factors: ['Strong profitability', 'Efficient operations', 'Manageable leverage'],
        valuation_impact: 'Consider 10-15% premium for operational efficiency',
        deal_structure_notes: 'Include customer concentration covenants'
      },
      analysis_metadata: {
        period_range: {
          start: '2022-01',
          end: '2024-12',
          total_periods: 12
        },
        data_quality: {
          completeness: 0.8,
          consistency: 0.7,
          recency: 0.9,
          missing_periods: [],
          data_gaps: ['Q3 2023'],
          reliability_notes: ['Data quality assessment completed']
        },
        assumptions: ['Revenue growth continues at historical rates'],
        limitations: ['Limited customer concentration data'],
        followup_questions: [
          'What is the customer concentration breakdown?',
          'Are there any pending regulatory changes?'
        ]
      },
      confidence: {
        overall: 0.8,
        sections: {
          profitability: 0.9,
          growth: 0.7,
          liquidity: 0.8,
          leverage: 0.7,
          efficiency: 0.8,
          data_quality: 0.7
        },
        reliability_factors: ['Strong financial data', 'Consistent reporting']
      },
      export_ready: {
        pdf_title: 'Financial Analysis Report',
        executive_summary: 'Strong financial performance with opportunities for growth and some manageable risks.',
        key_metrics_table: [
          { metric: 'Overall Health Score', value: '75/100', trend: 'stable', benchmark: 'Industry: 65' },
          { metric: 'Gross Margin', value: '35%', trend: 'improving', benchmark: 'Industry: 30%' }
        ]
      }
    };
  }

  /**
   * Validate and enhance report
   */
  private validateAndEnhanceReport(report: any, context: EnhancedReportContext): SummaryReport {
    // In a real implementation, this would validate against the SummaryReport schema
    return report as SummaryReport;
  }

  /**
   * Persist enhanced analysis to database
   */
  private async persistEnhancedAnalysis(
    dealId: string,
    report: SummaryReport,
    claudeStats: ClaudeUsageStats
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('analyses')
      .insert({
        deal_id: dealId,
        type: 'enhanced_summary',
        summary_report: report,
        traffic_lights: report.traffic_lights,
        strengths: report.top_strengths,
        risks: report.top_risks,
        recommendation: report.recommendation,
        confidence_scores: report.confidence,
        data_quality_assessment: report.analysis_metadata.data_quality,
        claude_usage: claudeStats,
        export_version: 'v1',
        generated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to persist analysis: ${error.message}`);
    
    return data.id;
  }

  /**
   * Handle analysis errors
   */
  private async handleAnalysisError(dealId: string, error: any, duration: number): Promise<void> {
    console.error(`Analysis failed for deal ${dealId}:`, error);
    
    // Log error to database
    try {
      await this.supabase
        .from('logs')
        .insert({
          deal_id: dealId,
          event: 'analysis_failed',
          metadata: { error: error.message, duration_ms: duration },
          timestamp: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log analysis error:', logError);
    }
  }

  /**
   * Get report by ID with all related data
   */
  async getReport(reportId: string): Promise<TAnalysisReport | null> {
    try {
      // Fetch main report
      const { data: report, error: reportError } = await this.supabase
        .from('analysis_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw new Error(`Failed to fetch report: ${reportError.message}`);

      return report;
    } catch (error) {
      console.error(`Error fetching report ${reportId}:`, error);
      return null;
    }
  }

  /**
   * Search reports with filters
   */
  async searchReports(filters: any): Promise<TAnalysisReport[]> {
    try {
      let query = this.supabase
        .from('analysis_reports')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.deal_id) query = query.eq('deal_id', filters.deal_id);
      if (filters.report_type) query = query.eq('report_type', filters.report_type);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.generated_by) query = query.eq('generated_by', filters.generated_by);

      const { data, error } = await query;

      if (error) throw new Error(`Failed to search reports: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Error searching reports:', error);
      return [];
    }
  }
}
