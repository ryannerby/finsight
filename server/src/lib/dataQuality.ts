/**
 * Data Quality Assessment Helpers
 * Provides utilities for assessing and scoring data quality in financial analysis
 */

import { TEvidenceItem, TReportSection } from '../types/analysis';

/**
 * Data quality score interface
 */
export interface DataQualityScore {
  overall: number; // 0-100
  completeness: number; // 0-100
  accuracy: number; // 0-100
  consistency: number; // 0-100
  timeliness: number; // 0-100
  details: {
    missingFields: string[];
    inconsistencies: string[];
    dataGaps: string[];
    recommendations: string[];
  };
}

/**
 * Evidence quality assessment interface
 */
export interface EvidenceQualityAssessment {
  evidenceId: string;
  qualityScore: number; // 0-100
  confidenceLevel: 'high' | 'medium' | 'low';
  reliability: number; // 0-1
  issues: string[];
  recommendations: string[];
}

/**
 * Document coverage assessment interface
 */
export interface DocumentCoverageAssessment {
  dealId: string;
  totalDocuments: number;
  requiredDocumentTypes: string[];
  presentDocumentTypes: string[];
  missingDocumentTypes: string[];
  coverageScore: number; // 0-100
  dataCompleteness: number; // 0-100
  recommendations: string[];
}

/**
 * Data Quality Assessment Service
 */
export class DataQualityService {
  /**
   * Assess overall data quality for a deal
   */
  static assessDealDataQuality(
    dealData: any,
    documents: any[],
    analyses: any[],
    evidenceItems: TEvidenceItem[]
  ): DataQualityScore {
    const scores = {
      completeness: this.assessCompleteness(dealData, documents, analyses),
      accuracy: this.assessAccuracy(documents, analyses, evidenceItems),
      consistency: this.assessConsistency(documents, analyses),
      timeliness: this.assessTimeliness(documents, analyses)
    };

    const overall = Math.round(
      (scores.completeness + scores.accuracy + scores.consistency + scores.timeliness) / 4
    );

    const details = this.generateQualityDetails(dealData, documents, analyses, evidenceItems);

    return {
      overall,
      ...scores,
      details
    };
  }

  /**
   * Assess data completeness
   */
  private static assessCompleteness(dealData: any, documents: any[], analyses: any[]): number {
    let score = 100;
    const missingFields: string[] = [];

    // Check deal data completeness
    if (!dealData.title) {
      score -= 10;
      missingFields.push('Deal title');
    }
    if (!dealData.description) {
      score -= 5;
      missingFields.push('Deal description');
    }

    // Check document coverage
    if (documents.length === 0) {
      score -= 30;
      missingFields.push('Financial documents');
    } else if (documents.length < 3) {
      score -= 15;
      missingFields.push('Sufficient financial documents');
    }

    // Check analysis coverage
    if (analyses.length === 0) {
      score -= 20;
      missingFields.push('Financial analysis');
    }

    return Math.max(0, score);
  }

