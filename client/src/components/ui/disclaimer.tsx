import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerProps {
  type?: 'warning' | 'info';
  className?: string;
  children: React.ReactNode;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ 
  type = 'warning', 
  className,
  children 
}) => {
  const Icon = type === 'warning' ? AlertTriangle : Info;
  
  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border text-sm',
      type === 'warning' 
        ? 'bg-amber-50 border-amber-200 text-amber-800' 
        : 'bg-blue-50 border-blue-200 text-blue-800',
      className
    )}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export const FinancialDisclaimer: React.FC<{ className?: string }> = ({ className }) => (
  <Disclaimer type="warning" className={className}>
    <div className="space-y-2">
      <p className="font-medium">Not Financial Advice</p>
      <p>
        This analysis is for informational purposes only and should not be considered as financial, 
        investment, or legal advice. Always consult with qualified professionals before making 
        investment decisions.
      </p>
      <p className="text-xs opacity-80">
        Data accuracy depends on the quality of uploaded documents. Past performance does not 
        guarantee future results.
      </p>
    </div>
  </Disclaimer>
);

export const AnalysisDisclaimer: React.FC<{ className?: string }> = ({ className }) => (
  <Disclaimer type="info" className={className}>
    <div className="space-y-2">
      <p className="font-medium">AI-Powered Analysis</p>
      <p>
        This analysis is generated using artificial intelligence and should be reviewed by 
        qualified professionals. The system may not capture all nuances or context-specific factors.
      </p>
      <p className="text-xs opacity-80">
        Analysis quality depends on document completeness and clarity. Regular updates may 
        improve accuracy over time.
      </p>
    </div>
  </Disclaimer>
); 