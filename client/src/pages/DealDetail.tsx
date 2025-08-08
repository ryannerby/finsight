import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

const UploadTab = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="space-y-4">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-lg text-gray-600">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX files up to 10MB</p>
          </div>
          <Button variant="outline">
            Choose Files
          </Button>
        </div>
      </div>
    </div>
    
    <div>
      <h4 className="font-medium mb-3">Recent Uploads</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
              <span className="text-red-600 text-xs font-semibold">PDF</span>
            </div>
            <div>
              <p className="font-medium">Financial_Statement_2024.pdf</p>
              <p className="text-sm text-gray-500">Uploaded 2 hours ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">View</Button>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-600 text-xs font-semibold">DOC</span>
            </div>
            <div>
              <p className="font-medium">Due_Diligence_Report.docx</p>
              <p className="text-sm text-gray-500">Uploaded 1 day ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      </div>
    </div>
  </div>
);

const SummaryTab = ({ deal }: { deal: any }) => (
  <div className="space-y-6">
    <div>
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
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <p className="text-gray-600 leading-relaxed">{deal.description}</p>
    </div>

    <div>
      <h4 className="font-semibold mb-3">Key Metrics</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">85%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">24</p>
              <p className="text-sm text-gray-600">Documents Reviewed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">7</p>
              <p className="text-sm text-gray-600">Days Remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const QATab = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">Q&A Section</h3>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">What is the expected ROI for this acquisition?</h4>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>
          <p className="text-gray-600 mb-3">Based on our financial projections, we expect an ROI of 15-20% within the first 18 months post-acquisition...</p>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">Reply</Button>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">Are there any regulatory compliance issues?</h4>
            <span className="text-sm text-gray-500">3 days ago</span>
          </div>
          <p className="text-gray-600 mb-3">We have conducted a thorough compliance review and identified minimal regulatory hurdles...</p>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">Reply</Button>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h4 className="font-medium mb-3">Ask a Question</h4>
      <div className="space-y-3">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Type your question here..."
        />
        <Button>Submit Question</Button>
      </div>
    </div>
  </div>
);

export default function DealDetail() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'summary' | 'qa'>('summary');

  const deal = dealId ? mockDealData[dealId as keyof typeof mockDealData] : null;

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Deal Not Found</h2>
            <p className="text-gray-600 mb-4">The deal you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/deals')}>Back to Deals</Button>
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
            <Button variant="ghost" onClick={() => navigate('/deals')}>
              ← Back to Deals
            </Button>
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
            {activeTab === 'upload' && <UploadTab />}
            {activeTab === 'summary' && <SummaryTab deal={deal} />}
            {activeTab === 'qa' && <QATab />}
          </div>
        </div>
      </div>
    </div>
  );
}