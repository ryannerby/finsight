"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEvidence = exports.validateSummaryReport = exports.ReportSearchParams = exports.ReportUpdateRequest = exports.ReportGenerationResponse = exports.ReportGenerationRequest = exports.AnalysisReport = exports.ReportTemplate = exports.ReportQA = exports.ReportComment = exports.ReportSharing = exports.ReportExport = exports.ReportSection = exports.EvidenceItem = exports.SummaryReportSchema = exports.DataQualitySchema = exports.StrengthRiskSchema = exports.TrafficLightSchema = exports.EvidenceSchema = void 0;
const zod_1 = require("zod");
// Evidence schema for provenance tracking
exports.EvidenceSchema = zod_1.z.object({
    type: zod_1.z.enum(['metric', 'excerpt', 'calculation']),
    ref: zod_1.z.string(), // metric key, excerpt_id, or calculation formula
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(), // actual metric value
    document_id: zod_1.z.string().optional(),
    page: zod_1.z.number().optional(),
    quote: zod_1.z.string().max(200).optional(), // Limited excerpt length
    confidence: zod_1.z.number().min(0).max(1).default(1),
    context: zod_1.z.string().optional() // Additional context for interpretation
});
// Traffic light with reasoning
exports.TrafficLightSchema = zod_1.z.object({
    status: zod_1.z.enum(['green', 'yellow', 'red']),
    score: zod_1.z.number().min(0).max(100), // Numerical backing
    reasoning: zod_1.z.string().max(300),
    evidence: zod_1.z.array(exports.EvidenceSchema).min(1).max(3)
});
// Strength/Risk with impact assessment
exports.StrengthRiskSchema = zod_1.z.object({
    title: zod_1.z.string().max(100),
    description: zod_1.z.string().max(400),
    impact: zod_1.z.enum(['high', 'medium', 'low']),
    urgency: zod_1.z.enum(['immediate', 'near_term', 'long_term']).optional(),
    evidence: zod_1.z.array(exports.EvidenceSchema).min(1).max(5),
    quantified_impact: zod_1.z.string().optional() // e.g., "15% margin improvement opportunity"
});
// Data quality assessment
exports.DataQualitySchema = zod_1.z.object({
    completeness: zod_1.z.number().min(0).max(1), // % of expected periods with data
    consistency: zod_1.z.number().min(0).max(1), // How consistent are period-to-period changes
    recency: zod_1.z.number().min(0).max(1), // How recent is the latest data
    missing_periods: zod_1.z.array(zod_1.z.string()),
    data_gaps: zod_1.z.array(zod_1.z.string()),
    reliability_notes: zod_1.z.array(zod_1.z.string())
});
// Enhanced main schema
exports.SummaryReportSchema = zod_1.z.object({
    // Core scoring
    health_score: zod_1.z.object({
        overall: zod_1.z.number().min(0).max(100),
        components: zod_1.z.object({
            profitability: zod_1.z.number().min(0).max(100),
            growth: zod_1.z.number().min(0).max(100),
            liquidity: zod_1.z.number().min(0).max(100),
            leverage: zod_1.z.number().min(0).max(100),
            efficiency: zod_1.z.number().min(0).max(100),
            data_quality: zod_1.z.number().min(0).max(100)
        }),
        methodology: zod_1.z.string().max(500) // Explain how score was calculated
    }),
    // Traffic lights with enhanced reasoning
    traffic_lights: zod_1.z.object({
        revenue_quality: exports.TrafficLightSchema,
        margin_trends: exports.TrafficLightSchema,
        liquidity: exports.TrafficLightSchema,
        leverage: exports.TrafficLightSchema,
        working_capital: exports.TrafficLightSchema,
        data_quality: exports.TrafficLightSchema
    }),
    // Findings
    top_strengths: zod_1.z.array(exports.StrengthRiskSchema).min(3).max(7),
    top_risks: zod_1.z.array(exports.StrengthRiskSchema).min(3).max(7),
    // Decision framework
    recommendation: zod_1.z.object({
        decision: zod_1.z.enum(['Proceed', 'Caution', 'Pass']),
        confidence: zod_1.z.number().min(0).max(1),
        rationale: zod_1.z.string().max(800),
        key_factors: zod_1.z.array(zod_1.z.string()).min(2).max(5), // Bullet points
        valuation_impact: zod_1.z.string().optional(), // How findings affect valuation
        deal_structure_notes: zod_1.z.string().optional() // Suggested terms/protections
    }),
    // Analytics metadata
    analysis_metadata: zod_1.z.object({
        period_range: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string(),
            total_periods: zod_1.z.number()
        }),
        data_quality: exports.DataQualitySchema,
        assumptions: zod_1.z.array(zod_1.z.string()).default([]),
        limitations: zod_1.z.array(zod_1.z.string()).default([]),
        followup_questions: zod_1.z.array(zod_1.z.string()).default([]) // Seed Q&A
    }),
    // Confidence tracking
    confidence: zod_1.z.object({
        overall: zod_1.z.number().min(0).max(1),
        sections: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0).max(1)),
        reliability_factors: zod_1.z.array(zod_1.z.string()) // What drives confidence up/down
    }),
    // Export metadata
    export_ready: zod_1.z.object({
        pdf_title: zod_1.z.string(),
        executive_summary: zod_1.z.string().max(500), // One-paragraph overview
        key_metrics_table: zod_1.z.array(zod_1.z.object({
            metric: zod_1.z.string(),
            value: zod_1.z.string(),
            trend: zod_1.z.enum(['improving', 'stable', 'declining', 'volatile']),
            benchmark: zod_1.z.string().optional()
        }))
    })
});
// Legacy types for backward compatibility
exports.EvidenceItem = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    evidence_type: zod_1.z.enum(['financial_data', 'document_excerpt', 'calculation', 'external_source', 'assumption', 'note']),
    title: zod_1.z.string().min(1, 'Evidence title is required'),
    description: zod_1.z.string().optional(),
    source_document_id: zod_1.z.string().uuid().optional(),
    source_page: zod_1.z.number().int().positive().optional(),
    source_text: zod_1.z.string().optional(),
    confidence_score: zod_1.z.number().min(0).max(1).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    created_at: zod_1.z.string().datetime().optional()
});
exports.ReportSection = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    section_type: zod_1.z.enum(['executive_summary', 'financial_analysis', 'risk_assessment', 'evidence', 'recommendations', 'appendix']),
    title: zod_1.z.string().min(1, 'Section title is required'),
    content: zod_1.z.string().optional(),
    order_index: zod_1.z.number().int().min(0),
    is_required: zod_1.z.boolean().default(true),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional()
});
exports.ReportExport = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    export_format: zod_1.z.enum(['pdf', 'docx', 'xlsx', 'html', 'json']),
    file_path: zod_1.z.string().optional(),
    file_size: zod_1.z.number().int().positive().optional(),
    generated_by: zod_1.z.string(),
    generated_at: zod_1.z.string().datetime().optional(),
    expires_at: zod_1.z.string().datetime().optional(),
    download_count: zod_1.z.number().int().min(0).default(0),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
});
exports.ReportSharing = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    shared_with: zod_1.z.string(),
    access_level: zod_1.z.enum(['view', 'comment', 'edit', 'admin']).default('view'),
    shared_by: zod_1.z.string(),
    shared_at: zod_1.z.string().datetime().optional(),
    expires_at: zod_1.z.string().datetime().optional(),
    is_active: zod_1.z.boolean().default(true)
});
exports.ReportComment = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    commenter_id: zod_1.z.string(),
    comment: zod_1.z.string().min(1, 'Comment cannot be empty'),
    parent_comment_id: zod_1.z.string().uuid().optional(),
    is_resolved: zod_1.z.boolean().default(false),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional()
});
exports.ReportQA = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    question: zod_1.z.string().min(1, 'Question cannot be empty'),
    answer: zod_1.z.string().optional(),
    question_context: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    answer_evidence: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    asked_by: zod_1.z.string(),
    answered_by: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'answered', 'requires_clarification', 'archived']).default('pending'),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    created_at: zod_1.z.string().datetime().optional(),
    answered_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional()
});
exports.ReportTemplate = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(1, 'Template name is required'),
    description: zod_1.z.string().optional(),
    template_type: zod_1.z.enum(['standard', 'custom', 'industry_specific']),
    sections: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        title: zod_1.z.string(),
        required: zod_1.z.boolean(),
        order: zod_1.z.number()
    })),
    is_active: zod_1.z.boolean().default(true),
    created_by: zod_1.z.string(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional()
});
exports.AnalysisReport = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    deal_id: zod_1.z.string().uuid(),
    report_type: zod_1.z.enum(['comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom']),
    title: zod_1.z.string().min(1, 'Report title is required'),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'in_progress', 'completed', 'archived']).default('draft'),
    generated_by: zod_1.z.string(),
    generated_at: zod_1.z.string().datetime().optional(),
    completed_at: zod_1.z.string().datetime().optional(),
    last_modified: zod_1.z.string().datetime().optional(),
    version: zod_1.z.number().int().min(1).default(1),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).default({}),
    // Related data (populated when fetching full reports)
    sections: zod_1.z.array(exports.ReportSection).optional(),
    evidence_items: zod_1.z.array(exports.EvidenceItem).optional(),
    exports: zod_1.z.array(exports.ReportExport).optional(),
    sharing: zod_1.z.array(exports.ReportSharing).optional(),
    comments: zod_1.z.array(exports.ReportComment).optional(),
    qa_items: zod_1.z.array(exports.ReportQA).optional()
});
exports.ReportGenerationRequest = zod_1.z.object({
    deal_id: zod_1.z.string().uuid(),
    report_type: zod_1.z.enum(['comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom']),
    title: zod_1.z.string().min(1, 'Report title is required'),
    description: zod_1.z.string().optional(),
    template_id: zod_1.z.string().uuid().optional(),
    custom_sections: zod_1.z.array(zod_1.z.string()).optional(),
    include_evidence: zod_1.z.boolean().default(true),
    include_qa: zod_1.z.boolean().default(true),
    export_formats: zod_1.z.array(zod_1.z.enum(['pdf', 'docx', 'xlsx', 'html', 'json'])).default(['pdf']),
    generated_by: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
});
exports.ReportGenerationResponse = zod_1.z.object({
    success: zod_1.z.boolean(),
    report_id: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['queued', 'processing', 'completed', 'failed']),
    message: zod_1.z.string().optional(),
    progress: zod_1.z.number().min(0).max(100).optional(),
    estimated_completion: zod_1.z.string().datetime().optional(),
    error: zod_1.z.string().optional()
});
exports.ReportUpdateRequest = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'in_progress', 'completed', 'archived']).optional(),
    sections: zod_1.z.array(exports.ReportSection).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
});
exports.ReportSearchParams = zod_1.z.object({
    deal_id: zod_1.z.string().uuid().optional(),
    report_type: zod_1.z.enum(['comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom']).optional(),
    status: zod_1.z.enum(['draft', 'in_progress', 'completed', 'archived']).optional(),
    generated_by: zod_1.z.string().optional(),
    date_from: zod_1.z.string().datetime().optional(),
    date_to: zod_1.z.string().datetime().optional(),
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sort_by: zod_1.z.enum(['created_at', 'updated_at', 'title', 'status']).default('created_at'),
    sort_order: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// Validation helpers
const validateSummaryReport = (data) => {
    return exports.SummaryReportSchema.parse(data);
};
exports.validateSummaryReport = validateSummaryReport;
const isValidEvidence = (evidence) => {
    return exports.EvidenceSchema.safeParse(evidence).success;
};
exports.isValidEvidence = isValidEvidence;
//# sourceMappingURL=SummaryReport.js.map