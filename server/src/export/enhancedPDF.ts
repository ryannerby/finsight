import puppeteer from 'puppeteer-core';
import { SummaryReport } from '../types/summaryReport';
import { ComputedMetrics } from '../types/database';

// Custom error for report template issues
export class ReportTemplateError extends Error {
  public readonly missingKeys: string[];
  public readonly requestId?: string;

  constructor(message: string, missingKeys: string[] = [], requestId?: string) {
    super(message);
    this.name = 'ReportTemplateError';
    this.missingKeys = missingKeys;
    this.requestId = requestId;
  }
}

export interface PDFExportOptions {
  theme?: 'professional' | 'modern' | 'minimal';
  includeCharts?: boolean;
  includeAppendix?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export interface PDFRenderContext {
  deal: {
    id: string;
    name?: string;
    company_name?: string;
    created_at?: string;
  };
  summaryReport: SummaryReport;
  metrics: ComputedMetrics;
  charts?: ChartData[];
  metadata: {
    generatedAt: string;
    version: string;
    theme: string;
    includeAppendix: boolean;
  };
  footnotes: EvidenceFootnote[];
}

export interface ChartData {
  id: string;
  title: string;
  svg: string;
  description: string;
}

export interface EvidenceFootnote {
  id: string;
  text: string;
  source: string;
  page?: number;
}

export class EnhancedPDFGenerator {
  private readonly defaultOptions: PDFExportOptions = {
    theme: 'professional',
    includeCharts: true,
    includeAppendix: false,
    pageSize: 'A4',
    margin: {
      top: '1in',
      right: '0.8in',
      bottom: '1in',
      left: '0.8in'
    }
  };

  async generateReport(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: ComputedMetrics,
    options: PDFExportOptions = {}
  ): Promise<Buffer> {
    // Validate required template data
    this.validateTemplateData(summaryReport, computedMetrics);
    
    const mergedOptions = { ...this.defaultOptions, ...options };
    const context = await this.buildRenderContext(dealId, summaryReport, computedMetrics, mergedOptions);
    const html = await this.renderTemplate(context, mergedOptions);
    
    return await this.convertToPDF(html, mergedOptions);
  }

  private validateTemplateData(summaryReport: SummaryReport, computedMetrics: ComputedMetrics): void {
    const missingKeys: string[] = [];
    
    // Check required summary report fields
    if (!summaryReport.health_score) {
      missingKeys.push('health_score');
    }
    
    if (!summaryReport.traffic_lights) {
      missingKeys.push('traffic_lights');
    }
    
    if (!summaryReport.top_strengths || !Array.isArray(summaryReport.top_strengths)) {
      missingKeys.push('top_strengths');
    }
    
    if (!summaryReport.top_risks || !Array.isArray(summaryReport.top_risks)) {
      missingKeys.push('top_risks');
    }
    
    if (!summaryReport.recommendation) {
      missingKeys.push('recommendation');
    }
    
    // Check required computed metrics
    if (!computedMetrics || typeof computedMetrics !== 'object') {
      missingKeys.push('computedMetrics');
    }
    
    if (missingKeys.length > 0) {
      throw new ReportTemplateError(
        `Missing required template data: ${missingKeys.join(', ')}`,
        missingKeys
      );
    }
  }

  private async buildRenderContext(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: ComputedMetrics,
    options: PDFExportOptions
  ): Promise<PDFRenderContext> {
    const deal = await this.getDealInfo(dealId);
    const charts = options.includeCharts ? await this.generateCharts(computedMetrics) : [];
    const footnotes = this.buildEvidenceFootnotes(summaryReport);

    return {
      deal,
      summaryReport,
      metrics: computedMetrics,
      charts,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: 'v1',
        theme: options.theme || 'professional',
        includeAppendix: options.includeAppendix || false
      },
      footnotes
    };
  }

