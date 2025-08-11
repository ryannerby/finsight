import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SafeNavigationButton } from '@/components/SafeNavigationButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for deals
const mockDeals = [
  {
    id: '1',
    title: 'TechCorp Acquisition',
    company: 'TechCorp Inc.',
    status: 'In Progress',
    value: '$2.5M',
    date: '2024-01-15',
    description: 'Strategic acquisition of emerging tech company'
  },
  {
    id: '2',
    title: 'Healthcare Merger',
    company: 'MedLife Solutions',
    status: 'Under Review',
    value: '$5.8M',
    date: '2024-01-10',
    description: 'Merger with regional healthcare provider'
  },
  {
    id: '3',
    title: 'Retail Expansion',
    company: 'RetailMax',
    status: 'Completed',
    value: '$1.2M',
    date: '2024-01-05',
    description: 'Expansion into new market territories'
  }
];

export default function DealsList() {
  const [deals] = useState(mockDeals);
  const navigate = useNavigate();

  const handleDealClick = (dealId: string) => {
    navigate(`/deals/${dealId}`);
  };

  // Back to Home uses SafeNavigationButton for robust navigation

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'Under Review':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Finsight Deals
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track your financial deals with intelligent insights
            </p>
          </div>
          <SafeNavigationButton 
            to="/"
            className="bg-gray-600 text-white py-2 px-4"
          >
            Back to Home
          </SafeNavigationButton>
        </div>

        <div className="grid gap-6">
          {deals.map((deal) => (
            <Card 
              key={deal.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleDealClick(deal.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{deal.title}</CardTitle>
                    <CardDescription className="text-base">
                      {deal.company}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deal.status)}`}>
                      {deal.status}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">{deal.value}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{deal.description}</p>
                <p className="text-sm text-gray-500">Date: {deal.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {deals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No deals found</p>
            <p className="text-gray-400">Start by creating your first deal</p>
          </div>
        )}
      </div>
    </div>
  );
}