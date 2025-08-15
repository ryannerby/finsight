import pdfParse from 'pdf-parse';
import Papa from 'papaparse';
import { parseXlsxToRows, ParsedRow } from './xlsxParser';

export interface ParsedDocument {
  text: string;
  rows?: ParsedRow[];
  periodicity?: {
    periods: string[];
    totalRows: number;
    detectedFormat: 'annual' | 'quarterly' | 'monthly' | 'unknown';
  };
}

export async function parseDocument(fileBuffer: Buffer, mimeType: string): Promise<ParsedDocument> {
  try {
    switch (mimeType) {
      case 'application/pdf':
        const pdfText = await parsePDF(fileBuffer);
        return { text: pdfText };
      
      case 'text/csv':
      case 'application/csv':
        return parseCSV(fileBuffer);
      
      case 'text/plain':
        return { text: fileBuffer.toString('utf-8') };
      
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        return parseXLSX(fileBuffer);
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error parsing document:', error);
    
    // Handle encoding errors gracefully
    if (error instanceof Error && error.message.includes('encoding')) {
      console.warn('Non-UTF8 encoding detected, attempting fallback parsing');
      try {
        // Try different encodings
        const fallbackText = fileBuffer.toString('latin1');
        return { 
          text: fallbackText,
          periodicity: { periods: [], totalRows: 0, detectedFormat: 'unknown' }
        };
      } catch (fallbackError) {
        console.error('Fallback encoding also failed:', fallbackError);
        throw new Error(`Failed to parse document: encoding not supported`);
      }
    }
    
    throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

function parseCSV(buffer: Buffer): ParsedDocument {
  try {
    const csvText = buffer.toString('utf-8');
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    if (parsed.errors.length > 0) {
      console.warn('CSV parsing warnings:', parsed.errors);
    }

    // Convert parsed data back to a readable text format
    let result = '';
    let rows: ParsedRow[] = [];
    
    if (parsed.data && parsed.data.length > 0) {
      // Add headers
      const headers = Object.keys(parsed.data[0] as object);
      result += `Headers: ${headers.join(', ')}\n\n`;
      
      // Add data rows
      parsed.data.forEach((row: any, index: number) => {
        result += `Row ${index + 1}:\n`;
        headers.forEach(header => {
          result += `  ${header}: ${row[header] || 'N/A'}\n`;
        });
        result += '\n';
        
        // Try to extract period/account/value if possible
        const period = String(row.period ?? row.Period ?? row.PERIOD ?? '').trim();
        const account = String(row.account ?? row.Account ?? row.ACCOUNT ?? '').trim();
        const valueRaw = row.value ?? row.Value ?? row.VALUE ?? null;
        const value = typeof valueRaw === 'number' ? valueRaw : Number(valueRaw);
        
        if (period && account && !Number.isNaN(value)) {
          rows.push({ period, account, value });
        }
      });
      
      result += `\nTotal rows: ${parsed.data.length}`;
    }
    
    // Detect periodicity
    const periodicity = detectPeriodicity(rows);
    
    return { 
      text: result || csvText, // Fallback to raw text if parsing fails
      rows,
      periodicity
    };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    // Fallback to raw text
    const fallbackText = buffer.toString('utf-8');
    return { 
      text: fallbackText,
      periodicity: { periods: [], totalRows: 0, detectedFormat: 'unknown' }
    };
  }
}

function parseXLSX(buffer: Buffer): ParsedDocument {
  try {
    const rows = parseXlsxToRows(buffer);
    
    // Convert to readable text format
    let result = `Parsed XLSX file with ${rows.length} rows\n\n`;
    
    if (rows.length > 0) {
      result += `Headers: period, account, value\n\n`;
      
      rows.forEach((row, index) => {
        result += `Row ${index + 1}:\n`;
        result += `  period: ${row.period}\n`;
        result += `  account: ${row.account}\n`;
        result += `  value: ${row.value}\n\n`;
      });
    }
    
    // Detect periodicity
    const periodicity = detectPeriodicity(rows);
    
    return {
      text: result,
      rows,
      periodicity
    };
  } catch (error) {
    console.error('Error parsing XLSX:', error);
    throw new Error('Failed to parse XLSX file');
  }
}

function detectPeriodicity(rows: ParsedRow[]): ParsedDocument['periodicity'] {
  if (rows.length === 0) {
    return { periods: [], totalRows: 0, detectedFormat: 'unknown' };
  }
  
  // Extract unique periods and sort them
  const uniquePeriods = [...new Set(rows.map(row => row.period))].sort();
  
  // Detect format based on period patterns
  let detectedFormat: 'annual' | 'quarterly' | 'monthly' | 'unknown' = 'unknown';
  
  if (uniquePeriods.length > 0) {
    const firstPeriod = uniquePeriods[0];
    
    // Check for annual format (e.g., "2023", "FY2023", "2023A")
    if (/^\d{4}(?:A|FY)?$/.test(firstPeriod)) {
      detectedFormat = 'annual';
    }
    // Check for quarterly format (e.g., "2023Q1", "Q1 2023", "2023-Q1")
    else if (/Q[1-4]|Quarter|QTR/i.test(firstPeriod)) {
      detectedFormat = 'quarterly';
    }
    // Check for monthly format (e.g., "Jan 2023", "2023-01", "January 2023")
    else if (/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|01|02|03|04|05|06|07|08|09|10|11|12/i.test(firstPeriod)) {
      detectedFormat = 'monthly';
    }
  }
  
  console.log(`Periodicity detection: ${rows.length} rows, ${uniquePeriods.length} unique periods, format: ${detectedFormat}`);
  
  return {
    periods: uniquePeriods,
    totalRows: rows.length,
    detectedFormat
  };
}