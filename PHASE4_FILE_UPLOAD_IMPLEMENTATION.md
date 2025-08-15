# Phase 4: File Upload & Parsing Implementation

## Overview

Phase 4 implements robust file upload and parsing functionality for the Finsight application, supporting CSV and XLSX files with proper error handling and edge case management.

## Implementation Status

✅ **COMPLETED** - All Phase 4 requirements have been implemented and tested.

## Features Implemented

### 1. Client Upload Functionality

#### useFileUpload Hook (`client/src/hooks/useFileUpload.ts`)
- **Signed URL Integration**: Properly implements Supabase Storage signed URLs for secure file uploads
- **Multi-file Support**: Handles multiple file uploads sequentially to avoid overwhelming the server
- **Progress Tracking**: Real-time upload progress monitoring with status updates
- **Error Handling**: Graceful error handling at each step of the upload process
- **File Validation**: Proper filename and content-type handling

#### Upload Flow
1. **Get Upload URL**: Request pre-signed URL from server
2. **Upload to Storage**: Direct upload to Supabase Storage using signed URL
3. **Confirm Upload**: Create document record in database
4. **Parse Document**: Trigger server-side parsing and analysis

### 2. Server Parsing Engine

#### Enhanced Document Parser (`server/src/services/documentParser.ts`)
- **Multi-format Support**: CSV, XLSX, PDF, and plain text
- **XLSX Integration**: Full XLSX parsing using the `xlsx` library
- **Periodicity Detection**: Automatic detection of annual/quarterly/monthly formats
- **Canonical Period Maps**: Structured data extraction for financial analysis
- **Row Counting**: Logs parsed row counts and detected periodicity

#### Parsing Capabilities
```typescript
export interface ParsedDocument {
  text: string;                    // Human-readable parsed text
  rows?: ParsedRow[];             // Structured financial data
  periodicity?: {
    periods: string[];             // Unique time periods
    totalRows: number;             // Total rows parsed
    detectedFormat: 'annual' | 'quarterly' | 'monthly' | 'unknown';
  };
}
```

#### XLSX Parser (`server/src/services/xlsxParser.ts`)
- **Deterministic Parsing**: Consistent parsing of accounting spreadsheets
- **Flexible Column Detection**: Case-insensitive column matching (period/account/value)
- **Data Validation**: Skips invalid rows with missing or malformed data

### 3. Edge Case Handling

#### Large File Support
- **Express Limits**: Increased to 50MB for JSON and URL-encoded data
- **Multer Limits**: Increased to 50MB for file uploads
- **Memory Management**: Efficient buffer handling for large files

#### Non-UTF8 Encoding
- **Fallback Parsing**: Automatic fallback to latin1 encoding when UTF-8 fails
- **Graceful Degradation**: Per-file error handling without affecting entire deal processing
- **Error Logging**: Comprehensive logging of encoding issues for debugging

#### Error Resilience
- **Partial Failures**: Upload succeeds even if parsing fails
- **Retry Logic**: Built-in retry mechanisms for transient failures
- **User Feedback**: Clear error messages for different failure scenarios

## API Endpoints

### File Upload Endpoints

#### `POST /api/files/upload-url`
- **Purpose**: Generate pre-signed URL for direct Supabase Storage upload
- **Parameters**: `filename`, `deal_id`, `user_id`
- **Returns**: `uploadUrl`, `path`, `token`

#### `POST /api/files/confirm-upload`
- **Purpose**: Confirm successful upload and create document record
- **Parameters**: `deal_id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `user_id`
- **Returns**: Document record with analysis metadata

#### `POST /api/files/parse/:document_id`
- **Purpose**: Parse uploaded document and extract structured data
- **Parameters**: `document_id`, `user_id`
- **Returns**: Analysis record with parsed text and periodicity data

## File Type Support

### CSV Files
- **Parser**: PapaParse library with header detection
- **Data Extraction**: Automatic period/account/value column detection
- **Periodicity**: Pattern-based format detection (annual/quarterly/monthly)

### XLSX Files
- **Parser**: XLSX library with sheet-to-JSON conversion
- **Column Mapping**: Flexible column name matching
- **Data Validation**: Numeric value validation and row filtering

### PDF Files
- **Parser**: pdf-parse library
- **Output**: Extracted text for further analysis

### Plain Text
- **Parser**: Direct UTF-8 conversion
- **Fallback**: Latin1 encoding support

## Testing

### Server Tests
```bash
cd server
npm run test:phase4
```

### Client Tests
```bash
cd client
npm test -- --run src/hooks/__tests__/useFileUpload.test.ts
npm test -- --run src/components/files/__tests__/UploadDialog.test.tsx
```

## Configuration

### Server Limits
```typescript
// Express limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer limits
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
```

### Environment Variables
```bash
# Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage bucket
STORAGE_BUCKET=documents
```

## Usage Examples

### Upload CSV File
```typescript
import { useFileUpload } from '../hooks/useFileUpload';

