export function detectFileType(filename: string, mimeType?: string): string {
  const lowercaseFilename = filename.toLowerCase();
  
  // Keywords that might indicate financial document types
  const keywords = {
    'P&L': ['p&l', 'profit', 'loss', 'income', 'statement', 'pnl'],
    'balance_sheet': ['balance', 'sheet', 'assets', 'liabilities', 'equity'],
    'cash_flow': ['cash', 'flow', 'cashflow', 'cf'],
    'financial': ['financial', 'finance', 'budget', 'forecast'],
    'legal': ['legal', 'contract', 'agreement', 'terms', 'conditions'],
    'technical': ['technical', 'spec', 'specification', 'architecture', 'design']
  };

  // Check filename for keywords
  for (const [type, typeKeywords] of Object.entries(keywords)) {
    if (typeKeywords.some(keyword => lowercaseFilename.includes(keyword))) {
      return type;
    }
  }

  // Fallback based on file extension
  const extension = lowercaseFilename.split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return 'document';
    case 'csv':
    case 'xlsx':
    case 'xls':
      return 'financial';
    case 'txt':
    case 'doc':
    case 'docx':
      return 'document';
    default:
      return 'other';
  }
}

export function getFileCategory(fileType: string): string {
  const categories = {
    'financial': ['P&L', 'balance_sheet', 'cash_flow', 'financial'],
    'legal': ['legal'],
    'technical': ['technical'],
    'general': ['document', 'other']
  };

  for (const [category, types] of Object.entries(categories)) {
    if (types.includes(fileType)) {
      return category;
    }
  }

  return 'general';
}