import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  health_score?: number;
  metrics?: {
    revenue?: number;
    profit_margin?: number;
    growth_rate?: number;
    [key: string]: any;
  };
  documents?: any[];
}

interface ComparisonResult {
  deal: Deal;
  score: number;
  rank: number;
  strengths: string[];
  weaknesses: string[];
}

export default function HeadToHead() {
  const location = useLocation();
  const navigate = useNavigate();
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(true);

  const deals: Deal[] = location.state?.deals || [];
  const selectedDealIds: string[] = location.state?.selectedDealIds || [];

  useEffect(() => {
    if (deals.length === 0) {
      navigate('/saved-deals');
      return;
    }

    // Compare deals logic
    const compareDeals = () => {
      const results: ComparisonResult[] = deals.map(deal => {
        // Calculate a score based on available metrics
        let score = 0;
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Parse metrics from description field (temporary solution)
        let metrics = {};
        let healthScore = 0;
        
        // Try to extract metrics from description field
        if (deal.description && deal.description.includes('[METRICS:')) {
          try {
            const metricsMatch = deal.description.match(/\[METRICS:(.*?)\]/);
            if (metricsMatch) {
              metrics = JSON.parse(metricsMatch[1]);
              healthScore = metrics.health_score || 0;
            }
          } catch (e) {
            console.log('Failed to parse metrics from description for deal:', deal.id);
          }
        }

        if (healthScore) {
          score += healthScore * 0.4; // 40% weight
          if (healthScore > 80) {
            strengths.push('Excellent health score');
          } else if (healthScore < 50) {
            weaknesses.push('Low health score');
          }
        }

        if (metrics?.revenue) {
          score += Math.min(metrics.revenue / 1000000, 100) * 0.3; // 30% weight
          if (metrics.revenue > 5000000) {
            strengths.push('High revenue');
          } else if (metrics.revenue < 1000000) {
            weaknesses.push('Low revenue');
          }
        }

        if (metrics?.profit_margin) {
          score += metrics.profit_margin * 0.2; // 20% weight
          if (metrics.profit_margin > 20) {
            strengths.push('Strong profit margin');
          } else if (metrics.profit_margin < 10) {
            weaknesses.push('Weak profit margin');
          }
        }

        if (metrics?.growth_rate) {
          score += Math.min(metrics.growth_rate, 50) * 0.1; // 10% weight
          if (metrics.growth_rate > 20) {
            strengths.push('High growth rate');
          } else if (metrics.growth_rate < 5) {
            weaknesses.push('Low growth rate');
          }
        }

        return {
          deal: { ...deal, metrics, health_score: healthScore },
          score: Math.round(score),
          rank: 0,
          strengths,
          weaknesses
        };
      });

      // Sort by score (highest first) and assign ranks
      results.sort((a, b) => b.score - a.score);
      results.forEach((result, index) => {
        result.rank = index + 1;
      });

      setComparisonResults(results);
      setLoading(false);
    };

    compareDeals();
  }, [deals, navigate]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <Badge variant="secondary">#{rank}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Analyzing deals...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/saved-deals')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Saved Deals
        </Button>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Head to Head Comparison</h1>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Comparison Summary</h2>
        </div>
        <p className="text-muted-foreground">
          Comparing {deals.length} deals based on health score, revenue, profit margin, and growth rate.
          Deals are ranked from best to worst performance.
        </p>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {comparisonResults.map((result, index) => (
          <Card key={result.deal.id} className="relative">
            {/* Rank Badge */}
            <div className="absolute -top-3 -left-3 z-10">
              {getRankIcon(result.rank)}
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{result.deal.title}</CardTitle>
                    <Badge 
                      variant={result.rank === 1 ? "default" : "secondary"}
                      className={result.rank === 1 ? "bg-green-600" : ""}
                    >
                      {result.rank === 1 ? "Winner" : `Rank #${result.rank}`}
                    </Badge>
                  </div>
                  {result.deal.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {result.deal.description.includes('[METRICS:') 
                        ? result.deal.description.split('[METRICS:')[0].trim()
                        : result.deal.description
                      }
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {result.deal.health_score && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">{result.deal.health_score}</div>
                    <div className="text-xs text-muted-foreground">Health Score</div>
                  </div>
                )}
                {result.deal.metrics?.revenue && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">
                      ${(result.deal.metrics.revenue / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                )}
                {result.deal.metrics?.profit_margin && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">{result.deal.metrics.profit_margin}%</div>
                    <div className="text-xs text-muted-foreground">Profit Margin</div>
                  </div>
                )}
                {result.deal.metrics?.growth_rate && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">{result.deal.metrics.growth_rate}%</div>
                    <div className="text-xs text-muted-foreground">Growth Rate</div>
                  </div>
                )}
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                {result.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-green-600">Strengths</h4>
                    </div>
                    <ul className="space-y-1">
                      {result.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-green-700 flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.weaknesses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <h4 className="font-medium text-red-600">Areas for Improvement</h4>
                    </div>
                    <ul className="space-y-1">
                      {result.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm text-red-700 flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/deals/${result.deal.id}`)}
                  className="w-full"
                >
                  View Deal Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 