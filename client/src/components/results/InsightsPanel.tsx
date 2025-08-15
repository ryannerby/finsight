import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Eye, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrengthRisk, Evidence } from '../../../../shared/src/types';
import { EvidenceDrawer } from './EvidenceDrawer';

interface InsightsPanelProps {
  strengths: StrengthRisk[];
  risks: StrengthRisk[];
  className?: string;
  onViewEvidence?: (item: StrengthRisk) => void;
}

/**
 * Insights Panel Component
 * Centralized display of top strengths and risks with evidence linking
 */
export function InsightsPanel({ 
  strengths, 
  risks, 
  className,
  onViewEvidence 
}: InsightsPanelProps) {
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [currentEvidenceItems, setCurrentEvidenceItems] = useState<any[]>([]);
  const [currentEvidenceTitle, setCurrentEvidenceTitle] = useState('');

  // Limit to top 5 items each
  const topStrengths = strengths.slice(0, 5);
  const topRisks = risks.slice(0, 5);

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return <AlertTriangle className="w-3 h-3" />;
      case 'medium':
        return <AlertTriangle className="w-3 h-3" />;
      case 'low':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <AlertTriangle className="w-3 h-3" />;
    }
  };

  // Helper function to transform evidence for EvidenceDrawer
  const transformEvidenceForDrawer = (evidence: Evidence[], itemTitle: string) => {
    return evidence.map((item, idx) => ({
      id: item.ref || `evidence-${idx}`,
      excerpt: item.context || item.quote || `Evidence from ${item.type}`,
      metricId: item.ref,
      sourceDocName: item.document_id || 'Unknown Document',
      page: item.page,
      row: undefined, // Not available in current Evidence type
      link: undefined, // Could be enhanced with document viewer route
      confidence: item.confidence,
      type: item.type,
      documentId: item.document_id,
      extractedAt: undefined, // Not available in current Evidence type
      extractedBy: undefined // Not available in current Evidence type
    }));
  };

  const handleViewEvidence = (item: StrengthRisk) => {
    // Transform evidence for the drawer
    const evidenceItems = transformEvidenceForDrawer(item.evidence, item.title);
    setCurrentEvidenceItems(evidenceItems);
    setCurrentEvidenceTitle(`Evidence for ${item.title}`);
    setEvidenceDrawerOpen(true);

    // Also call the parent handler if provided
    if (onViewEvidence) {
      onViewEvidence(item);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Top Strengths Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-800">Top Strengths</CardTitle>
              <p className="text-sm text-muted-foreground">
                {topStrengths.length} key strength{topStrengths.length !== 1 ? 's' : ''} identified
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {topStrengths.map((strength, index) => (
              <div 
                key={index}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-green-900 text-sm leading-tight truncate">
                      {strength.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getImpactColor(strength.impact))}
                    >
                      <div className="flex items-center space-x-1">
                        {getImpactIcon(strength.impact)}
                        <span className="capitalize">{strength.impact}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed line-clamp-2">
                    {strength.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="sm:ml-3 text-green-700 hover:text-green-800 hover:bg-green-200"
                  onClick={() => handleViewEvidence(strength)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Evidence
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Risks Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-800">Top Risks</CardTitle>
              <p className="text-sm text-muted-foreground">
                {topRisks.length} key risk{topRisks.length !== 1 ? 's' : ''} identified
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {topRisks.map((risk, index) => (
              <div 
                key={index}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-red-900 text-sm leading-tight truncate">
                      {risk.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getImpactColor(risk.impact))}
                    >
                      <div className="flex items-center space-x-1">
                        {getImpactIcon(risk.impact)}
                        <span className="capitalize">{risk.impact}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed line-clamp-2">
                    {risk.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="sm:ml-3 text-red-700 hover:text-red-800 hover:bg-red-200"
                  onClick={() => handleViewEvidence(risk)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Evidence
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Evidence Drawer */}
      <EvidenceDrawer
        open={evidenceDrawerOpen}
        onOpenChange={setEvidenceDrawerOpen}
        items={currentEvidenceItems}
        title={currentEvidenceTitle}
      />
    </div>
  );
}
