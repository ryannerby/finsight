export interface Deal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  deal_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  file_type?: string;
  uploaded_at: string;
}

export interface Analysis {
  id: string;
  document_id: string;
  parsed_text?: string;
  analysis_type: string;
  analysis_result?: any;
  created_at: string;
}

export interface QA {
  id: string;
  deal_id: string;
  question: string;
  answer?: string;
  context?: any;
  asked_by: string;
  created_at: string;
}

export interface Log {
  id: string;
  deal_id?: string;
  user_id: string;
  action: string;
  details?: any;
  created_at: string;
}

export type FileType = 'P&L' | 'balance_sheet' | 'cash_flow' | 'financial' | 'legal' | 'technical' | 'document' | 'other';

export type AnalysisType = 'text_extraction' | 'financial' | 'legal' | 'technical';

export type LogAction = 'created_deal' | 'uploaded_document' | 'parsed_document' | 'asked_question' | 'answered_question';