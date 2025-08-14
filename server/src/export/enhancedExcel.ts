import ExcelJS from 'exceljs';
import { SummaryReport } from '../types/summaryReport';
import { ComputedMetrics } from '../types/database';

export interface ExcelExportOptions {
  includeCharts?: boolean;
  includeRawData?: boolean;
  includeEvidence?: boolean;
  theme?: 'professional' | 'modern' | 'minimal';
  sheetProtection?: boolean;
}

export interface ExcelSheetData {
  name: string;
  data: any[][];
  headers?: string[];
  columnWidths?: number[];
  conditionalFormatting?: ConditionalFormattingRule[];
}

export interface ConditionalFormattingRule {
  type: 'cellIs' | 'containsText' | 'beginsWith' | 'endsWith' | 'expression';
  criteria: string | number;
  format: Partial<ExcelJS.Style>;
  range: string;
}

export class EnhancedExcelGenerator {
  private readonly defaultOptions: ExcelExportOptions = {
    includeCharts: true,
    includeRawData: true,
    includeEvidence: true,
    theme: 'professional',
    sheetProtection: false
  };

  async generateWorkbook(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: ComputedMetrics,
    options: ExcelExportOptions = {}
  ): Promise<Buffer> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = 'Finsight Financial Analysis';
    workbook.lastModifiedBy = 'Finsight System';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.properties.date1904 = false;

    // Add sheets
    await this.addExecutiveSummary(workbook, summaryReport, dealId);
    await this.addFinancialMetrics(workbook, computedMetrics);
    await this.addTrafficLightDetails(workbook, summaryReport.traffic_lights);
    await this.addStrengthsAndRisks(workbook, summaryReport);
    await this.addRecommendation(workbook, summaryReport.recommendation);
    
    if (mergedOptions.includeEvidence) {
      await this.addEvidenceMap(workbook, summaryReport);
    }
    
    if (mergedOptions.includeRawData) {
      await this.addRawDataSheet(workbook, computedMetrics);
    }

    // Apply theme
    this.applyTheme(workbook, mergedOptions.theme || 'professional');

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async addExecutiveSummary(
    workbook: ExcelJS.Workbook,
    summaryReport: SummaryReport,
    dealId: string
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Executive Summary');
    
    // Set column widths
    worksheet.columns = [
      { key: 'A', width: 25 },
      { key: 'B', width: 20 },
      { key: 'C', width: 25 },
      { key: 'D', width: 20 }
    ];

    // Company header
    worksheet.mergeCells('A1:D1');
    const companyHeader = worksheet.getCell('A1');
    companyHeader.value = 'Financial Analysis Report';
    companyHeader.font = { size: 18, bold: true, color: { argb: 'FF1F2937' } };
    companyHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    companyHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };

    // Deal info
    worksheet.mergeCells('A3:B3');
    worksheet.getCell('A3').value = 'Deal ID:';
    worksheet.getCell('A3').font = { bold: true };
    worksheet.getCell('C3').value = dealId;
    
    worksheet.mergeCells('A4:B4');
    worksheet.getCell('A4').value = 'Generated:';
    worksheet.getCell('A4').font = { bold: true };
    worksheet.getCell('C4').value = new Date().toLocaleDateString();