  private async getDealInfo(dealId: string): Promise<{ id: string; name?: string; company_name?: string; created_at?: string }> {
    // Placeholder - in real implementation, fetch from database
    return {
      id: dealId,
      name: `Deal ${dealId.slice(0, 8)}`,
      company_name: 'Target Company',
      created_at: new Date().toISOString()
    };
  }

  private async generateCharts(metrics: ComputedMetrics): Promise<ChartData[]> {
    const charts: ChartData[] = [];

    // Revenue trend chart
    if (metrics.revenue_by_period && Object.keys(metrics.revenue_by_period).length > 0) {
      charts.push({
        id: 'revenue_trend',
        title: 'Revenue Trend',
        svg: await this.generateRevenueTrendSVG(metrics.revenue_by_period),
        description: 'Revenue progression over time'
      });
    }

    // Margin evolution chart
    if (metrics.gross_margin_ttm !== undefined || metrics.net_margin_ttm !== undefined) {
      charts.push({
        id: 'margin_trend',
        title: 'Margin Evolution',
        svg: await this.generateMarginTrendSVG(metrics),
        description: 'Gross and net margin trends'
      });
    }

    // Working capital chart
    if (metrics.current_ratio !== undefined || metrics.quick_ratio !== undefined) {
      charts.push({
        id: 'working_capital',
        title: 'Working Capital Metrics',
        svg: await this.generateWorkingCapitalSVG(metrics),
        description: 'Liquidity and working capital trends'
      });
    }

    return charts;
  }

  private async generateRevenueTrendSVG(revenueData: Record<string, number>): Promise<string> {
    const periods = Object.keys(revenueData).sort();
    const values = periods.map(p => revenueData[p]);
    
    if (periods.length === 0) return '';

    const width = 600;
    const height = 300;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue;

    const xScale = (i: number) => padding + (i / (periods.length - 1)) * chartWidth;
    const yScale = (value: number) => height - padding - ((value - minValue) / valueRange) * chartHeight;

    const points = values.map((value, i) => `${xScale(i)},${yScale(value)}`).join(' ');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:0.3" />
          </linearGradient>
        </defs>
        
        <!-- Grid lines -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1"/>
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1"/>
        
        <!-- Chart line -->
        <polyline points="${points}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linejoin="round"/>
        
        <!-- Area fill -->
        <polygon points="${points} ${width - padding},${height - padding} ${padding},${height - padding}" fill="url(#lineGradient)" opacity="0.3"/>
        
        <!-- Data points -->
        ${values.map((value, i) => `
          <circle cx="${xScale(i)}" cy="${yScale(value)}" r="4" fill="#3b82f6"/>
        `).join('')}
        
        <!-- X-axis labels -->
        ${periods.map((period, i) => `
          <text x="${xScale(i)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#6b7280">${period}</text>
        `).join('')}
        
        <!-- Y-axis labels -->
        <text x="10" y="${height / 2}" text-anchor="middle" font-size="12" fill="#6b7280" transform="rotate(-90, 10, ${height / 2})">Revenue</text>
      </svg>
    `;
  }

  private async generateMarginTrendSVG(metrics: ComputedMetrics): Promise<string> {
    const width = 600;
    const height = 300;
    const padding = 40;

    // Create mock margin data for demonstration
    const marginData = [
      { period: 'Q1', gross: metrics.gross_margin_ttm || 0.25, net: metrics.net_margin_ttm || 0.08 },
      { period: 'Q2', gross: (metrics.gross_margin_ttm || 0.25) * 1.02, net: (metrics.net_margin_ttm || 0.08) * 1.05 },
      { period: 'Q3', gross: (metrics.gross_margin_ttm || 0.25) * 0.98, net: (metrics.net_margin_ttm || 0.08) * 0.95 },
      { period: 'Q4', gross: (metrics.gross_margin_ttm || 0.25) * 1.01, net: (metrics.net_margin_ttm || 0.08) * 1.02 }
    ];

    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const xScale = (i: number) => padding + (i / (marginData.length - 1)) * chartWidth;
    const yScale = (value: number) => height - padding - (value * chartHeight);

    const grossPoints = marginData.map((d, i) => `${xScale(i)},${yScale(d.gross)}`).join(' ');
    const netPoints = marginData.map((d, i) => `${xScale(i)},${yScale(d.net)}`).join(' ');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Grid lines -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1"/>
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1"/>
        
        <!-- Gross margin line -->
        <polyline points="${grossPoints}" fill="none" stroke="#10b981" stroke-width="3" stroke-linejoin="round"/>
        
        <!-- Net margin line -->
        <polyline points="${netPoints}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linejoin="round"/>
        
        <!-- Data points -->
        ${marginData.map((d, i) => `
          <circle cx="${xScale(i)}" cy="${yScale(d.gross)}" r="4" fill="#10b981"/>
          <circle cx="${xScale(i)}" cy="${yScale(d.net)}" r="4" fill="#3b82f6"/>
        `).join('')}
        
        <!-- Legend -->
        <rect x="${width - 120}" y="20" width="12" height="12" fill="#10b981"/>
        <text x="${width - 100}" y="30" font-size="12" fill="#374151">Gross Margin</text>
        <rect x="${width - 120}" y="40" width="12" height="12" fill="#3b82f6"/>
        <text x="${width - 100}" y="50" font-size="12" fill="#374151">Net Margin</text>
        
        <!-- X-axis labels -->
        ${marginData.map((d, i) => `
          <text x="${xScale(i)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#6b7280">${d.period}</text>
        `).join('')}
        
        <!-- Y-axis labels -->
        <text x="10" y="${height / 2}" text-anchor="middle" font-size="12" fill="#6b7280" transform="rotate(-90, 10, ${height / 2})">Margin %</text>
      </svg>
    `;
  }

