import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { FileList } from '@/components/FileList';
import { UploadProgress } from '@/components/UploadProgress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFiles } from '@/hooks/useFiles';

// Mock deal data - in real app this would come from API
const mockDealData = {
  '1': {
    id: '1',
    title: 'TechCorp Acquisition',
    company: 'TechCorp Inc.',
    status: 'In Progress',
    value: '$2.5M',
    date: '2024-01-15',
    description: 'Strategic acquisition of emerging tech company with strong AI capabilities and market presence.'
  },
  '2': {
    id: '2',
    title: 'Healthcare Merger',
    company: 'MedLife Solutions',
    status: 'Under Review',
    value: '$5.8M',
    date: '2024-01-10',
    description: 'Merger with regional healthcare provider to expand service coverage.'
  },
  '3': {
    id: '3',
    title: 'Retail Expansion',
    company: 'RetailMax',
    status: 'Completed',
    value: '$1.2M',
    date: '2024-01-05',
    description: 'Expansion into new market territories across the midwest region.'
  }
};

const UploadTab = ({ dealId }: { dealId: string }) => {
  // Mock user ID - in real app this would come from auth context
  const userId = 'user_123';
  
  const { uploads, isUploading, uploadFiles, clearUploads, removeUpload } = useFileUpload();
  const { files, loading, error, refreshFiles } = useFiles(dealId, userId);
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    await uploadFiles(selectedFiles, dealId, userId);
    // Refresh the file list after upload completes
    setTimeout(() => {
      refreshFiles();
    }, 1000);
  };

  const handleRunAnalysis = async () => {
    if (files.length === 0) {
      setAnalysisError('No files uploaded to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      // TODO: Replace with actual API call when Ryan implements the backend
      const response = await fetch(`/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          disabled={isUploading}
          acceptedFileTypes={[
            'application/pdf',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
          ]}
          maxFileSize={10}
          multiple={true}
        />
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Upload Progress</h4>
          <UploadProgress
            uploads={uploads}
            onRemove={removeUpload}
            onClear={clearUploads}
          />
        </div>
      )}
      
      {/* File List */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Uploaded Documents</h4>
          <Button variant="ghost" size="sm" onClick={refreshFiles} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        <FileList
          files={files}
          loading={loading}
          error={error}
          onRefresh={refreshFiles}
        />
      </div>

      {/* Analysis Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">AI Analysis</h4>
          <Button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || files.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>
        
        {analysisError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800 text-sm">{analysisError}</p>
          </div>
        )}

        {analysisResult && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h5 className="font-medium mb-3 text-gray-900">Analysis Result (Dev View)</h5>
            <div className="bg-white border border-gray-300 rounded-md p-4">
              <pre className="text-xs text-gray-800 overflow-auto max-h-96">
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryTab = ({ deal }: { deal: any }) => {
  // Analysis data will come from the backend when implemented
  const analysisData = null;

  const getVerdictColor = (verdict: string) => {
    switch (verdict.toUpperCase()) {
      case 'EXCELLENT':
        return 'text-green-600 bg-green-100';
      case 'GOOD':
        return 'text-blue-600 bg-blue-100';
      case 'FAIR':
        return 'text-yellow-600 bg-yellow-100';
      case 'POOR':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrafficLightColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {!analysisData ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Available</h3>
          <p className="text-gray-600 mb-4">
            Upload documents and run analysis to see financial insights and metrics.
          </p>
          <p className="text-sm text-gray-500">
            Go to the Upload tab to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Health Score & Verdict */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Health Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Traffic Light Indicator */}
              <div className="text-center">
                <div className="flex justify-center space-x-2 mb-3">
                  <div className={`w-4 h-4 rounded-full ${getTrafficLightColor(analysisData.health_score)}`}></div>
                  <div className={`w-4 h-4 rounded-full ${analysisData.health_score >= 60 ? 'bg-gray-300' : 'bg-gray-300'}`}></div>
                  <div className={`w-4 h-4 rounded-full ${analysisData.health_score >= 80 ? 'bg-gray-300' : 'bg-gray-300'}`}></div>
                </div>
                <p className="text-sm text-gray-600">Risk Level</p>
              </div>

              {/* Health Score */}
              <div className="text-center">
                <p className={`text-4xl font-bold ${getHealthScoreColor(analysisData.health_score)}`}>
                  {analysisData.health_score}
                </p>
                <p className="text-sm text-gray-600">Health Score</p>
              </div>

              {/* Verdict */}
              <div className="text-center">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getVerdictColor(analysisData.verdict)}`}>
                  {analysisData.verdict}
                </span>
                <p className="text-sm text-gray-600 mt-2">Overall Verdict</p>
              </div>
            </div>
          </div>

          {/* Strengths & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  Key Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisData.risks.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Key Ratios Grid */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Key Financial Ratios</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(analysisData.key_ratios).map(([ratio, value]) => (
                <div key={ratio} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">{ratio}</p>
                  <p className="text-lg font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Deal Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Deal Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value</label>
            <p className="text-xl font-semibold text-green-600">{deal.value}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <p className="text-lg">{deal.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Company</label>
            <p className="text-lg">{deal.company}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
            <p className="text-lg">{deal.date}</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <p className="text-gray-600 leading-relaxed">{deal.description}</p>
        </div>
      </div>
    </div>
  );
};

const QATab = ({ dealId }: { dealId: string }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [newQuestion, setNewQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) {
      setAskError('Please enter a question');
      return;
    }

    setIsAsking(true);
    setAskError(null);

    try {
      // TODO: Replace with actual API call when Ryan implements the backend
      const response = await fetch(`/api/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId,
          question: newQuestion.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Q&A failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Add new Q&A to the list
      const newQA = {
        id: Date.now(),
        question: newQuestion.trim(),
        answer: result.answer,
        timestamp: 'Just now'
      };
      
      setQuestions([newQA, ...questions]);
      setNewQuestion('');
      
    } catch (err) {
      console.error('Q&A error:', err);
      setAskError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Q&A Section</h3>
        {questions.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">No Questions Yet</h4>
            <p className="text-gray-600">
              Ask a question about the uploaded documents to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((qa) => (
              <div key={qa.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{qa.question}</h4>
                  <span className="text-sm text-gray-500">{qa.timestamp}</span>
                </div>
                <p className="text-gray-700 mb-3 leading-relaxed">{qa.answer}</p>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">Ask Follow-up</Button>
                  <Button variant="ghost" size="sm">Copy Answer</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-medium mb-3">Ask a Question</h4>
        <div className="space-y-3">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Ask a question about the uploaded documents..."
            disabled={isAsking}
          />
          {askError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{askError}</p>
            </div>
          )}
          <Button 
            onClick={handleAskQuestion}
            disabled={isAsking || !newQuestion.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAsking ? 'Asking...' : 'Submit Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function DealDetail() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'summary' | 'qa'>('summary');

  const handleBackToDeals = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/deals');
  };

  const deal = dealId ? mockDealData[dealId as keyof typeof mockDealData] : null;

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Deal Not Found</h2>
            <p className="text-gray-600 mb-4">The deal you're looking for doesn't exist.</p>
            <div 
              onClick={handleBackToDeals}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-center"
            >
              Back to Deals
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'upload', label: 'Upload', icon: '📁' },
    { id: 'qa', label: 'Q&A', icon: '💬' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div 
              onClick={handleBackToDeals}
              className="text-blue-600 hover:text-blue-800 cursor-pointer px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              ← Back to Deals
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
              <p className="text-gray-600">{deal.company}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {deal.status}
            </span>
            <span className="text-xl font-semibold">{deal.value}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'upload' && <UploadTab dealId={deal.id} />}
            {activeTab === 'summary' && <SummaryTab deal={deal} />}
            {activeTab === 'qa' && <QATab dealId={deal.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}