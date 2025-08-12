import { z } from 'zod';

export const PeriodValues = z.object({
  revenue: z.number().nullable().optional(),
  cogs: z.number().nullable().optional(),
  gross_profit: z.number().nullable().optional(),
  operating_expenses: z.number().nullable().optional(),
  ebitda: z.number().nullable().optional(),
  net_income: z.number().nullable().optional(),
  cash: z.number().nullable().optional(),
  accounts_receivable: z.number().nullable().optional(),
  inventory: z.number().nullable().optional(),
  accounts_payable: z.number().nullable().optional(),
  total_assets: z.number().nullable().optional(),
  total_liabilities: z.number().nullable().optional(),
  shareholders_equity: z.number().nullable().optional()
});

export const StatementExtraction = z.object({
  document_id: z.string().uuid(),
  statement_type: z.enum(['income_statement','balance_sheet','cash_flow']),
  currency: z.string().default('USD'),
  periodicity: z.enum(['monthly','quarterly','annual']).optional(),
  periods: z.array(z.object({
    period: z.string(), // e.g. 2023-Q1 or 2024-01
    values: PeriodValues
  })),
  notes: z.array(z.object({ text: z.string(), page: z.number().optional() })).optional()
});

export const DealMetrics = z.object({
  deal_id: z.string().uuid(),
  metrics: z.record(z.string(), z.number()).and(z.object({
    revenue_cagr_3y: z.number().optional(),
    gross_margin: z.number().optional(),
    net_margin: z.number().optional(),
    current_ratio: z.number().optional(),
    debt_to_equity: z.number().optional()
  }).partial()),
  coverage: z.object({
    has_3y_data: z.boolean().optional(),
    periodicity: z.enum(['monthly','quarterly','annual']).optional()
  }).partial()
});

export const Summary = z.object({
  deal_id: z.string().uuid(),
  health_score: z.number().min(0).max(100),
  traffic_lights: z.record(z.string(), z.enum(['green','yellow','red'])),
  top_strengths: z.array(z.object({ title: z.string(), evidence: z.string(), page: z.number().optional() })),
  top_risks: z.array(z.object({ title: z.string(), evidence: z.string(), page: z.number().optional() })),
  recommendation: z.enum(['Proceed','Caution','Pass'])
});

export type TStatementExtraction = z.infer<typeof StatementExtraction>;
export type TDealMetrics = z.infer<typeof DealMetrics>;
export type TSummary = z.infer<typeof Summary>;