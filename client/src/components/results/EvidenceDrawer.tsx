import React, { useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose 
} from '@/components/ui/dialog';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  ExternalLink, 
  Calendar, 
  User, 
  MapPin,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Evidence } from '../../../../shared/src/types';

interface EvidenceDrawerItem {
  id: string;
  excerpt: string;
  metricId: string;
  sourceDocName: string;
  page?: number;
  row?: number;
  link?: string;
  confidence: number;
  type: string;
  documentId?: string;
  extractedAt?: string;
  extractedBy?: string;
}

interface EvidenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: EvidenceDrawerItem[];
  title?: string;
  className?: string;
}

export function EvidenceDrawer({ 
  open, 
  onOpenChange, 
  items, 
  title = "Supporting Evidence",
  className 
}: EvidenceDrawerProps) {
  const isMobile = useIsMobile();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (open) {
      // Focus the close button on open
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onOpenChange]);

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

  const handleOpenInViewer = (item: EvidenceDrawerItem) => {
    if (item.link) {
      window.open(item.link, '_blank');
    }
  };

  const renderEvidenceItem = (item: EvidenceDrawerItem, index: number) => (
    <div 
      key={item.id} 
      ref={index === 0 ? firstItemRef : undefined}
      className="space-y-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
      tabIndex={0}
      role="article"
      aria-labelledby={`evidence-title-${item.id}`}
    >
      {/* Header with confidence */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 
            id={`evidence-title-${item.id}`}
            className="font-medium text-foreground text-sm leading-tight mb-1"
          >
            {item.type} - {item.metricId}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{item.sourceDocName}</span>
            {item.page && (
              <>
                <MapPin className="w-3 h-3" />
                <span>Page {item.page}</span>
              </>
            )}
            {item.row && (
              <>
                <MapPin className="w-3 h-3" />
                <span>Row {item.row}</span>
              </>
            )}
          </div>
        </div>
        <Badge className={cn("text-xs ml-2", getConfidenceColor(item.confidence))}>
          {getConfidenceLabel(item.confidence)} Confidence
        </Badge>
      </div>

      {/* Excerpt */}
      <div className="bg-muted/30 p-3 rounded-md">
        <p className="text-sm text-foreground leading-relaxed">
          {item.excerpt}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {item.extractedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(item.extractedAt).toLocaleDateString()}</span>
            </div>
          )}
          {item.extractedBy && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{item.extractedBy}</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {item.link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenInViewer(item)}
              className="h-6 px-2 text-xs"
              aria-label={`Open ${item.sourceDocName} in document viewer`}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open in viewer
            </Button>
          )}
        </div>
      </div>

      {/* Separator */}
      {index < items.length - 1 && <Separator />}
    </div>
  );

  const content = (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="h-11 w-11 p-0"
          aria-label="Close evidence drawer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Evidence Items */}
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-1">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No evidence items available</p>
          </div>
        ) : (
          items.map((item, index) => renderEvidenceItem(item, index))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Evidence: {items.length} items</span>
            <span>
              Avg Confidence: {Math.round(items.reduce((sum, item) => sum + item.confidence, 0) / items.length * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile: Use Drawer (bottom sheet style)
  if (isMobile) {
    return (
      <Drawer 
        open={open} 
        onOpenChange={onOpenChange}
        title={title}
        width={420}
      >
        {content}
      </Drawer>
    );
  }

  // Desktop: Use Dialog (modal)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          closeButtonRef.current?.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
