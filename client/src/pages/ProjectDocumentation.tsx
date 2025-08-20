import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Building2, 
  Database, 
  Code, 
  Brain, 
  Shield, 
  Settings, 
  TrendingUp, 
  FileText,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const ProjectDocumentation = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const architectureFeatures = [
    {
      title: 'Monorepo Structure',
      description: 'Organized workspace with client, server, and shared packages',
      details: ['React frontend with TypeScript', 'Node.js backend with Express', 'Shared utilities and types', 'Concurrent development setup']
    },
    {
      title: 'Database Design',
      description: 'Supabase-powered relational database with proper relationships',
      details: ['Deals → Documents → Analyses hierarchy', 'User isolation and security', 'Comprehensive audit logging', 'Optimized indexes for performance']
    },
    {
      title: 'API Architecture',
      description: 'RESTful API with proper error handling and validation',
      details: ['Health monitoring endpoints', 'File upload with pre-signed URLs', 'Rate limiting and security', 'Comprehensive error handling']
    }
  ];

  const financialFeatures = [
    {
      title: 'AI-Powered Analysis',
      description: 'Claude AI integration for financial document processing',
      details: ['PDF, CSV, and Excel parsing', 'Automated financial ratio calculation', 'Red flag detection system', 'Risk assessment and scoring']
    },
    {
      title: 'Health Score Dashboard',
      description: 'Comprehensive financial health visualization',
      details: ['0-100 scoring system', 'Traffic light indicators', 'Top strengths and risks', 'Investment recommendations']
    },
    {
      title: 'Financial Metrics',
      description: '20+ industry-standard financial ratios',
      details: ['Profitability ratios', 'Liquidity metrics', 'Leverage analysis', 'Efficiency indicators', 'Growth measurements']
    }
  ];

  const technicalFeatures = [
    {
      title: 'Frontend Architecture',
      description: 'Modern React with TypeScript and Tailwind CSS',
      details: ['Component-based architecture', 'Custom hooks for state management', 'shadcn/ui component library', 'Responsive design system']
    },
    {
      title: 'Backend Services',
      description: 'Modular service architecture with clear separation',
      details: ['Document processing pipeline', 'AI analysis engine', 'Financial calculations', 'Error handling and validation']
    },
    {
      title: 'Security & Authentication',
      description: 'Clerk integration with comprehensive access control',
      details: ['JWT-based authentication', 'User isolation and permissions', 'Rate limiting and validation', 'Audit logging system']
    }
  ];

  const dataFlowSteps = [
    {
      step: 1,
      title: 'File Upload',
      description: 'Secure file upload to Supabase Storage',
      details: ['Drag & drop interface', 'File type detection', 'Size validation (50MB limit)', 'Pre-signed URL security']
    },
    {
      step: 2,
      title: 'Document Processing',
      description: 'AI-powered text extraction and normalization',
      details: ['PDF parsing with pdf-parse', 'CSV processing with papaparse', 'Excel handling with xlsx', 'Account name standardization']
    },
    {
      step: 3,
      title: 'AI Analysis',
      description: 'Claude AI processes with financial expertise',
      details: ['Specialized financial prompts', 'Structured JSON responses', 'Metrics calculation', 'Risk assessment']
    },
    {
      step: 4,
      title: 'Results & Visualization',
      description: 'Interactive dashboards and insights',
      details: ['Health score dashboard', 'Financial metrics display', 'Risk indicators', 'Export capabilities']
    }
  ];

  const financialRatios = [
    { category: 'Profitability', ratios: ['Gross Margin', 'Net Margin', 'EBITDA Margin', 'Operating Margin'] },
    { category: 'Liquidity', ratios: ['Current Ratio', 'Quick Ratio', 'Working Capital', 'Cash Flow'] },
    { category: 'Leverage', ratios: ['Debt-to-Equity', 'Leverage Ratio', 'Interest Coverage', 'DSCR Proxy'] },
    { category: 'Efficiency', ratios: ['Asset Turnover', 'Inventory Turnover', 'AR Days', 'AP Days', 'CCC Days'] },
    { category: 'Growth', ratios: ['Revenue CAGR (3Y)', 'Seasonality Index', 'Accrual vs Cash Delta'] }
  ];

  const riskCategories = [
    {
      category: 'Revenue Quality',
      indicators: ['Revenue anomalies', 'Seasonal patterns', 'Growth consistency', 'Customer concentration']
    },
    {
      category: 'Margin Trends',
      indicators: ['Gross margin stability', 'Operating efficiency', 'Cost structure analysis', 'Profitability trends']
    },
    {
      category: 'Liquidity',
      indicators: ['Current ratio health', 'Working capital adequacy', 'Cash flow stability', 'Quick ratio assessment']
    },
    {
      category: 'Leverage',
      indicators: ['Debt levels', 'Interest coverage', 'Financial flexibility', 'Capital structure']
    },
    {
      category: 'Working Capital',
      indicators: ['Cash conversion cycle', 'Inventory management', 'AR/AP efficiency', 'Working capital timing']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Finsight Project Documentation</h1>
              <p className="text-muted-foreground">Complete system architecture and feature guide</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Financial Insights & Deal Management Platform</span>
            <ArrowRight className="h-4 w-4" />
            <span>AI-Powered Due Diligence Tool</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Overview Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Finsight is an AI-powered SaaS tool that automates financial due diligence for small business acquisitions. 
              It transforms complex financial analysis from a weeks-long manual process into a minutes-long automated analysis.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">Target Users</h4>
                <ul className="text-sm space-y-1">
                  <li>• Acquisition Entrepreneurs</li>
                  <li>• Micro Private Equity Firms</li>
                  <li>• Solo Buyers/Searchers</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border">
                <h4 className="font-semibold text-green-700 mb-2">Key Benefits</h4>
                <ul className="text-sm space-y-1">
                  <li>• Reduce analysis time from months to hours</li>
                  <li>• Identify critical risks early</li>
                  <li>• Consistent analysis framework</li>
                  <li>• Cost-effective due diligence</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-semibold text-blue-700 mb-2">Core Features</h4>
                <ul className="text-sm space-y-1">
                  <li>• Document upload & processing</li>
                  <li>• AI financial analysis</li>
                  <li>• Red flag detection</li>
                  <li>• Health score dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="dataflow" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Flow
            </TabsTrigger>
          </TabsList>

          {/* Architecture Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monorepo Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Monorepo Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">client/</span>
                      <span className="text-sm text-muted-foreground">React frontend with TypeScript</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">server/</span>
                      <span className="text-sm text-muted-foreground">Node.js backend with Express</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium">shared/</span>
                      <span className="text-sm text-muted-foreground">Common types and utilities</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Schema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">deals</span>
                      <span className="text-muted-foreground">→ User's financial deals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">documents</span>
                      <span className="text-muted-foreground">→ Uploaded financial files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">analyses</span>
                      <span className="text-muted-foreground">→ AI analysis results</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">qas</span>
                      <span className="text-muted-foreground">→ Q&A interactions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Architecture Features */}
            <Card>
              <CardHeader>
                <CardTitle>Architecture Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {architectureFeatures.map((feature, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                      <ul className="text-sm space-y-1">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            {/* Financial Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Analysis Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {financialFeatures.map((feature, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                      <ul className="text-sm space-y-1">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Ratios */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Ratios & Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {financialRatios.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-primary mb-3">{category.category}</h4>
                      <ul className="text-sm space-y-1">
                        {category.ratios.map((ratio, ratioIndex) => (
                          <li key={ratioIndex} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                            {ratio}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {riskCategories.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">{category.category}</h4>
                      <ul className="text-sm space-y-1">
                        {category.indicators.map((indicator, indicatorIndex) => (
                          <li key={indicatorIndex} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            {/* Technical Features */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {technicalFeatures.map((feature, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                      <ul className="text-sm space-y-1">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Frontend</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">React 18</Badge>
                        <span className="text-sm">Modern UI framework</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">TypeScript</Badge>
                        <span className="text-sm">Type-safe development</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Tailwind CSS</Badge>
                        <span className="text-sm">Utility-first styling</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">shadcn/ui</Badge>
                        <span className="text-sm">Component library</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Backend</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Node.js</Badge>
                        <span className="text-sm">Runtime environment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Express</Badge>
                        <span className="text-sm">Web framework</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Supabase</Badge>
                        <span className="text-sm">Database & storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Claude AI</Badge>
                        <span className="text-sm">AI analysis engine</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Flow Tab */}
          <TabsContent value="dataflow" className="space-y-6">
            {/* Data Flow Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Document Processing Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataFlowSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        <ul className="text-sm space-y-1">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Core Endpoints</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <span>/api/health</span>
                        <span className="text-muted-foreground">Health check</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/deals</span>
                        <span className="text-muted-foreground">Create deal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/analyze</span>
                        <span className="text-muted-foreground">Run analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/qa</span>
                        <span className="text-muted-foreground">Ask questions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">File Management</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/files/upload-url</span>
                        <span className="text-muted-foreground">Get upload URL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/files/confirm-upload</span>
                        <span className="text-muted-foreground">Confirm upload</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <span>/api/files/deal/:id</span>
                        <span className="text-muted-foreground">Get deal files</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => window.open('/deals', '_blank')}>
                View Deals
              </Button>
              <Button variant="outline" onClick={() => window.open('/health-score-demo', '_blank')}>
                Health Score Demo
              </Button>
              <Button variant="outline" onClick={() => window.open('/visual-enhancements-demo', '_blank')}>
                Visual Enhancements
              </Button>
              <Button variant="outline" onClick={() => window.open('/metrics-demo', '_blank')}>
                Metrics Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDocumentation;