const { uploadFiles } = useFileUpload();

const handleUpload = async (files: File[]) => {
  await uploadFiles(files, dealId, userId);
};
```

### Parse Document
```typescript
const response = await fetch(`/api/files/parse/${documentId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: userId })
});

const analysis = await response.json();
console.log('Rows parsed:', analysis.analysis_result.rows_parsed);
console.log('Periodicity:', analysis.analysis_result.periodicity);
```

## Performance Considerations

### Upload Optimization
- **Sequential Processing**: Files processed one at a time to avoid server overload
- **Progress Tracking**: Real-time feedback for user experience
- **Memory Management**: Efficient buffer handling for large files

### Parsing Performance
- **Streaming**: Large files processed in chunks when possible
- **Caching**: Parsed results stored in database for reuse
- **Background Processing**: Parsing happens asynchronously after upload

## Security Features

### Access Control
- **User Verification**: Deal ownership verification before upload
- **Signed URLs**: Temporary, secure upload URLs with expiration
- **RLS Policies**: Row-level security in Supabase for document access

### File Validation
- **Type Checking**: MIME type and extension validation
- **Size Limits**: Configurable file size restrictions
- **Content Scanning**: Basic content validation during parsing

## Monitoring and Logging

### Upload Logging
```typescript
console.log(`Document parsed successfully:`, {
  document_id,
  filename: document.original_name,
  mime_type: document.mime_type,
  word_count: parsedDocument.text.split(/\s+/).filter(Boolean).length,
  rows_parsed: parsedDocument.rows?.length || 0,
  periodicity: parsedDocument.periodicity
});
```

### Error Tracking
- **Upload Failures**: Detailed error logging with context
- **Parsing Errors**: Graceful fallbacks with error reporting
- **Encoding Issues**: Automatic detection and fallback handling

## Future Enhancements

### Planned Features
- **Batch Processing**: Parallel file processing for improved performance
- **Advanced Parsing**: Machine learning-based document classification
- **Format Conversion**: Automatic conversion between file formats
- **Compression**: File compression for storage optimization

### Scalability Improvements
- **Queue System**: Background job processing for large files
- **CDN Integration**: Global content delivery for uploaded files
- **Caching Layer**: Redis-based caching for frequently accessed documents

## Troubleshooting

### Common Issues

#### Upload Failures
- **Check file size**: Ensure file is under 50MB limit
- **Verify file type**: Supported formats: CSV, XLSX, PDF, TXT
- **Check permissions**: Verify user has access to the deal

#### Parsing Errors
- **Encoding issues**: Check file encoding (UTF-8 preferred)
- **Format validation**: Ensure CSV/XLSX follows expected structure
- **Column mapping**: Verify period/account/value columns exist

#### Performance Issues
- **Large files**: Consider splitting very large files
- **Multiple uploads**: Process files sequentially for stability
- **Network issues**: Check upload bandwidth and stability

## Conclusion

Phase 4 successfully implements a robust, scalable file upload and parsing system that handles the core requirements of the Finsight application. The implementation provides:

- **Reliable Upload**: Secure, signed URL-based uploads with progress tracking
- **Flexible Parsing**: Support for multiple file formats with intelligent data extraction
- **Error Resilience**: Graceful handling of edge cases and failures
- **Performance**: Efficient processing of large files with proper resource management
- **Security**: Comprehensive access control and validation

The system is ready for production use and provides a solid foundation for future enhancements and scaling.