    // Health Score
    worksheet.mergeCells('A6:D6');
    worksheet.getCell('A6').value = 'Overall Health Assessment';
    worksheet.getCell('A6').font = { size: 14, bold: true, color: { argb: 'FF3B82F6' } };
    worksheet.getCell('A6').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFF6FF' }
    };

    const healthScore = summaryReport.health_score;
    worksheet.getCell('A7').value = 'Overall Score:';
    worksheet.getCell('A7').font = { bold: true };
    worksheet.getCell('B7').value = healthScore.overall;
    worksheet.getCell('B7').font = { size: 16, bold: true, color: { argb: this.getScoreColor(healthScore.overall) } };

    // Component scores
    const components = [
      ['Profitability', healthScore.components.profitability],
      ['Growth', healthScore.components.growth],
      ['Liquidity', healthScore.components.liquidity],
      ['Leverage', healthScore.components.leverage],
      ['Efficiency', healthScore.components.efficiency],
      ['Data Quality', healthScore.components.data_quality]
    ];

    worksheet.getCell('A9').value = 'Component Scores:';
    worksheet.getCell('A9').font = { bold: true, size: 12 };

    components.forEach(([label, score], index) => {
      const row = 10 + index;
      worksheet.getCell(`A${row}`).value = label;
      worksheet.getCell(`B${row}`).value = score;
      worksheet.getCell(`B${row}`).font = { color: { argb: this.getScoreColor(score as number) } };
    });

    // Recommendation
    worksheet.mergeCells('A17:D17');
    worksheet.getCell('A17').value = 'Investment Recommendation';
    worksheet.getCell('A17').font = { size: 14, bold: true, color: { argb: 'FF059669' } };
    worksheet.getCell('A17').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0FDF4' }
    };

    worksheet.getCell('A18').value = 'Decision:';
    worksheet.getCell('A18').font = { bold: true };
    worksheet.getCell('B18').value = summaryReport.recommendation.decision;
    worksheet.getCell('B18').font = { size: 14, bold: true, color: { argb: this.getDecisionColor(summaryReport.recommendation.decision) } };

    worksheet.getCell('A19').value = 'Confidence:';
    worksheet.getCell('A19').font = { bold: true };
    worksheet.getCell('B19').value = `${Math.round(summaryReport.recommendation.confidence * 100)}%`;

    // Add borders
    this.addBorders(worksheet, 'A1:D20');
  }

  private async addFinancialMetrics(
    workbook: ExcelJS.Workbook,
    computedMetrics: ComputedMetrics
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Financial Metrics');
    
    // Set column widths
    worksheet.columns = [
      { key: 'A', width: 30 },
      { key: 'B', width: 15 },
      { key: 'C', width: 15 },
      { key: 'D', width: 15 },
      { key: 'E', width: 20 },
      { key: 'F', width: 20 }
    ];

    // Headers
    const headers = ['Metric', 'Latest Value', 'Previous', 'Change %', 'Trend', 'Benchmark'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };

    // Key metrics data
    const metricsData = [
      ['Revenue Growth (YoY)', computedMetrics.revenue_growth_yoy, null, null, this.getTrendIcon(computedMetrics.revenue_growth_yoy), 'Industry Median'],
      ['Gross Margin (TTM)', computedMetrics.gross_margin_ttm, null, null, this.getTrendIcon(computedMetrics.gross_margin_ttm), 'Peer Average'],
      ['Net Margin (TTM)', computedMetrics.net_margin_ttm, null, null, this.getTrendIcon(computedMetrics.net_margin_ttm), 'Peer Average'],
      ['Current Ratio', computedMetrics.current_ratio, null, null, this.getTrendIcon(computedMetrics.current_ratio), '2.0'],
      ['Quick Ratio', computedMetrics.quick_ratio, null, null, this.getTrendIcon(computedMetrics.quick_ratio), '1.0'],
      ['Debt-to-Equity', computedMetrics.debt_to_equity_ratio, null, null, this.getTrendIcon(computedMetrics.debt_to_equity_ratio), '0.5'],
      ['ROE (TTM)', computedMetrics.roe_ttm, null, null, this.getTrendIcon(computedMetrics.roe_ttm), '15%'],
      ['ROA (TTM)', computedMetrics.roa_ttm, null, null, this.getTrendIcon(computedMetrics.roa_ttm), '8%']
    ];

    metricsData.forEach(rowData => {
      const row = worksheet.addRow(rowData);
      
      // Format numbers
              if (typeof rowData[1] === 'number') {
          const metricName = String(rowData[0] || '');
          if (metricName.includes('Margin') || metricName.includes('Growth') || metricName.includes('RO')) {
            row.getCell(2).numFmt = '0.00%';
          } else {
            row.getCell(2).numFmt = '#,##0.00';
          }
        }
    });

    // Add conditional formatting
    this.addConditionalFormatting(worksheet, 'B2:B9', {
      type: 'cellIs',
      criteria: 'between',
      minimum: 0,
      maximum: 100,
      format: {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
      }
    });

    // Add borders
    this.addBorders(worksheet, `A1:F${metricsData.length + 1}`);
  }

  private async addTrafficLightDetails(
    workbook: ExcelJS.Workbook,
    trafficLights: SummaryReport['traffic_lights']
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Traffic Light Assessment');
    
    // Set column widths
    worksheet.columns = [
      { key: 'A', width: 25 },
      { key: 'B', width: 15 },
      { key: 'C', width: 15 },
      { key: 'D', width: 50 },
      { key: 'E', width: 30 }
    ];

    // Headers
    const headers = ['Category', 'Status', 'Score', 'Reasoning', 'Evidence'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }
    };

    // Traffic light data
    Object.entries(trafficLights).forEach(([category, light]) => {
      const row = worksheet.addRow([
        this.formatCategoryName(category),
        light.status.toUpperCase(),
        light.score,
        light.reasoning,
        light.evidence.map(e => e.ref).join(', ')
      ]);

      // Color code the status
      const statusCell = row.getCell(2);
      statusCell.font = { bold: true, color: { argb: this.getStatusColor(light.status) } };

      // Color code the score
      const scoreCell = row.getCell(3);
      scoreCell.font = { color: { argb: this.getScoreColor(light.score) } };
    });

    // Add borders
    this.addBorders(worksheet, `A1:E${Object.keys(trafficLights).length + 1}`);
  }

  private async addStrengthsAndRisks(
    workbook: ExcelJS.Workbook,
    summaryReport: SummaryReport
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Strengths & Risks');
    
    // Set column widths
    worksheet.columns = [
      { key: 'A', width: 30 },
      { key: 'B', width: 50 },
      { key: 'C', width: 15 },
      { key: 'D', width: 15 },
      { key: 'E', width: 30 }
    ];

    // Strengths section
    worksheet.mergeCells('A1:E1');
    const strengthsHeader = worksheet.getCell('A1');
    strengthsHeader.value = 'Top Strengths';
    strengthsHeader.font = { size: 14, bold: true, color: { argb: 'FF059669' } };
    strengthsHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0FDF4' }
    };
    strengthsHeader.alignment = { horizontal: 'center' };

    const strengthHeaders = ['Title', 'Description', 'Impact', 'Urgency', 'Evidence'];
    const strengthHeaderRow = worksheet.addRow(strengthHeaders);
    strengthHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    strengthHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }
    };

    summaryReport.top_strengths.forEach(strength => {
      worksheet.addRow([
        strength.title,
        strength.description,
        strength.impact,
        strength.urgency || 'N/A',
        strength.evidence.map(e => e.ref).join(', ')
      ]);
    });

    // Risks section
    const risksStartRow = summaryReport.top_strengths.length + 4;
    worksheet.mergeCells(`A${risksStartRow}:E${risksStartRow}`);
    const risksHeader = worksheet.getCell(`A${risksStartRow}`);
    risksHeader.value = 'Key Risks';
    risksHeader.font = { size: 14, bold: true, color: { argb: 'FFDC2626' } };
    risksHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEF2F2' }
    };
    risksHeader.alignment = { horizontal: 'center' };

    const riskHeaderRow = worksheet.addRow(strengthHeaders);
    riskHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    riskHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEF4444' }
    };

    summaryReport.top_risks.forEach(risk => {
      worksheet.addRow([
        risk.title,
        risk.description,
        risk.impact,
        risk.urgency || 'N/A',
        risk.evidence.map(e => e.ref).join(', ')
      ]);
    });

    // Add borders
    this.addBorders(worksheet, `A1:E${risksStartRow + summaryReport.top_risks.length + 1}`);
  }

  private async addRecommendation(
    workbook: ExcelJS.Workbook,
    recommendation: SummaryReport['recommendation']
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Investment Recommendation');
    
    // Set column widths
    worksheet.columns = [
      { key: 'A', width: 25 },
      { key: 'B', width: 50 }
    ];

    // Recommendation header
    worksheet.mergeCells('A1:B1');
    const header = worksheet.getCell('A1');
    header.value = 'Investment Decision';
    header.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };
    header.alignment = { horizontal: 'center' };

    // Decision details
    const decisionData = [
      ['Decision', recommendation.decision],
      ['Confidence', `${Math.round(recommendation.confidence * 100)}%`],
      ['Rationale', recommendation.rationale],
      ['Valuation Impact', recommendation.valuation_impact || 'Not specified'],
      ['Deal Structure Notes', recommendation.deal_structure_notes || 'Not specified']
    ];

    decisionData.forEach(([label, value], index) => {
      const row = 3 + index;
      worksheet.getCell(`A${row}`).value = label;
      worksheet.getCell(`A${row}`).font = { bold: true };
      worksheet.getCell(`B${row}`).value = value;
      
      // Color code the decision
      if (label === 'Decision') {
        worksheet.getCell(`B${row}`).font = { 
          bold: true, 
          size: 14, 
          color: { argb: this.getDecisionColor(value as string) } 
        };
      }
    });

    // Key factors
    worksheet.getCell('A9').value = 'Key Factors:';
    worksheet.getCell('A9').font = { bold: true, size: 12 };
    worksheet.getCell('A9').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F9FF' }
    };

    recommendation.key_factors.forEach((factor, index) => {
      worksheet.getCell(`A${10 + index}`).value = `• ${factor}`;
    });

    // Add borders
    this.addBorders(worksheet, `A1:B${10 + recommendation.key_factors.length}`);
  }

  private async addEvidenceMap(
    workbook: ExcelJS.Workbook,
    summaryReport: SummaryReport
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Evidence Map');
    
    // Set column widths
    worksheet.columns = [
      { key: 'A', width: 20 },
      { key: 'B', width: 15 },
      { key: 'C', width: 50 },
      { key: 'D', width: 15 },
      { key: 'E', width: 15 },
      { key: 'F', width: 20 }
    ];

    // Headers
    const headers = ['Evidence ID', 'Type', 'Description', 'Source', 'Page', 'Confidence'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B5CF6' }
    };

    // Collect all evidence
    const allEvidence: any[] = [];
    
    // From traffic lights
    Object.entries(summaryReport.traffic_lights).forEach(([category, light]) => {
      light.evidence.forEach(evidence => {
        allEvidence.push([
          evidence.ref,
          evidence.type,
          evidence.context || evidence.quote || evidence.ref,
          evidence.document_id || 'Computed',
          evidence.page || 'N/A',
          evidence.confidence
        ]);
      });
    });

    // From strengths and risks
    [...summaryReport.top_strengths, ...summaryReport.top_risks].forEach(item => {
      item.evidence.forEach(evidence => {
        allEvidence.push([
          evidence.ref,
          evidence.type,
          evidence.context || evidence.quote || evidence.ref,
          evidence.document_id || 'Computed',
          evidence.page || 'N/A',
          evidence.confidence
        ]);
      });
    });

    // Add evidence rows
    allEvidence.forEach(evidence => {
      const row = worksheet.addRow(evidence);
      
      // Format confidence as percentage
      if (evidence[5] !== undefined) {
        row.getCell(6).numFmt = '0.00%';
      }
    });

    // Add borders
    this.addBorders(worksheet, `A1:F${allEvidence.length + 1}`);
  }

  private async addRawDataSheet(
    workbook: ExcelJS.Workbook,
    computedMetrics: ComputedMetrics
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Raw Data');
    
    // Set column widths
    worksheet.columns = [
      { key: 'A', width: 30 },
      { key: 'B', width: 20 },
      { key: 'C', width: 20 },
      { key: 'D', width: 20 }
    ];

    // Headers
    const headers = ['Metric', 'Value', 'Unit', 'Notes'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6B7280' }
    };

    // Add all computed metrics
    const metrics = Object.entries(computedMetrics);
    metrics.forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const row = worksheet.addRow([
          this.formatMetricName(key),
          value,
          this.getMetricUnit(key),
          this.getMetricNotes(key)
        ]);

        // Format numbers
        if (typeof value === 'number') {
          if (key.includes('margin') || key.includes('ratio') || key.includes('growth')) {
            row.getCell(2).numFmt = '0.00%';
          } else if (key.includes('revenue') || key.includes('assets') || key.includes('equity')) {
            row.getCell(2).numFmt = '#,##0';
          } else {
            row.getCell(2).numFmt = '#,##0.00';
          }
        }
      }
    });

    // Add borders
    this.addBorders(worksheet, `A1:D${metrics.length + 1}`);
  }

  private applyTheme(workbook: ExcelJS.Workbook, theme: string): void {
    // Apply consistent styling across all worksheets
    workbook.eachSheet(worksheet => {
      // Set default row height
      worksheet.properties.defaultRowHeight = 20;
      
      // Style all cells with default font
      worksheet.eachRow(row => {
        row.eachCell(cell => {
          if (!cell.font) {
            cell.font = { name: 'Calibri', size: 11 };
          }
        });
      });
    });
  }

  private addBorders(worksheet: ExcelJS.Worksheet, range: string): void {
    const [start, end] = range.split(':');
    const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
    const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
    const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
    const endRow = parseInt(end.match(/\d+/)?.[0] || '1');

    // Add borders to the range
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol.charCodeAt(0) - 65; col <= endCol.charCodeAt(0) - 65; col++) {
        const cell = worksheet.getCell(row, col + 1);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      }
    }
  }

  private addConditionalFormatting(
    worksheet: ExcelJS.Worksheet,
    range: string,
    rule: any
  ): void {
    // Note: ExcelJS conditional formatting is limited
    // This is a placeholder for more advanced formatting
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return 'FF059669'; // Green
    if (score >= 60) return 'FF10B981'; // Light green
    if (score >= 40) return 'FFF59E0B'; // Yellow
    return 'FFEF4444'; // Red
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'green': return 'FF059669';
      case 'yellow': return 'FFF59E0B';
      case 'red': return 'FFEF4444';
      default: return 'FF6B7280';
    }
  }

  private getDecisionColor(decision: string): string {
    switch (decision) {
      case 'Proceed': return 'FF059669';
      case 'Caution': return 'FFF59E0B';
      case 'Pass': return 'FFEF4444';
      default: return 'FF6B7280';
    }
  }

  private getTrendIcon(value: number | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    if (value > 0) return '↗ Improving';
    if (value < 0) return '↘ Declining';
    return '→ Stable';
  }

  private formatCategoryName(category: string): string {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private formatMetricName(key: string): string {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private getMetricUnit(key: string): string {
    if (key.includes('margin') || key.includes('ratio') || key.includes('growth')) return '%';
    if (key.includes('revenue') || key.includes('assets') || key.includes('equity')) return 'USD';
    return 'Unit';
  }

  private getMetricNotes(key: string): string {
    if (key.includes('ttm')) return 'Trailing Twelve Months';
    if (key.includes('yoy')) return 'Year over Year';
    if (key.includes('ratio')) return 'Financial Ratio';
    return '';
  }
}
