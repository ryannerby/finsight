import { env } from '../lib/env';

export interface DocumentChunk {
  id: string;
  document_id: string;
  deal_id: string;
  content: string;
  metadata: {
    chunk_index: number;
    total_chunks: number;
    document_type: string;
    filename: string;
    page_number?: number;
    section?: string;
    token_count: number;
    created_at: string;
  };
  embedding?: number[]; // Will be populated when embeddings are enabled
}

export interface ChunkingOptions {
  maxTokens?: number;
  overlap?: number;
  preserveSections?: boolean;
  includePageNumbers?: boolean;
}

export class DocumentChunker {
  private defaultMaxTokens = 800;
  private defaultOverlap = 100;

  /**
   * Chunk a document into searchable segments
   */
  async chunkDocument(
    documentId: string,
    dealId: string,
    content: string,
    documentType: string,
    filename: string,
    options: ChunkingOptions = {}
  ): Promise<DocumentChunk[]> {
    const maxTokens = options.maxTokens || this.defaultMaxTokens;
    const overlap = options.overlap || this.defaultOverlap;

    // Simple tokenization (words + punctuation)
    const tokens = this.tokenize(content);
    
    if (tokens.length <= maxTokens) {
      // Document is small enough to fit in one chunk
      return [{
        id: `chunk-${documentId}-0`,
        document_id: documentId,
        deal_id: dealId,
        content: content,
        metadata: {
          chunk_index: 0,
          total_chunks: 1,
          document_type: documentType,
          filename: filename,
          token_count: tokens.length,
          created_at: new Date().toISOString()
        }
      }];
    }

    // Split into overlapping chunks
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;
    let startIndex = 0;

    while (startIndex < tokens.length) {
      const endIndex = Math.min(startIndex + maxTokens, tokens.length);
      const chunkTokens = tokens.slice(startIndex, endIndex);
      const chunkContent = chunkTokens.join(' ');

      chunks.push({
        id: `chunk-${documentId}-${chunkIndex}`,
        document_id: documentId,
        deal_id: dealId,
        content: chunkContent,
        metadata: {
          chunk_index: chunkIndex,
          total_chunks: Math.ceil(tokens.length / maxTokens),
          document_type: documentType,
          filename: filename,
          token_count: chunkTokens.length,
          created_at: new Date().toISOString()
        }
      });

      chunkIndex++;
      startIndex = endIndex - overlap;
    }

    return chunks;
  }

  /**
   * Chunk multiple documents for a deal
   */
  async chunkDealDocuments(
    dealId: string,
    documents: Array<{
      id: string;
      content: string;
      document_type: string;
      filename: string;
    }>
  ): Promise<DocumentChunk[]> {
    const allChunks: DocumentChunk[] = [];

    for (const doc of documents) {
      const chunks = await this.chunkDocument(
        doc.id,
        dealId,
        doc.content,
        doc.document_type,
        doc.filename
      );
      allChunks.push(...chunks);
    }

    return allChunks;
  }

  /**
   * Simple tokenization (words + punctuation)
   * In production, this could use a more sophisticated tokenizer
   */
  private tokenize(text: string): string[] {
    // Split on whitespace and preserve punctuation
    return text
      .split(/\s+/)
      .filter(token => token.length > 0)
      .map(token => token.trim());
  }

  /**
   * Estimate token count for a text
   */
  estimateTokenCount(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if RAG is enabled
   */
  isRAGEnabled(): boolean {
    return env.ENABLE_RAG;
  }

  /**
   * Check if embeddings are enabled
   */
  isEmbeddingsEnabled(): boolean {
    return env.ENABLE_EMBEDDINGS;
  }
}

export const documentChunker = new DocumentChunker();
