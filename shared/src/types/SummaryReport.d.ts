import { z } from 'zod';
export declare const EvidenceSchema: z.ZodObject<{
    type: z.ZodEnum<{
        metric: "metric";
        excerpt: "excerpt";
        calculation: "calculation";
    }>;
    ref: z.ZodString;
    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    document_id: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    quote: z.ZodOptional<z.ZodString>;
    confidence: z.ZodDefault<z.ZodNumber>;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const TrafficLightSchema: z.ZodObject<{
    status: z.ZodEnum<{
        green: "green";
        yellow: "yellow";
        red: "red";
    }>;
    score: z.ZodNumber;
    reasoning: z.ZodString;
    evidence: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            metric: "metric";
            excerpt: "excerpt";
            calculation: "calculation";
        }>;
        ref: z.ZodString;
        value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        document_id: z.ZodOptional<z.ZodString>;
        page: z.ZodOptional<z.ZodNumber>;
        quote: z.ZodOptional<z.ZodString>;
        confidence: z.ZodDefault<z.ZodNumber>;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const StrengthRiskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    impact: z.ZodEnum<{
        high: "high";
        medium: "medium";
        low: "low";
    }>;
    urgency: z.ZodOptional<z.ZodEnum<{
        immediate: "immediate";
        near_term: "near_term";
        long_term: "long_term";
    }>>;
    evidence: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            metric: "metric";
            excerpt: "excerpt";
            calculation: "calculation";
        }>;
        ref: z.ZodString;
        value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        document_id: z.ZodOptional<z.ZodString>;
        page: z.ZodOptional<z.ZodNumber>;
        quote: z.ZodOptional<z.ZodString>;
        confidence: z.ZodDefault<z.ZodNumber>;
        context: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    quantified_impact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const DataQualitySchema: z.ZodObject<{
    completeness: z.ZodNumber;
    consistency: z.ZodNumber;
    recency: z.ZodNumber;
    missing_periods: z.ZodArray<z.ZodString>;
    data_gaps: z.ZodArray<z.ZodString>;
    reliability_notes: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const SummaryReportSchema: z.ZodObject<{
    health_score: z.ZodObject<{
        overall: z.ZodNumber;
        components: z.ZodObject<{
            profitability: z.ZodNumber;
            growth: z.ZodNumber;
            liquidity: z.ZodNumber;
            leverage: z.ZodNumber;
            efficiency: z.ZodNumber;
            data_quality: z.ZodNumber;
        }, z.core.$strip>;
        methodology: z.ZodString;
    }, z.core.$strip>;
    traffic_lights: z.ZodObject<{
        revenue_quality: z.ZodObject<{
            status: z.ZodEnum<{
                green: "green";
                yellow: "yellow";
                red: "red";
            }>;
            score: z.ZodNumber;
            reasoning: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    metric: "metric";
                    excerpt: "excerpt";
                    calculation: "calculation";
                }>;
                ref: z.ZodString;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                document_id: z.ZodOptional<z.ZodString>;
                page: z.ZodOptional<z.ZodNumber>;
                quote: z.ZodOptional<z.ZodString>;
                confidence: z.ZodDefault<z.ZodNumber>;
                context: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        margin_trends: z.ZodObject<{
            status: z.ZodEnum<{
                green: "green";
                yellow: "yellow";
                red: "red";
            }>;
            score: z.ZodNumber;
            reasoning: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    metric: "metric";
                    excerpt: "excerpt";
                    calculation: "calculation";
                }>;
                ref: z.ZodString;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                document_id: z.ZodOptional<z.ZodString>;
                page: z.ZodOptional<z.ZodNumber>;
                quote: z.ZodOptional<z.ZodString>;
                confidence: z.ZodDefault<z.ZodNumber>;
                context: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        liquidity: z.ZodObject<{
            status: z.ZodEnum<{
                green: "green";
                yellow: "yellow";
                red: "red";
            }>;
            score: z.ZodNumber;
            reasoning: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    metric: "metric";
                    excerpt: "excerpt";
                    calculation: "calculation";
                }>;
                ref: z.ZodString;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                document_id: z.ZodOptional<z.ZodString>;
                page: z.ZodOptional<z.ZodNumber>;
                quote: z.ZodOptional<z.ZodString>;
                confidence: z.ZodDefault<z.ZodNumber>;
                context: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        leverage: z.ZodObject<{
            status: z.ZodEnum<{
                green: "green";
                yellow: "yellow";
                red: "red";
            }>;
            score: z.ZodNumber;
            reasoning: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    metric: "metric";
                    excerpt: "excerpt";
                    calculation: "calculation";
                }>;
                ref: z.ZodString;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                document_id: z.ZodOptional<z.ZodString>;
                page: z.ZodOptional<z.ZodNumber>;
                quote: z.ZodOptional<z.ZodString>;
                confidence: z.ZodDefault<z.ZodNumber>;
                context: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        working_capital: z.ZodObject<{
            status: z.ZodEnum<{
                green: "green";
                yellow: "yellow";
                red: "red";
            }>;
            score: z.ZodNumber;
            reasoning: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    metric: "metric";
                    excerpt: "excerpt";
                    calculation: "calculation";
                }>;
                ref: z.ZodString;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                document_id: z.ZodOptional<z.ZodString>;
                page: z.ZodOptional<z.ZodNumber>;
                quote: z.ZodOptional<z.ZodString>;
                confidence: z.ZodDefault<z.ZodNumber>;
                context: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        data_quality: z.ZodObject<{
            status: z.ZodEnum<{
                green: "green";
                yellow: "yellow";
                red: "red";
            }>;
            score: z.ZodNumber;
            reasoning: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    metric: "metric";
                    excerpt: "excerpt";
                    calculation: "calculation";
                }>;
                ref: z.ZodString;
                value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                document_id: z.ZodOptional<z.ZodString>;
                page: z.ZodOptional<z.ZodNumber>;
                quote: z.ZodOptional<z.ZodString>;
                confidence: z.ZodDefault<z.ZodNumber>;
                context: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    top_strengths: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        impact: z.ZodEnum<{
            high: "high";
            medium: "medium";
            low: "low";
        }>;
        urgency: z.ZodOptional<z.ZodEnum<{
            immediate: "immediate";
            near_term: "near_term";
            long_term: "long_term";
        }>>;
        evidence: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                metric: "metric";
                excerpt: "excerpt";
                calculation: "calculation";
            }>;
            ref: z.ZodString;
            value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
            document_id: z.ZodOptional<z.ZodString>;
            page: z.ZodOptional<z.ZodNumber>;
            quote: z.ZodOptional<z.ZodString>;
            confidence: z.ZodDefault<z.ZodNumber>;
            context: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        quantified_impact: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    top_risks: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        impact: z.ZodEnum<{
            high: "high";
            medium: "medium";
            low: "low";
        }>;
        urgency: z.ZodOptional<z.ZodEnum<{
            immediate: "immediate";
            near_term: "near_term";
            long_term: "long_term";
        }>>;
        evidence: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                metric: "metric";
                excerpt: "excerpt";
                calculation: "calculation";
            }>;
            ref: z.ZodString;
            value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
            document_id: z.ZodOptional<z.ZodString>;
            page: z.ZodOptional<z.ZodNumber>;
            quote: z.ZodOptional<z.ZodString>;
            confidence: z.ZodDefault<z.ZodNumber>;
            context: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        quantified_impact: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    recommendation: z.ZodObject<{
        decision: z.ZodEnum<{
            Proceed: "Proceed";
            Caution: "Caution";
            Pass: "Pass";
        }>;
        confidence: z.ZodNumber;
        rationale: z.ZodString;
        key_factors: z.ZodArray<z.ZodString>;
        valuation_impact: z.ZodOptional<z.ZodString>;
        deal_structure_notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    analysis_metadata: z.ZodObject<{
        period_range: z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
            total_periods: z.ZodNumber;
        }, z.core.$strip>;
        data_quality: z.ZodObject<{
            completeness: z.ZodNumber;
            consistency: z.ZodNumber;
            recency: z.ZodNumber;
            missing_periods: z.ZodArray<z.ZodString>;
            data_gaps: z.ZodArray<z.ZodString>;
            reliability_notes: z.ZodArray<z.ZodString>;
        }, z.core.$strip>;
        assumptions: z.ZodDefault<z.ZodArray<z.ZodString>>;
        limitations: z.ZodDefault<z.ZodArray<z.ZodString>>;
        followup_questions: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    confidence: z.ZodObject<{
        overall: z.ZodNumber;
        sections: z.ZodRecord<z.ZodString, z.ZodNumber>;
        reliability_factors: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    export_ready: z.ZodObject<{
        pdf_title: z.ZodString;
        executive_summary: z.ZodString;
        key_metrics_table: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            value: z.ZodString;
            trend: z.ZodEnum<{
                improving: "improving";
                stable: "stable";
                declining: "declining";
                volatile: "volatile";
            }>;
            benchmark: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const EvidenceItem: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    evidence_type: z.ZodEnum<{
        calculation: "calculation";
        financial_data: "financial_data";
        document_excerpt: "document_excerpt";
        external_source: "external_source";
        assumption: "assumption";
        note: "note";
    }>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    source_document_id: z.ZodOptional<z.ZodString>;
    source_page: z.ZodOptional<z.ZodNumber>;
    source_text: z.ZodOptional<z.ZodString>;
    confidence_score: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ReportSection: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    section_type: z.ZodEnum<{
        evidence: "evidence";
        risk_assessment: "risk_assessment";
        executive_summary: "executive_summary";
        financial_analysis: "financial_analysis";
        recommendations: "recommendations";
        appendix: "appendix";
    }>;
    title: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    order_index: z.ZodNumber;
    is_required: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ReportExport: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    export_format: z.ZodEnum<{
        json: "json";
        pdf: "pdf";
        xlsx: "xlsx";
        docx: "docx";
        html: "html";
    }>;
    file_path: z.ZodOptional<z.ZodString>;
    file_size: z.ZodOptional<z.ZodNumber>;
    generated_by: z.ZodString;
    generated_at: z.ZodOptional<z.ZodString>;
    expires_at: z.ZodOptional<z.ZodString>;
    download_count: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const ReportSharing: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    shared_with: z.ZodString;
    access_level: z.ZodDefault<z.ZodEnum<{
        view: "view";
        comment: "comment";
        edit: "edit";
        admin: "admin";
    }>>;
    shared_by: z.ZodString;
    shared_at: z.ZodOptional<z.ZodString>;
    expires_at: z.ZodOptional<z.ZodString>;
    is_active: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const ReportComment: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    commenter_id: z.ZodString;
    comment: z.ZodString;
    parent_comment_id: z.ZodOptional<z.ZodString>;
    is_resolved: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ReportQA: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    question: z.ZodString;
    answer: z.ZodOptional<z.ZodString>;
    question_context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    answer_evidence: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    asked_by: z.ZodString;
    answered_by: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        pending: "pending";
        answered: "answered";
        requires_clarification: "requires_clarification";
        archived: "archived";
    }>>;
    priority: z.ZodDefault<z.ZodEnum<{
        high: "high";
        low: "low";
        normal: "normal";
        urgent: "urgent";
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
    answered_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ReportTemplate: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    template_type: z.ZodEnum<{
        custom: "custom";
        standard: "standard";
        industry_specific: "industry_specific";
    }>;
    sections: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        title: z.ZodString;
        required: z.ZodBoolean;
        order: z.ZodNumber;
    }, z.core.$strip>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_by: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const AnalysisReport: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    deal_id: z.ZodString;
    report_type: z.ZodEnum<{
        custom: "custom";
        financial_summary: "financial_summary";
        risk_assessment: "risk_assessment";
        due_diligence: "due_diligence";
        comprehensive: "comprehensive";
    }>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
        archived: "archived";
        draft: "draft";
    }>>;
    generated_by: z.ZodString;
    generated_at: z.ZodOptional<z.ZodString>;
    completed_at: z.ZodOptional<z.ZodString>;
    last_modified: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        section_type: z.ZodEnum<{
            evidence: "evidence";
            risk_assessment: "risk_assessment";
            executive_summary: "executive_summary";
            financial_analysis: "financial_analysis";
            recommendations: "recommendations";
            appendix: "appendix";
        }>;
        title: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        order_index: z.ZodNumber;
        is_required: z.ZodDefault<z.ZodBoolean>;
        created_at: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    evidence_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        evidence_type: z.ZodEnum<{
            calculation: "calculation";
            financial_data: "financial_data";
            document_excerpt: "document_excerpt";
            external_source: "external_source";
            assumption: "assumption";
            note: "note";
        }>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        source_document_id: z.ZodOptional<z.ZodString>;
        source_page: z.ZodOptional<z.ZodNumber>;
        source_text: z.ZodOptional<z.ZodString>;
        confidence_score: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        created_at: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    exports: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        export_format: z.ZodEnum<{
            json: "json";
            pdf: "pdf";
            xlsx: "xlsx";
            docx: "docx";
            html: "html";
        }>;
        file_path: z.ZodOptional<z.ZodString>;
        file_size: z.ZodOptional<z.ZodNumber>;
        generated_by: z.ZodString;
        generated_at: z.ZodOptional<z.ZodString>;
        expires_at: z.ZodOptional<z.ZodString>;
        download_count: z.ZodDefault<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>>;
    sharing: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        shared_with: z.ZodString;
        access_level: z.ZodDefault<z.ZodEnum<{
            view: "view";
            comment: "comment";
            edit: "edit";
            admin: "admin";
        }>>;
        shared_by: z.ZodString;
        shared_at: z.ZodOptional<z.ZodString>;
        expires_at: z.ZodOptional<z.ZodString>;
        is_active: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>>;
    comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        commenter_id: z.ZodString;
        comment: z.ZodString;
        parent_comment_id: z.ZodOptional<z.ZodString>;
        is_resolved: z.ZodDefault<z.ZodBoolean>;
        created_at: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    qa_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        question: z.ZodString;
        answer: z.ZodOptional<z.ZodString>;
        question_context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        answer_evidence: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        asked_by: z.ZodString;
        answered_by: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<{
            pending: "pending";
            answered: "answered";
            requires_clarification: "requires_clarification";
            archived: "archived";
        }>>;
        priority: z.ZodDefault<z.ZodEnum<{
            high: "high";
            low: "low";
            normal: "normal";
            urgent: "urgent";
        }>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        created_at: z.ZodOptional<z.ZodString>;
        answered_at: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const ReportGenerationRequest: z.ZodObject<{
    deal_id: z.ZodString;
    report_type: z.ZodEnum<{
        custom: "custom";
        financial_summary: "financial_summary";
        risk_assessment: "risk_assessment";
        due_diligence: "due_diligence";
        comprehensive: "comprehensive";
    }>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    template_id: z.ZodOptional<z.ZodString>;
    custom_sections: z.ZodOptional<z.ZodArray<z.ZodString>>;
    include_evidence: z.ZodDefault<z.ZodBoolean>;
    include_qa: z.ZodDefault<z.ZodBoolean>;
    export_formats: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        json: "json";
        pdf: "pdf";
        xlsx: "xlsx";
        docx: "docx";
        html: "html";
    }>>>;
    generated_by: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const ReportGenerationResponse: z.ZodObject<{
    success: z.ZodBoolean;
    report_id: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        processing: "processing";
        completed: "completed";
        failed: "failed";
        queued: "queued";
    }>;
    message: z.ZodOptional<z.ZodString>;
    progress: z.ZodOptional<z.ZodNumber>;
    estimated_completion: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ReportUpdateRequest: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
        archived: "archived";
        draft: "draft";
    }>>;
    sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        section_type: z.ZodEnum<{
            evidence: "evidence";
            risk_assessment: "risk_assessment";
            executive_summary: "executive_summary";
            financial_analysis: "financial_analysis";
            recommendations: "recommendations";
            appendix: "appendix";
        }>;
        title: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        order_index: z.ZodNumber;
        is_required: z.ZodDefault<z.ZodBoolean>;
        created_at: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const ReportSearchParams: z.ZodObject<{
    deal_id: z.ZodOptional<z.ZodString>;
    report_type: z.ZodOptional<z.ZodEnum<{
        custom: "custom";
        financial_summary: "financial_summary";
        risk_assessment: "risk_assessment";
        due_diligence: "due_diligence";
        comprehensive: "comprehensive";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        in_progress: "in_progress";
        completed: "completed";
        archived: "archived";
        draft: "draft";
    }>>;
    generated_by: z.ZodOptional<z.ZodString>;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<{
        title: "title";
        created_at: "created_at";
        status: "status";
        updated_at: "updated_at";
    }>>;
    sort_order: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type SummaryReport = z.infer<typeof SummaryReportSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type TrafficLight = z.infer<typeof TrafficLightSchema>;
export type StrengthRisk = z.infer<typeof StrengthRiskSchema>;
export type DataQuality = z.infer<typeof DataQualitySchema>;
export type TEvidenceItem = z.infer<typeof EvidenceItem>;
export type TReportSection = z.infer<typeof ReportSection>;
export type TReportExport = z.infer<typeof ReportExport>;
export type TReportSharing = z.infer<typeof ReportSharing>;
export type TReportComment = z.infer<typeof ReportComment>;
export type TReportQA = z.infer<typeof ReportQA>;
export type TReportTemplate = z.infer<typeof ReportTemplate>;
export type TAnalysisReport = z.infer<typeof AnalysisReport>;
export type TReportGenerationRequest = z.infer<typeof ReportGenerationRequest>;
export type TReportGenerationResponse = z.infer<typeof ReportGenerationResponse>;
export type TReportUpdateRequest = z.infer<typeof ReportUpdateRequest>;
export type TReportSearchParams = z.infer<typeof ReportSearchParams>;
export declare const validateSummaryReport: (data: unknown) => SummaryReport;
export declare const isValidEvidence: (evidence: unknown) => evidence is Evidence;
//# sourceMappingURL=SummaryReport.d.ts.map