  /**
   * Assess data accuracy
   */
  private static assessAccuracy(documents: any[], analyses: any[], evidenceItems: TEvidenceItem[]): number {
    let score = 100;

    // Check document quality
    for (const doc of documents) {
      if (!doc.mime_type) score -= 5;
      if (!doc.file_size || doc.file_size === 0) score -= 5;
      if (doc.file_size && doc.file_size > 50 * 1024 * 1024) score -= 10; // 50MB limit
    }

    // Check evidence quality
    for (const evidence of evidenceItems) {
      if (evidence.confidence_score && evidence.confidence_score < 0.5) {
        score -= 10;
      }
    }

    // Check analysis quality
    for (const analysis of analyses) {
      if (!analysis.analysis_result) score -= 5;
      if (analysis.analysis_result && Object.keys(analysis.analysis_result).length === 0) {
        score -= 10;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Assess data consistency
   */
  private static assessConsistency(documents: any[], analyses: any[]): number {
    let score = 100;

    // Check document format consistency
    const mimeTypes = documents.map(d => d.mime_type).filter(Boolean);
    const uniqueTypes = new Set(mimeTypes);
    
    if (uniqueTypes.size > 1 && mimeTypes.length > 1) {
      // Mixed formats might indicate inconsistency
      score -= 10;
    }

    // Check analysis consistency
    const analysisTypes = analyses.map(a => a.analysis_type).filter(Boolean);
    const uniqueAnalysisTypes = new Set(analysisTypes);
    
    if (uniqueAnalysisTypes.size === 0) {
      score -= 20;
    } else if (uniqueAnalysisTypes.size === 1) {
      // Single analysis type might indicate limited coverage
      score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Assess data timeliness
   */
  private static assessTimeliness(documents: any[], analyses: any[]): number {
    let score = 100;
    const now = new Date();

    // Check document age
    for (const doc of documents) {
      if (doc.uploaded_at) {
        const uploadDate = new Date(doc.uploaded_at);
        const daysDiff = (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 365) { // Over 1 year old
          score -= 15;
        } else if (daysDiff > 180) { // Over 6 months old
          score -= 10;
        } else if (daysDiff > 90) { // Over 3 months old
          score -= 5;
        }
      }
    }

    // Check analysis recency
    for (const analysis of analyses) {
      if (analysis.created_at) {
        const analysisDate = new Date(analysis.created_at);
        const daysDiff = (now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 30) { // Over 1 month old
          score -= 10;
        }
      }
    }

    return Math.max(0, score);
  }

  /**
   * Generate detailed quality recommendations
   */
  private static generateQualityDetails(
    dealData: any,
    documents: any[],
    analyses: any[],
    evidenceItems: TEvidenceItem[]
  ): DataQualityScore['details'] {
    const missingFields: string[] = [];
    const inconsistencies: string[] = [];
    const dataGaps: string[] = [];
    const recommendations: string[] = [];

    // Missing fields analysis
    if (!dealData.title) missingFields.push('Deal title is required for proper identification');
    if (!dealData.description) missingFields.push('Deal description provides important context');
    if (documents.length === 0) missingFields.push('At least one financial document is required');
    if (analyses.length === 0) missingFields.push('Financial analysis is required for deal assessment');

    // Inconsistencies analysis
    const mimeTypes = documents.map(d => d.mime_type).filter(Boolean);
    if (mimeTypes.length > 1 && new Set(mimeTypes).size > 1) {
      inconsistencies.push('Mixed document formats may affect analysis consistency');
    }

    // Data gaps analysis
    if (documents.length < 3) {
      dataGaps.push('Limited document coverage may result in incomplete analysis');
    }
    
    const lowConfidenceEvidence = evidenceItems.filter(e => e.confidence_score && e.confidence_score < 0.5);
    if (lowConfidenceEvidence.length > 0) {
      dataGaps.push(`${lowConfidenceEvidence.length} evidence items have low confidence scores`);
    }

    // Generate recommendations
    if (missingFields.length > 0) {
      recommendations.push('Complete missing deal information to improve data quality');
    }
    if (documents.length === 0) {
      recommendations.push('Upload financial documents (CSV, Excel, or PDF) for analysis');
    }
    if (analyses.length === 0) {
      recommendations.push('Run financial analysis to generate insights and metrics');
    }
    if (lowConfidenceEvidence.length > 0) {
      recommendations.push('Review and validate low-confidence evidence items');
    }

    return {
      missingFields,
      inconsistencies,
      dataGaps,
      recommendations
    };
  }

  /**
   * Assess evidence quality for individual items
   */
  static assessEvidenceQuality(evidence: TEvidenceItem): EvidenceQualityAssessment {
    let qualityScore = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Assess evidence completeness
    if (!evidence.title) {
      qualityScore -= 20;
      issues.push('Missing evidence title');
    }
    if (!evidence.description) {
      qualityScore -= 15;
      issues.push('Missing evidence description');
    }
    if (!evidence.source_document_id && !evidence.source_text) {
      qualityScore -= 25;
      issues.push('No source document or text provided');
    }

    // Assess confidence score
    if (evidence.confidence_score !== undefined) {
      if (evidence.confidence_score < 0.3) {
        qualityScore -= 30;
        issues.push('Very low confidence score');
        recommendations.push('Review and validate this evidence source');
      } else if (evidence.confidence_score < 0.6) {
        qualityScore -= 15;
        issues.push('Low confidence score');
        recommendations.push('Consider additional validation');
      }
    } else {
      qualityScore -= 10;
      issues.push('No confidence score provided');
      recommendations.push('Assign confidence score based on source reliability');
    }

    // Determine confidence level
    let confidenceLevel: 'high' | 'medium' | 'low';
    if (qualityScore >= 80) confidenceLevel = 'high';
    else if (qualityScore >= 60) confidenceLevel = 'medium';
    else confidenceLevel = 'low';

    // Calculate reliability (0-1)
    const reliability = Math.max(0, Math.min(1, qualityScore / 100));

    // Generate recommendations if none exist
    if (recommendations.length === 0) {
      if (qualityScore >= 80) {
        recommendations.push('Evidence quality is good - no immediate action required');
      } else if (qualityScore >= 60) {
        recommendations.push('Consider improving evidence documentation');
      } else {
        recommendations.push('Evidence requires significant improvement or replacement');
      }
    }

    return {
      evidenceId: evidence.id || 'unknown',
      qualityScore: Math.max(0, qualityScore),
      confidenceLevel,
      reliability,
      issues,
      recommendations
    };
  }

  /**
   * Assess document coverage for a deal
   */
  static assessDocumentCoverage(
    dealId: string,
    documents: any[],
    requiredTypes: string[] = ['income_statement', 'balance_sheet', 'cash_flow']
  ): DocumentCoverageAssessment {
    const presentTypes = documents.map(d => d.file_type).filter(Boolean);
    const missingTypes = requiredTypes.filter(type => !presentTypes.includes(type));
    
    const coverageScore = Math.round(
      ((requiredTypes.length - missingTypes.length) / requiredTypes.length) * 100
    );

    // Assess data completeness based on document content
    let dataCompleteness = 100;
    if (documents.length === 0) {
      dataCompleteness = 0;
    } else if (documents.length < requiredTypes.length) {
      dataCompleteness = Math.round((documents.length / requiredTypes.length) * 100);
    }

    const recommendations: string[] = [];
    
    if (missingTypes.length > 0) {
      recommendations.push(`Upload missing document types: ${missingTypes.join(', ')}`);
    }
    
    if (documents.length === 0) {
      recommendations.push('Upload financial documents to begin analysis');
    } else if (coverageScore < 50) {
      recommendations.push('Significant document gaps detected - consider additional uploads');
    } else if (coverageScore < 100) {
      recommendations.push('Some document types missing - upload for complete coverage');
    }

    return {
      dealId,
      totalDocuments: documents.length,
      requiredDocumentTypes: requiredTypes,
      presentDocumentTypes: presentTypes,
      missingDocumentTypes: missingTypes,
      coverageScore,
      dataCompleteness,
      recommendations
    };
  }

  /**
   * Generate data quality report summary
   */
  static generateQualityReport(
    dealId: string,
    dealData: any,
    documents: any[],
    analyses: any[],
    evidenceItems: TEvidenceItem[]
  ): {
    summary: DataQualityScore;
    evidence: EvidenceQualityAssessment[];
    coverage: DocumentCoverageAssessment;
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  } {
    const summary = this.assessDealDataQuality(dealData, documents, analyses, evidenceItems);
    const evidence = evidenceItems.map(item => this.assessEvidenceQuality(item));
    const coverage = this.assessDocumentCoverage(dealId, documents);

    // Calculate overall grade
    let overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (summary.overall >= 90) overallGrade = 'A';
    else if (summary.overall >= 80) overallGrade = 'B';
    else if (summary.overall >= 70) overallGrade = 'C';
    else if (summary.overall >= 60) overallGrade = 'D';
    else overallGrade = 'F';

    return {
      summary,
      evidence,
      coverage,
      overallGrade
    };
  }

  /**
   * Validate data quality thresholds
   */
  static validateQualityThresholds(
    qualityScore: DataQualityScore,
    thresholds: {
      minOverall?: number;
      minCompleteness?: number;
      minAccuracy?: number;
      minConsistency?: number;
      minTimeliness?: number;
    } = {}
  ): {
    passes: boolean;
    failures: string[];
    warnings: string[];
  } {
    const failures: string[] = [];
    const warnings: string[] = [];

    const {
      minOverall = 70,
      minCompleteness = 60,
      minAccuracy = 70,
      minConsistency = 60,
      minTimeliness = 50
    } = thresholds;

    // Check thresholds
    if (qualityScore.overall < minOverall) {
      failures.push(`Overall quality score (${qualityScore.overall}) below threshold (${minOverall})`);
    }
    if (qualityScore.completeness < minCompleteness) {
      failures.push(`Completeness score (${qualityScore.completeness}) below threshold (${minCompleteness})`);
    }
    if (qualityScore.accuracy < minAccuracy) {
      failures.push(`Accuracy score (${qualityScore.accuracy}) below threshold (${minAccuracy})`);
    }
    if (qualityScore.consistency < minConsistency) {
      failures.push(`Consistency score (${qualityScore.consistency}) below threshold (${minConsistency})`);
    }
    if (qualityScore.timeliness < minTimeliness) {
      failures.push(`Timeliness score (${qualityScore.timeliness}) below threshold (${minTimeliness})`);
    }

    // Generate warnings for scores close to thresholds
    if (qualityScore.overall < minOverall + 10 && qualityScore.overall >= minOverall) {
      warnings.push('Overall quality score is close to minimum threshold');
    }

    const passes = failures.length === 0;

    return {
      passes,
      failures,
      warnings
    };
  }
}
