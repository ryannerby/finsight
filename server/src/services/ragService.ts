import { env } from '../lib/env';
import { documentChunker, DocumentChunk } from './documentChunker';
import { supabase } from '../config/supabase';

export interface SearchResult {
  chunk: DocumentChunk;
  relevance: number;
  matchedTerms: string[];
}

export interface RAGContext {
  relevantChunks: DocumentChunk[];
  totalChunks: number;
  searchQuery: string;
  confidence: number;
}

export class RAGService {
  private maxChunks = 5; // Top-K chunks to retrieve
  private minRelevanceThreshold = 0.3;

  /**
   * Search for relevant document chunks based on a question
   */
  async searchChunks(
    dealId: string,
    question: string,
    maxResults: number = this.maxChunks
  ): Promise<SearchResult[]> {
    if (!env.ENABLE_RAG) {
      throw new Error('RAG is not enabled');
    }

    // Get all document chunks for this deal
    const chunks = await this.getDealChunks(dealId);
    if (chunks.length === 0) {
      return [];
    }

    // Score chunks based on relevance to the question
    const scoredResults = chunks.map(chunk => ({
      chunk,
      relevance: this.calculateRelevance(question, chunk.content),
      matchedTerms: this.findMatchedTerms(question, chunk.content)
    }));

    // Filter by relevance threshold and sort by score
    const relevantResults = scoredResults
      .filter(result => result.relevance >= this.minRelevanceThreshold)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);

    return relevantResults;
  }

  /**
   * Get RAG context for Q&A
   */
  async getRAGContext(
    dealId: string,
    question: string
  ): Promise<RAGContext> {
    const searchResults = await this.searchChunks(dealId, question);
    
    return {
      relevantChunks: searchResults.map(result => result.chunk),
      totalChunks: searchResults.length,
      searchQuery: question,
      confidence: searchResults.length > 0 ? 
        Math.min(0.9, searchResults[0].relevance + 0.1) : 0.5
    };
  }

  /**
   * Retrieve document chunks for a deal
   */
  private async getDealChunks(dealId: string): Promise<DocumentChunk[]> {
    try {
      // Get documents and their analyses with parsed text
      const { data: documents, error } = await supabase
        .from('documents')
        .select(`
          id,
          filename,
          file_type,
          analyses!inner(
            id,
            parsed_text,
            analysis_type
          )
        `)
        .eq('deal_id', dealId)
        .eq('analyses.analysis_type', 'extraction');

      if (error) {
        console.error('Error fetching deal documents:', error);
        return [];
      }

      const chunks: DocumentChunk[] = [];

      for (const doc of documents || []) {
        const extractionAnalysis = doc.analyses?.find(a => a.analysis_type === 'extraction');
        if (extractionAnalysis?.parsed_text) {
          const docChunks = await documentChunker.chunkDocument(
            doc.id,
            dealId,
            extractionAnalysis.parsed_text,
            doc.file_type || 'unknown',
            doc.filename
          );
          chunks.push(...docChunks);
        }
      }

      return chunks;
    } catch (error) {
      console.error('Error getting deal chunks:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score between question and chunk content
   * Simple TF-IDF inspired scoring without full vector math
   */
  private calculateRelevance(question: string, content: string): number {
    const questionTerms = this.normalizeText(question).split(/\s+/);
    const contentTerms = this.normalizeText(content).split(/\s+/);
    
    let score = 0;
    let matchedTerms = 0;

    for (const term of questionTerms) {
      if (term.length < 3) continue; // Skip very short terms
      
      const termFrequency = contentTerms.filter(t => t.includes(term)).length;
      if (termFrequency > 0) {
        score += Math.min(termFrequency / contentTerms.length * 10, 1);
        matchedTerms++;
      }
    }

    // Normalize by number of question terms
    if (matchedTerms === 0) return 0;
    
    const baseScore = score / questionTerms.length;
    
    // Boost score for longer content matches
    const lengthBonus = Math.min(contentTerms.length / 1000, 0.2);
    
    return Math.min(baseScore + lengthBonus, 1);
  }

  /**
   * Find terms that matched between question and content
   */
  private findMatchedTerms(question: string, content: string): string[] {
    const questionTerms = this.normalizeText(question).split(/\s+/);
    const contentTerms = this.normalizeText(content).split(/\s+/);
    
    return questionTerms.filter(term => 
      term.length >= 3 && contentTerms.some(t => t.includes(term))
    );
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  }

  /**
   * Check if RAG is enabled
   */
  isEnabled(): boolean {
    return env.ENABLE_RAG;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      enabled: env.ENABLE_RAG,
      embeddingsEnabled: env.ENABLE_EMBEDDINGS,
      maxChunks: this.maxChunks,
      relevanceThreshold: this.minRelevanceThreshold
    };
  }
}

export const ragService = new RAGService();
