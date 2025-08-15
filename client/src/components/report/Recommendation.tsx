import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, CheckCircle, AlertTriangle, XCircle, Info, DollarSign, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SummaryReport } from '../../../../shared/src/types';

interface RecommendationProps {
  recommendation: SummaryReport['recommendation'];
  className?: string;
}

/**
 * Recommendation Component
 * Displays the final decision with rationale and supporting evidence
 */
export function Recommendation({ 
  recommendation, 
  className 
}: RecommendationProps) {
  const [expanded, setExpanded] = useState(true);

  const getRecommendationConfig = (rec: 'Proceed' | 'Caution' | 'Pass') => {
    switch (rec) {
      case 'Proceed':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          badgeColor: 'bg-green-500',
          description: 'Recommended to proceed with this deal'
        };
      case 'Caution':
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          badgeColor: 'bg-yellow-500',
          description: 'Proceed with caution and address key risks'
        };
      case 'Pass':
        return {
          icon: <XCircle className="w-6 h-6" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          badgeColor: 'bg-red-500',
          description: 'Not recommended to proceed with this deal'
        };
    }
  };

  const config = getRecommendationConfig(recommendation.decision);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn("p-3 rounded-lg", config.bgColor)}>
              <div className={config.color}>
                {config.icon}
              </div>
            </div>
            <div>
              <CardTitle className="text-xl">Investment Recommendation</CardTitle>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Confidence Badge */}
            <Badge variant="outline" className="text-sm">
              {Math.round(recommendation.confidence * 100)}% Confidence
            </Badge>
            
            {/* Recommendation Badge */}
            <Badge className={cn("text-white", config.badgeColor)}>
              {recommendation.decision}
            </Badge>
            
            {/* Expand/Collapse Button */}
            <Button variant="ghost" size="sm" className="p-1">
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Rationale */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Rationale</h4>
            <p className="text-gray-700">{recommendation.rationale}</p>
          </div>
          
          {/* Key Factors */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Decision Factors</h4>
            <div className="space-y-2">
              {recommendation.key_factors.map((factor, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{factor}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Valuation Impact */}
          {recommendation.valuation_impact && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Valuation Impact</h4>
              </div>
              <p className="text-blue-700 text-sm">{recommendation.valuation_impact}</p>
            </div>
          )}
          
          {/* Deal Structure Notes */}
          {recommendation.deal_structure_notes && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-purple-900">Deal Structure Recommendations</h4>
              </div>
              <p className="text-purple-700 text-sm">{recommendation.deal_structure_notes}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {recommendation.decision === 'Proceed' && (
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Proceed with Deal
              </Button>
            )}
            
            {recommendation.decision === 'Caution' && (
              <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Review and Revise
              </Button>
            )}
            
            {recommendation.decision === 'Pass' && (
              <Button variant="outline" className="border-red-500 text-red-700 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-2" />
                Decline Deal
              </Button>
            )}
            
            <Button variant="outline">
              <Info className="w-4 h-4 mr-2" />
              Request More Information
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Compact Recommendation Component
 * Smaller version for use in summary views
 */
export function RecommendationCompact({ recommendation, className }: { recommendation: SummaryReport['recommendation']; className?: string }) {
  const getRecommendationColor = (decision: 'Proceed' | 'Caution' | 'Pass') => {
    switch (decision) {
      case 'Proceed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Caution':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pass':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getRecommendationIcon = (decision: 'Proceed' | 'Caution' | 'Pass') => {
    switch (decision) {
      case 'Proceed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Caution':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Pass':
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Recommendation:</span>
        <Badge className={cn("text-xs", getRecommendationColor(recommendation.decision))}>
          <div className="flex items-center space-x-1">
            {getRecommendationIcon(recommendation.decision)}
            <span>{recommendation.decision}</span>
          </div>
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Confidence:</span>
        <Badge variant="outline" className="text-xs">
          {Math.round(recommendation.confidence * 100)}%
        </Badge>
      </div>
      
      {recommendation.valuation_impact && (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-600 font-medium">Valuation Impact</span>
        </div>
      )}
    </div>
  );
}
