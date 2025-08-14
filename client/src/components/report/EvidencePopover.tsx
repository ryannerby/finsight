import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, ExternalLink, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  confidence: number;
  source?: string;
  page?: number;
  documentType?: string;
  extractedAt?: string;
  extractedBy?: string;
}

interface EvidencePopoverProps {
  evidence: EvidenceItem[];
  trigger: React.ReactNode;
  className?: string;
}

/**
 * Evidence Popover Component
 * Displays evidence details in a popover format
 */
export function EvidencePopover({ evidence, trigger, className }: EvidencePopoverProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className={cn("w-80 p-0", className)} align="end">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-900">Supporting Evidence</h4>
            <Badge variant="outline" className="text-xs">
              {evidence.length} item{evidence.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {evidence.map((item, index) => (
              <div key={item.id || index} className="space-y-2">
                {index > 0 && <Separator />}
                
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900 text-sm leading-tight">
                      {item.title}
                    </h5>
                    <Badge className={cn("text-xs", getConfidenceColor(item.confidence))}>
                      {getConfidenceLabel(item.confidence)} Confidence
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2">
                    {/* Source Information */}
                    {item.source && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <ExternalLink className="w-3 h-3" />
                        <span>Source: {item.source}</span>
                        {item.page && <span>• Page {item.page}</span>}
                      </div>
                    )}
                    
                    {/* Document Type */}
                    {item.documentType && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <FileText className="w-3 h-3" />
                        <span>Document: {item.documentType}</span>
                      </div>
                    )}
                    
                    {/* Extraction Details */}
                    {(item.extractedAt || item.extractedBy) && (
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        {item.extractedAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(item.extractedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {item.extractedBy && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>By {item.extractedBy}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Evidence ID: {evidence[0]?.id || 'N/A'}</span>
              <span>Confidence: {Math.round(evidence[0]?.confidence * 100 || 0)}%</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Evidence Tooltip Component
 * Simpler version for inline tooltips
 */
export function EvidenceTooltip({ 
  evidence, 
  children, 
  className 
}: { 
  evidence: EvidenceItem; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative inline-block", className)}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        <div className="font-medium mb-1">{evidence.title}</div>
        <div className="text-gray-300 text-xs">
          Confidence: {Math.round(evidence.confidence * 100)}%
        </div>
        {evidence.source && (
          <div className="text-gray-300 text-xs">
            Source: {evidence.source}
          </div>
        )}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

/**
 * Evidence Badge Component
 * Small badge showing evidence count and confidence
 */
export function EvidenceBadge({ 
  evidence, 
  className 
}: { 
  evidence: EvidenceItem[]; 
  className?: string;
}) {
  if (evidence.length === 0) return null;
  
  const avgConfidence = evidence.reduce((sum, item) => sum + item.confidence, 0) / evidence.length;
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs cursor-pointer", getConfidenceColor(avgConfidence))}
    >
      <FileText className="w-3 h-3 mr-1" />
      {evidence.length} evidence
      <span className="ml-1 text-xs">
        ({Math.round(avgConfidence * 100)}%)
      </span>
    </Badge>
  );
}
