import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock data for deals - using UUIDs to match database
const mockDeals = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'TechCorp Acquisition',
    company: 'TechCorp Inc.',
    status: 'In Progress',
    value: '$2.5M',
    date: '2024-01-15',
    description: 'Strategic acquisition of emerging tech company'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Healthcare Merger',
    company: 'MedLife Solutions',
    status: 'Under Review',
    value: '$5.8M',
    date: '2024-01-10',
    description: 'Merger with regional healthcare provider'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Retail Expansion',
    company: 'RetailMax',
    status: 'Completed',
    value: '$1.2M',
    date: '2024-01-05',
    description: 'Expansion into new market territories'
  }
];

export default function DealsList() {
  const [deals, setDeals] = useState(mockDeals);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    company: '',
    description: '',
    value: ''
  });
  const navigate = useNavigate();

  const handleDealClick = (dealId: string) => {
    navigate(`/deals/${dealId}`);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/');
  };

  const handleCreateDeal = async () => {
    try {
      // Create new deal with demo user ID
      const response = await fetch('http://localhost:3001/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newDeal.title,
          description: newDeal.description,
          user_id: 'demo-user-123'
        }),
      });

      if (response.ok) {
        const createdDeal = await response.json();
        
        // Add to local state
        const dealToAdd = {
          id: createdDeal.id,
          title: newDeal.title,
          company: newDeal.company || 'N/A',
          status: 'In Progress',
          value: newDeal.value || '$0',
          date: new Date().toISOString().split('T')[0],
          description: newDeal.description
        };
        
        setDeals([dealToAdd, ...deals]);
        
        // Reset form and close dialog
        setNewDeal({ title: '', company: '', description: '', value: '' });
        setIsCreateDialogOpen(false);
        
        // Navigate to the new deal
        navigate(`/deals/${createdDeal.id}`);
      } else {
        console.error('Failed to create deal');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

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
          <div className="flex gap-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  ➕ Create Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Deal</DialogTitle>
                  <DialogDescription>
                    Add a new financial deal to track and analyze
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newDeal.title}
                      onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                      className="col-span-3"
                      placeholder="Deal title"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={newDeal.company}
                      onChange={(e) => setNewDeal({...newDeal, company: e.target.value})}
                      className="col-span-3"
                      placeholder="Company name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">
                      Value
                    </Label>
                    <Input
                      id="value"
                      value={newDeal.value}
                      onChange={(e) => setNewDeal({...newDeal, value: e.target.value})}
                      className="col-span-3"
                      placeholder="$1.5M"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newDeal.description}
                      onChange={(e) => setNewDeal({...newDeal, description: e.target.value})}
                      className="col-span-3"
                      placeholder="Deal description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDeal} disabled={!newDeal.title || !newDeal.description}>
                    Create Deal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div 
              onClick={handleBackClick}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors cursor-pointer text-center"
            >
              Back to Home
            </div>
          </div>
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