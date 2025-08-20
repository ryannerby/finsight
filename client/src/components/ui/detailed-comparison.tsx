import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  DollarSign, 
  Activity,
  ArrowLeft,
  Trophy,
  Award,
  AlertTriangle
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  description?: string;
  health_score?: number;
  metrics?: {
    revenue?: number;
    profit_margin?: number;
    growth_rate?: number;
    debt_to_equity?: number;
    current_ratio?: number;
    return_on_equity?: number;
    [key: string]: any;
  };
}

interface DetailedComparisonProps {
  deals: Deal[];
  onBack: () => void;
}

interface ComparisonCategory {
  name: string;
  icon: React.ReactNode;
  metric: string;
  unit: string;
  description: string;
  higherIsBetter: boolean;
}

const comparisonCategories: ComparisonCategory[] = [
  {
    name: "Health Score",
    icon: <Target className="w-5 h-5" />,
    metric: "health_score",
    unit: "",
    description: "Overall financial health assessment",
    higherIsBetter: true
  },
  {
    name: "Revenue",
    icon: <DollarSign className="w-5 h-5" />,
    metric: "revenue",
    unit: "M",
    description: "Total annual revenue",
    higherIsBetter: true
  },
  {
    name: "Profit Margin",
    icon: <TrendingUp className="w-5 h-5" />,
    metric: "profit_margin",
    unit: "%",
    description: "Net profit margin percentage",
    higherIsBetter: true
  },
  {
    name: "Growth Rate",
    icon: <Activity className="w-5 h-5" />,
    metric: "growth_rate",
    unit: "%",
    description: "Annual growth rate",
    higherIsBetter: true
  },
  {
    name: "Debt to Equity",
    icon: <AlertTriangle className="w-5 h-5" />,
    metric: "debt_to_equity",
    unit: "",
    description: "Debt to equity ratio",
    higherIsBetter: false
  },
  {
    name: "Current Ratio",
    icon: <BarChart3 className="w-5 h-5" />,
    metric: "current_ratio",
    unit: "",
    description: "Current assets to current liabilities",
    higherIsBetter: true
  },
  {
    name: "Return on Equity",
    icon: <Award className="w-5 h-5" />,
    metric: "return_on_equity",
    unit: "%",
    description: "Return on equity percentage",
    higherIsBetter: true
  }
];

export function DetailedComparison({ deals, onBack }: DetailedComparisonProps) {
  const getMetricValue = (deal: Deal, metric: string): number | null => {
    if (metric === 'health_score') {
      return deal.health_score || null;
    }
    return deal.metrics?.[metric] || null;
  };

  const formatValue = (value: number | null, unit: string): string => {
    if (value === null) return 'N/A';
    
    if (unit === 'M') {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return value.toFixed(2);
  };

  const getBestDeal = (category: ComparisonCategory): Deal | null => {
    const validDeals = deals.filter(deal => getMetricValue(deal, category.metric) !== null);
    if (validDeals.length === 0) return null;

    return validDeals.reduce((best, current) => {
      const bestValue = getMetricValue(best, category.metric);
      const currentValue = getMetricValue(current, category.metric);
      
      if (bestValue === null) return current;
      if (currentValue === null) return best;
      
      return category.higherIsBetter 
        ? (currentValue > bestValue ? current : best)
        : (currentValue < bestValue ? current : best);
    });
  };

  const getComparisonText = (category: ComparisonCategory, deal: Deal): string => {
    const bestDeal = getBestDeal(category);
    if (!bestDeal || bestDeal.id === deal.id) return "Best in category";
    
    const dealValue = getMetricValue(deal, category.metric);
    const bestValue = getMetricValue(bestDeal, category.metric);
    
    if (dealValue === null || bestValue === null) return "No data available";
    
    const difference = category.higherIsBetter 
      ? ((dealValue - bestValue) / bestValue) * 100
      : ((bestValue - dealValue) / dealValue) * 100;
    
    if (Math.abs(difference) < 1) return "Very close to best";
    if (difference > 0) {
      return `${difference.toFixed(1)}% ${category.higherIsBetter ? 'better' : 'worse'} than ${bestDeal.title}`;
    } else {
      return `${Math.abs(difference).toFixed(1)}% ${category.higherIsBetter ? 'worse' : 'better'} than ${bestDeal.title}`;
    }
  };

  const getComparisonColor = (category: ComparisonCategory, deal: Deal): string => {
    const bestDeal = getBestDeal(category);
    if (!bestDeal || bestDeal.id === deal.id) return "text-green-600";
    
    const dealValue = getMetricValue(deal, category.metric);
    const bestValue = getMetricValue(bestDeal, category.metric);
    
    if (dealValue === null || bestValue === null) return "text-gray-500";
    
    const difference = category.higherIsBetter 
      ? ((dealValue - bestValue) / bestValue) * 100
      : ((bestValue - dealValue) / dealValue) * 100;
    
    if (Math.abs(difference) < 5) return "text-yellow-600";
    if (difference > 0) return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Summary
        </Button>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Detailed Head-to-Head Analysis</h1>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-medium">Deals Compared</span>
            </div>
            <div className="text-2xl font-bold">{deals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="font-medium">Categories</span>
            </div>
            <div className="text-2xl font-bold">{comparisonCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-medium">Best Overall</span>
            </div>
            <div className="text-lg font-semibold">
              {deals.reduce((best, current) => 
                (current.health_score || 0) > (best.health_score || 0) ? current : best
              ).title}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparisons */}
      <div className="space-y-6">
        {comparisonCategories.map((category) => (
          <Card key={category.metric}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {category.icon}
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {deals.map((deal) => {
                  const value = getMetricValue(deal, category.metric);
                  const isBest = getBestDeal(category)?.id === deal.id;
                  
                  return (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{deal.title}</span>
                          {isBest && <Trophy className="w-4 h-4 text-yellow-500" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getComparisonColor(category, deal)}`}>
                          {formatValue(value, category.unit)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getComparisonText(category, deal)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Simple Bar Chart */}
              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium mb-3">Visual Comparison</h4>
                <div className="space-y-2">
                  {deals.map((deal) => {
                    const value = getMetricValue(deal, category.metric);
                    const maxValue = Math.max(...deals.map(d => getMetricValue(d, category.metric) || 0));
                    const percentage = maxValue > 0 ? ((value || 0) / maxValue) * 100 : 0;
                    const isBest = getBestDeal(category)?.id === deal.id;
                    
                    return (
                      <div key={deal.id} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-32 truncate">{deal.title}</span>
                        <div className="flex-1 bg-muted rounded-full h-4">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isBest ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono w-16 text-right">
                          {formatValue(value, category.unit)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 