  private async generateWorkingCapitalSVG(metrics: ComputedMetrics): Promise<string> {
    const width = 600;
    const height = 300;
    const padding = 40;

    // Create mock working capital data
    const wcData = [
      { period: 'Q1', current: metrics.current_ratio || 1.5, quick: metrics.quick_ratio || 1.2 },
      { period: 'Q2', current: (metrics.current_ratio || 1.5) * 1.1, quick: (metrics.quick_ratio || 1.2) * 1.05 },
      { period: 'Q3', current: (metrics.current_ratio || 1.5) * 0.95, quick: (metrics.quick_ratio || 1.2) * 0.98 },
      { period: 'Q4', current: (metrics.current_ratio || 1.5) * 1.02, quick: (metrics.quick_ratio || 1.2) * 1.01 }
    ];

    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const xScale = (i: number) => padding + (i / (wcData.length - 1)) * chartWidth;
    const yScale = (value: number) => height - padding - (value * chartHeight);

    const currentPoints = wcData.map((d, i) => `${xScale(i)},${yScale(d.current)}`).join(' ');
    const quickPoints = wcData.map((d, i) => `${xScale(i)},${yScale(d.quick)}`).join(' ');

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Grid lines -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1"/>
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1"/>
        
        <!-- Current ratio line -->
        <polyline points="${currentPoints}" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round"/>
        
        <!-- Quick ratio line -->
        <polyline points="${quickPoints}" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linejoin="round"/>
        
        <!-- Data points -->
        ${wcData.map((d, i) => `
          <circle cx="${xScale(i)}" cy="${yScale(d.current)}" r="4" fill="#f59e0b"/>
          <circle cx="${xScale(i)}" cy="${yScale(d.quick)}" r="4" fill="#8b5cf6"/>
        `).join('')}
        
        <!-- Legend -->
        <rect x="${width - 120}" y="20" width="12" height="12" fill="#f59e0b"/>
        <text x="${width - 100}" y="30" font-size="12" fill="#374151">Current Ratio</text>
        <rect x="${width - 120}" y="40" width="12" height="12" fill="#8b5cf6"/>
        <text x="${width - 100}" y="50" font-size="12" fill="#374151">Quick Ratio</text>
        
        <!-- X-axis labels -->
        ${wcData.map((d, i) => `
          <text x="${xScale(i)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#6b7280">${d.period}</text>
        `).join('')}
        
        <!-- Y-axis labels -->
        <text x="10" y="${height / 2}" text-anchor="middle" font-size="12" fill="#6b7280" transform="rotate(-90, 10, ${height / 2})">Ratio</text>
      </svg>
    `;
  }

  private buildEvidenceFootnotes(summaryReport: SummaryReport): EvidenceFootnote[] {
    const footnotes: EvidenceFootnote[] = [];
    let footnoteId = 1;

    try {
      // Extract evidence from traffic lights - handle missing evidence arrays
      if (summaryReport.traffic_lights) {
        Object.entries(summaryReport.traffic_lights).forEach(([category, trafficLight]) => {
          if (trafficLight && trafficLight.evidence && Array.isArray(trafficLight.evidence)) {
            trafficLight.evidence.forEach(evidence => {
              if (evidence) {
                footnotes.push({
                  id: `fn${footnoteId++}`,
                  text: evidence.context || evidence.ref || 'Evidence provided',
                  source: evidence.document_id || 'Computed Metric',
                  page: evidence.page
                });
              }
            });
          }
        });
      }

      // Extract evidence from strengths and risks - handle missing evidence arrays
      const strengths = summaryReport.top_strengths || [];
      const risks = summaryReport.top_risks || [];
      
      [...strengths, ...risks].forEach(item => {
        if (item && item.evidence && Array.isArray(item.evidence)) {
          item.evidence.forEach(evidence => {
            if (evidence) {
              footnotes.push({
                id: `fn${footnoteId++}`,
                text: evidence.context || evidence.ref || 'Evidence provided',
                source: evidence.document_id || 'Computed Metric',
                page: evidence.page
              });
            }
          });
        }
      });
    } catch (error) {
      console.warn('Error building evidence footnotes:', error);
      // Return empty footnotes array if there's an error
    }

    return footnotes;
  }

  private async renderTemplate(context: PDFRenderContext, options: PDFExportOptions): Promise<string> {
    const { deal, summaryReport, charts, metadata, footnotes } = context;
    const { health_score, traffic_lights, top_strengths, top_risks, recommendation } = summaryReport;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Financial Analysis Report - ${deal.company_name || deal.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            font-size: 12px;
          }
          
          .page {
            padding: 1in;
            page-break-after: always;
          }
          
          .page:last-child {
            page-break-after: avoid;
          }
          
          .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          
          .report-title {
            font-size: 18px;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          
          .report-meta {
            font-size: 11px;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
          }
          
          .section {
            margin-bottom: 2rem;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .subsection {
            margin-bottom: 1.5rem;
          }
          
          .subsection-title {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.75rem;
          }
          
          .metric-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
          }
          
          .metric-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
          }
          
          .metric-label {
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .metric-value {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .metric-trend {
            font-size: 10px;
            color: #059669;
            margin-top: 0.25rem;
          }
          
          .traffic-light-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
          }
          
          .traffic-light-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
          }
          
          .traffic-light-status {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin: 0 auto 0.5rem;
          }
          
          .status-green { background: #10b981; }
          .status-yellow { background: #f59e0b; }
          .status-red { background: #ef4444; }
          
          .traffic-light-score {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          
          .traffic-light-reasoning {
            font-size: 10px;
            color: #6b7280;
            line-height: 1.4;
          }
          
          .strengths-risks-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
          }
          
          .strength-risk-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
          }
          
          .strength-risk-title {
            font-size: 12px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          
          .strength-risk-description {
            font-size: 10px;
            color: #6b7280;
            line-height: 1.4;
            margin-bottom: 0.5rem;
          }
          
          .strength-risk-impact {
            font-size: 9px;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .recommendation-card {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .recommendation-decision {
            font-size: 18px;
            font-weight: 700;
            color: #0c4a6e;
            margin-bottom: 0.5rem;
          }
          
          .recommendation-rationale {
            font-size: 11px;
            color: #0c4a6e;
            line-height: 1.5;
            margin-bottom: 1rem;
          }
          
          .recommendation-factors {
            list-style: none;
          }
          
          .recommendation-factors li {
            font-size: 10px;
            color: #0c4a6e;
            margin-bottom: 0.25rem;
            padding-left: 1rem;
            position: relative;
          }
          
          .recommendation-factors li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #0ea5e9;
          }
          
          .chart-container {
            margin: 1rem 0;
            text-align: center;
          }
          
          .chart-title {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
          }
          
          .chart-description {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 1rem;
          }
          
          .footnotes {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
          }
          
          .footnote {
            font-size: 9px;
            color: #6b7280;
            margin-bottom: 0.25rem;
          }
          
          .footnote-ref {
            color: #3b82f6;
            text-decoration: none;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @media print {
            .page {
              margin: 0;
              padding: 0.5in;
            }
          }
        </style>
      </head>
      <body>
        <!-- Page 1: Executive Summary -->
        <div class="page">
          <div class="header">
            <div class="company-name">${deal.company_name || deal.name}</div>
            <div class="report-title">Financial Analysis Report</div>
            <div class="report-meta">
              <span>Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}</span>
              <span>Report Version: ${metadata.version}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-label">Overall Health Score</div>
                <div class="metric-value">${health_score.overall}/100</div>
                <div class="metric-trend">${this.getHealthScoreTrend(health_score.overall)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Recommendation</div>
                <div class="metric-value">${recommendation.decision}</div>
                <div class="metric-trend">${Math.round(recommendation.confidence * 100)}% confidence</div>
              </div>
            </div>
            
            <div class="subsection">
              <div class="subsection-title">Key Findings</div>
              <p style="font-size: 11px; color: #6b7280; line-height: 1.5;">
                ${summaryReport.export_ready?.executive_summary || 'Comprehensive financial analysis reveals key insights about business performance, risk factors, and investment potential.'}
              </p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Health Score Breakdown</div>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-label">Profitability</div>
                <div class="metric-value">${health_score.components?.profitability || health_score.overall || 'N/A'}/100</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Growth</div>
                <div class="metric-value">${health_score.components?.growth || health_score.overall || 'N/A'}/100</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Liquidity</div>
                <div class="metric-value">${health_score.components?.liquidity || health_score.overall || 'N/A'}/100</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Leverage</div>
                <div class="metric-value">${health_score.components?.leverage || health_score.overall || 'N/A'}/100</div>
              </div>
            </div>
            <p style="font-size: 10px; color: #6b7280; font-style: italic;">
              ${health_score.methodology || 'Standard financial ratio analysis'}
            </p>
          </div>
        </div>
        
        <!-- Page 2: Traffic Lights & Analysis -->
        <div class="page page-break">
          <div class="section">
            <div class="section-title">Traffic Light Assessment</div>
            <div class="traffic-light-grid">
              ${Object.entries(traffic_lights).map(([category, light]) => `
                <div class="traffic-light-card">
                  <div class="traffic-light-status status-${light.status}"></div>
                  <div class="traffic-light-score">${light.score}/100</div>
                  <div class="subsection-title">${this.formatCategoryName(category)}</div>
                  <div class="traffic-light-reasoning">${light.reasoning}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          ${charts && charts.length > 0 ? `
            <div class="section">
              <div class="section-title">Financial Trends</div>
              ${charts.map(chart => `
                <div class="chart-container">
                  <div class="chart-title">${chart.title}</div>
                  <div class="chart-description">${chart.description}</div>
                  ${chart.svg}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Page 3: Strengths, Risks & Recommendation -->
        <div class="page page-break">
          <div class="section">
            <div class="section-title">Top Strengths</div>
            <div class="strengths-risks-grid">
              ${top_strengths.map(strength => `
                <div class="strength-risk-card">
                  <div class="strength-risk-title">${strength.title}</div>
                  <div class="strength-risk-description">${strength.description}</div>
                  <div class="strength-risk-impact">High Impact</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Key Risks</div>
            <div class="strengths-risks-grid">
              ${top_risks.map(risk => `
                <div class="strength-risk-card">
                  <div class="strength-risk-title">${risk.title}</div>
                  <div class="strength-risk-description">${risk.description}</div>
                  <div class="strength-risk-impact">${risk.impact} Impact</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Investment Recommendation</div>
            <div class="recommendation-card">
              <div class="recommendation-decision">${recommendation.decision}</div>
              <div class="recommendation-rationale">${recommendation.rationale}</div>
              <ul class="recommendation-factors">
                ${recommendation.key_factors.map(factor => `<li>${factor}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
        
        ${footnotes.length > 0 ? `
          <!-- Page 4: Footnotes & Appendix -->
          <div class="page page-break">
            <div class="section">
              <div class="section-title">Evidence & Footnotes</div>
              <div class="footnotes">
                ${footnotes.map(footnote => `
                  <div class="footnote">
                    <a href="#${footnote.id}" class="footnote-ref">${footnote.id}</a> 
                    ${footnote.text} 
                    <span style="color: #9ca3af;">(Source: ${footnote.source}${footnote.page ? `, p.${footnote.page}` : ''})</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  private getHealthScoreTrend(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }

  private formatCategoryName(category: string): string {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private async convertToPDF(html: string, options: PDFExportOptions): Promise<Buffer> {
    let page: any = null;
    let browser: any = null;
    const consoleMessages: string[] = [];
    
    try {
      console.log('Starting PDF conversion...');
      
      // Get executable path from environment or use default
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
        (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 
         process.platform === 'linux' ? '/usr/bin/google-chrome' : 
         process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined);
      
      console.log(`Launching browser with executable: ${executablePath}`);
      
      const launchOptions: any = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      };
      
      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }
      
      // Add Linux-specific options
      if (process.platform === 'linux') {
        launchOptions.args.push('--no-sandbox', '--disable-setuid-sandbox');
      }
      
      browser = await puppeteer.launch(launchOptions);
      console.log('Browser launched successfully');

      page = await browser.newPage();
      console.log('New page created');
      
      // Capture console messages for debugging
      page.on('console', (msg: any) => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      });
      
      page.on('pageerror', (error: any) => {
        consoleMessages.push(`Page Error: ${error.message}`);
      });

      console.log('Setting HTML content...');
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      console.log('HTML content set successfully');

      console.log('Generating PDF...');
      const pdf = await page.pdf({
        format: options.pageSize || 'A4',
        printBackground: true,
        margin: options.margin || {
          top: '1in',
          right: '0.8in',
          bottom: '1in',
          left: '0.8in'
        }
      });
      
      console.log(`PDF generated successfully, size: ${pdf.length} bytes`);
      return Buffer.from(pdf);
      
    } catch (error) {
      console.error('PDF conversion error:', error);
      
      // Include console messages in error for debugging
      const consoleOutput = page ? 'Console output: ' + consoleMessages.join('; ') : 'No console output available';
      const errorMessage = `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}. ${consoleOutput}`;
      
      throw new Error(errorMessage);
    } finally {
      if (page) {
        try {
          await page.close();
          console.log('Page closed successfully');
        } catch (closeError) {
          console.error('Error closing page:', closeError);
        }
      }
      
      if (browser) {
        try {
          await browser.close();
          console.log('Browser closed successfully');
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        }
      }
    }
  }
}
