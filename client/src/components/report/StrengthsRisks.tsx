import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EvidencePopover } from './EvidencePopover';
import { StrengthRisk, Evidence } from '../../../../shared/src/types';

interface StrengthsRisksProps {
  strengths: StrengthRisk[];
  risks: StrengthRisk[];
  className?: string;
}

/**
 * Strengths and Risks Component
 * Displays financial strengths and risks in expandable cards with evidence
 */
export function StrengthsRisks({ strengths, risks, className }: StrengthsRisksProps) {
  const [expandedSections, setExpandedSections] = useState<{
    strengths: boolean;
    risks: boolean;
  }>({
    strengths: true,
    risks: true
  });

  const toggleSection = (section: 'strengths' | 'risks') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
        return <XCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getUrgencyIcon = (urgency?: 'immediate' | 'near_term' | 'long_term') => {
    switch (urgency) {
      case 'immediate':
        return <Zap className="w-4 h-4 text-red-600" />;
      case 'near_term':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'long_term':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getUrgencyText = (urgency?: 'immediate' | 'near_term' | 'long_term') => {
    switch (urgency) {
      case 'immediate':
        return 'Immediate';
      case 'near_term':
        return 'Near Term';
      case 'long_term':
        return 'Long Term';
      default:
        return '';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Strengths Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection('strengths')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-green-800">Key Strengths</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {strengths.length} strength{strengths.length !== 1 ? 's' : ''} identified
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-1">
              {expandedSections.strengths ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.strengths && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {strengths.map((strength, index) => (
                <div
                  key={index}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-green-800">{strength.title}</h4>
                        <Badge className={cn("text-xs", getImpactColor(strength.impact))}>
                          <div className="flex items-center space-x-1">
                            {getImpactIcon(strength.impact)}
                            <span>{strength.impact.charAt(0).toUpperCase() + strength.impact.slice(1)} Impact</span>
                          </div>
                        </Badge>
                        {strength.urgency && (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            <div className="flex items-center space-x-1">
                              {getUrgencyIcon(strength.urgency)}
                              <span>{getUrgencyText(strength.urgency)}</span>
                            </div>
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-green-700 mb-3">{strength.description}</p>
                      
                      {strength.quantified_impact && (
                        <div className="mb-3 p-2 bg-green-100 rounded text-sm text-green-800 font-medium">
                          💰 {strength.quantified_impact}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-green-600">
                        <span>{strength.evidence.length} evidence item{strength.evidence.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {/* Evidence Popover */}
                    <EvidencePopover
                      evidence={strength.evidence.map((evidence: Evidence, idx: number) => ({
                        id: evidence.ref || `strength-evidence-${index}-${idx}`,
                        title: `${evidence.type} - ${evidence.ref}`,
                        description: evidence.context || evidence.quote || `Evidence from ${evidence.type}`,
                        confidence: evidence.confidence,
                        source: evidence.document_id,
                        page: evidence.page,
                        documentType: evidence.type
                      }))}
                      trigger={
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <span className="text-xs font-medium">i</span>
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Risks Section */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection('risks')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-red-800">Key Risks</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {risks.length} risk{risks.length !== 1 ? 's' : ''} identified
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-1">
              {expandedSections.risks ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.risks && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {risks.map((risk, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-red-800">{risk.title}</h4>
                        <Badge className={cn("text-xs", getImpactColor(risk.impact))}>
                          <div className="flex items-center space-x-1">
                            {getImpactIcon(risk.impact)}
                            <span>{risk.impact.charAt(0).toUpperCase() + risk.impact.slice(1)} Impact</span>
                          </div>
                        </Badge>
                        {risk.urgency && (
                          <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                            <div className="flex items-center space-x-1">
                              {getUrgencyIcon(risk.urgency)}
                              <span>{getUrgencyText(risk.urgency)}</span>
                            </div>
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-red-700 mb-3">{risk.description}</p>
                      
                      {risk.quantified_impact && (
                        <div className="mb-3 p-2 bg-red-100 rounded text-sm text-red-800 font-medium">
                          ⚠️ {risk.quantified_impact}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-red-600">
                        <span>{risk.evidence.length} evidence item{risk.evidence.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {/* Evidence Popover */}
                    <EvidencePopover
                      evidence={risk.evidence.map((evidence: Evidence, idx: number) => ({
                        id: evidence.ref || `risk-evidence-${index}-${idx}`,
                        title: `${evidence.type} - ${evidence.ref}`,
                        description: evidence.context || evidence.quote || `Evidence from ${evidence.type}`,
                        confidence: evidence.confidence,
                        source: evidence.document_id,
                        page: evidence.page,
                        documentType: evidence.type
                      }))}
                      trigger={
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <span className="text-xs font-medium">i</span>
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

/**
 * Compact Strengths and Risks Component
 * Smaller version for use in summary views
 */
export function StrengthsRisksCompact({ strengths, risks, className }: { strengths: StrengthRisk[]; risks: StrengthRisk[]; className?: string }) {
  const highImpactStrengths = strengths.filter(s => s.impact === 'high').length;
  const highImpactRisks = risks.filter(r => r.impact === 'high').length;

  return (
    <div className={cn("flex items-center space-x-6", className)}>
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">{strengths.length} strengths</span>
        {highImpactStrengths > 0 && (
          <Badge variant="outline" className="text-xs border-green-200 text-green-700">
            {highImpactStrengths} high impact
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <span className="text-sm font-medium text-red-700">{risks.length} risks</span>
        {highImpactRisks > 0 && (
          <Badge variant="outline" className="text-xs border-red-200 text-red-700">
            {highImpactRisks} high impact
          </Badge>
        )}
      </div>
    </div>
  );
}
