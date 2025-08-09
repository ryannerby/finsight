import pdfParse from 'pdf-parse';
import Papa from 'papaparse';

export async function parseDocument(fileBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    switch (mimeType) {
      case 'application/pdf':
        return await parsePDF(fileBuffer);
      
      case 'text/csv':
      case 'application/csv':
        return parseCSV(fileBuffer);
      
      case 'text/plain':
        return fileBuffer.toString('utf-8');
      
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        // For Excel files, we'll convert to CSV format for now
        // In a real implementation, you might use a library like 'xlsx'
        return 'Excel file parsing not yet implemented. Please convert to CSV format.';
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error parsing document:', error);
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

function parseCSV(buffer: Buffer): string {
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
      });
      
      result += `\nTotal rows: ${parsed.data.length}`;
    }
    
    return result || csvText; // Fallback to raw text if parsing fails
  } catch (error) {
    console.error('Error parsing CSV:', error);
    // Fallback to raw text
    return buffer.toString('utf-8');
  }
}