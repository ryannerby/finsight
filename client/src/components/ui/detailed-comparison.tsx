import React from 'react';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Target, Activity, Trophy, Award, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface Deal {
  id: string;
  title: string;
  description?: string;
  metrics?: any;
  health_score?: number;
}

interface DetailedComparisonProps {
  deals: Deal[];
  onBack: () => void;
}

interface ComparisonCategory {
  name: string;
  metric: string;
  unit: string;
  icon: React.ReactNode;
  description: string;
  higherIsBetter: boolean;
  useChart: boolean;
}

const comparisonCategories: ComparisonCategory[] = [
  {
    name: "Health Score",
    icon: <Target className="w-5 h-5" />,
    metric: "health_score",
    unit: "%",
    description: "Overall financial health assessment",
    higherIsBetter: true,
    useChart: true // Bar chart for this one
  },
  {
    name: "Revenue",
    icon: <DollarSign className="w-5 h-5" />,
    metric: "revenue",
    unit: "M",
    description: "Total annual revenue",
    higherIsBetter: true,
    useChart: false // Traditional display
  },
  {
    name: "Profit Margin",
    icon: <TrendingUp className="w-5 h-5" />,
    metric: "profit_margin",
    unit: "%",
    description: "Net profit margin percentage",
    higherIsBetter: true,
    useChart: true // Bar chart for this one
  },
  {
    name: "Growth Rate",
    icon: <Activity className="w-5 h-5" />,
    metric: "growth_rate",
    unit: "%",
    description: "Annual growth rate",
    higherIsBetter: true,
    useChart: false // Traditional display
  }
];

export function DetailedComparison({ deals, onBack }: DetailedComparisonProps) {
  const getMetricValue = (deal: Deal, metric: string): number | null => {
    if (metric === 'health_score') {
      return deal.health_score || deal.metrics?.health_score || null;
    }
    return deal.metrics?.[metric] || null;
  };

  const formatValue = (value: number | null, unit: string): string => {
    if (value === null || value === undefined) return 'N/A';
    
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

  // Prepare data for bar chart
  const getBarChartData = (metric: string) => {
    const labels = deals.map(deal => deal.title);
    const data = deals.map(deal => getMetricValue(deal, metric) || 0);
    const colors = deals.map(deal => {
      const bestDeal = getBestDeal({ metric, higherIsBetter: true } as ComparisonCategory);
      return bestDeal && bestDeal.id === deal.id ? '#10b981' : '#3b82f6';
    });

    return {
      labels,
      datasets: [
        {
          label: metric.replace('_', ' ').toUpperCase(),
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for radar chart
  const getRadarChartData = () => {
    const metrics = ['health_score', 'revenue', 'profit_margin', 'growth_rate'];
    const datasets = deals.map((deal, index) => {
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      return {
        label: deal.title,
        data: metrics.map(metric => {
          const value = getMetricValue(deal, metric);
          if (value === null) return 0;
          
          // Normalize values to 0-100 scale
          switch (metric) {
            case 'health_score':
              return value;
            case 'revenue':
              return Math.min((value / 10000000) * 100, 100); // Normalize to 10M max
            case 'profit_margin':
              return Math.min(value * 2, 100); // Normalize to 50% max
            case 'growth_rate':
              return Math.min(value * 2, 100); // Normalize to 50% max
            default:
              return value;
          }
        }),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        borderWidth: 2,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors[index % colors.length],
      };
    });

    return {
      labels: metrics.map(m => m.replace('_', ' ').toUpperCase()),
      datasets,
    };
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Metric Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const radarChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Overall Performance Radar Chart',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Summary
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detailed Head-to-Head Analysis</h1>
            <p className="text-muted-foreground">
              Comprehensive comparison of {deals.length} selected deals
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {deals.length} Deals
        </Badge>
      </div>

      {/* Radar Chart - Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Overall Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <Radar data={getRadarChartData()} options={radarChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Individual Metric Comparisons */}
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
              {category.useChart ? (
                // Chart visualization
                <div className="space-y-4">
                  <div className="h-64">
                    <Bar data={getBarChartData(category.metric)} options={barChartOptions} />
                  </div>
                  
                  {/* Metric Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deals.map((deal) => {
                      const value = getMetricValue(deal, category.metric);
                      const isBest = getBestDeal(category)?.id === deal.id;
                      
                      return (
                        <div
                          key={deal.id}
                          className="p-4 border rounded-lg bg-card"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm truncate">
                              {deal.title}
                            </h4>
                            {isBest && (
                              <Badge variant="secondary" className="text-xs">
                                Best
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Value:</span>
                              <span className="font-medium">
                                {formatValue(value, category.unit)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Performance:</span>
                              <span className={getComparisonColor(category, deal)}>
                                {getComparisonText(category, deal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Traditional display
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
                  
                  {/* Simple Bar Chart for traditional displays */}
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
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Top Performers</h4>
              <ul className="space-y-2 text-sm">
                {comparisonCategories.map((category) => {
                  const bestDeal = getBestDeal(category);
                  return bestDeal ? (
                    <li key={category.metric} className="flex justify-between">
                      <span className="capitalize">{category.name}:</span>
                      <span className="font-medium">{bestDeal.title}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">Analysis Summary</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Radar chart shows overall performance across all metrics</li>
                <li>• Bar charts provide detailed metric comparisons</li>
                <li>• Traditional displays show detailed breakdowns</li>
                <li>• Green indicators show best performers in each category</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 