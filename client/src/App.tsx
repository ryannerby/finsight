import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DealsList from './pages/DealsList';
import DealDetail from './pages/DealDetail';
import CreateDeal from './pages/CreateDeal';
import SavedDeals from './pages/SavedDeals';
import HeadToHead from './pages/HeadToHead';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import AppHeader from './components/navigation/AppHeader';
import { Button } from '@/components/ui/button';
import { MetricTest } from './components/ui/metric-test';
import HealthScoreDemo from './pages/HealthScoreDemo';
import VisualEnhancementsDemo from './pages/VisualEnhancementsDemo';
import ProjectDocumentation from './pages/ProjectDocumentation';
import Pitch from './pages/Pitch';
import { ToastProvider } from '@/hooks/useToast';
import './App.css';

const pk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Simple setup page when authentication is not configured
function SetupPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full bg-card text-card-foreground rounded-lg shadow-md p-6 border">
        <h1 className="text-2xl font-bold mb-4">Finsight</h1>
        <p className="text-muted-foreground mb-4">
          Financial Insights & Deal Management Platform
        </p>
        <div className="bg-[hsl(var(--secondary))]/20 border border-[hsl(var(--secondary))]/40 rounded-md p-4">
          <p className="text-sm text-foreground">
            <strong>Demo Mode:</strong> Authentication is not configured. 
            You can still test the application features.
          </p>
        </div>
        
        <div className="mt-6 space-y-3">
          <Button 
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/deals');
            }}
          >
            View Deals (Demo)
          </Button>
          <Button 
            className="w-full"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/deals/1');
            }}
          >
            View Deal Detail (Demo)
          </Button>
          <Button 
            className="w-full"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/metrics-demo');
            }}
          >
            Enhanced Metrics Demo
          </Button>
          <Button 
            className="w-full"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/health-score-demo');
            }}
          >
            Health Score Dashboard Demo
          </Button>
          <Button 
            className="w-full"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/visual-enhancements-demo');
            }}
          >
            Visual Enhancements Demo
          </Button>
          <Button 
            className="w-full"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/pitch');
            }}
          >
            View Pitch Deck
          </Button>
          <Button 
            className="w-full"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/project-docs');
            }}
          >
            Project Documentation
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p className="mb-2">To configure authentication:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a Clerk account at clerk.com</li>
            <li>Get your publishable key</li>
            <li>Create a .env file in the client directory</li>
            <li>Add: VITE_CLERK_PUBLISHABLE_KEY=your_key_here</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Protected({ children }: { children: JSX.Element }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
}

export default function App() {
  const navigate = useNavigate();
  
  // If Clerk is not configured, show demo mode without authentication
  if (!pk) {
    return (
      <ToastProvider>
        <div>
          <AppHeader />
          <Routes>
            <Route path="/" element={<SetupPage />} />
            <Route path="/login" element={<SetupPage />} />
            <Route path="/deals" element={<DealsList />} />
            <Route path="/deals/new" element={<CreateDeal />} />
            <Route path="/deals/:dealId" element={<DealDetail />} />
            <Route path="/saved-deals" element={<SavedDeals />} />
            <Route path="/head-to-head" element={<HeadToHead />} />
            <Route path="/metrics-demo" element={<MetricTest />} />
            <Route path="/health-score-demo" element={<HealthScoreDemo />} />
            <Route path="/visual-enhancements-demo" element={<VisualEnhancementsDemo />} />
            <Route path="/project-docs" element={<ProjectDocumentation />} />
            <Route path="/pitch" element={<Pitch />} />
            <Route path="*" element={<SetupPage />} />
          </Routes>
        </div>
      </ToastProvider>
    );
  }
  
  return (
    <ClerkProvider publishableKey={pk}>
      <ToastProvider>
        <AppHeader />
        <Routes>
          <Route path="/" element={<Navigate to="/deals" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/deals" element={<Protected><DealsList /></Protected>} />
          <Route path="/deals/new" element={<Protected><CreateDeal /></Protected>} />
          <Route path="/deals/:dealId" element={<Protected><DealDetail /></Protected>} />
          <Route path="/saved-deals" element={<Protected><SavedDeals /></Protected>} />
          <Route path="/head-to-head" element={<Protected><HeadToHead /></Protected>} />
          <Route path="/metrics-demo" element={<Protected><MetricTest /></Protected>} />
          <Route path="/health-score-demo" element={<Protected><HealthScoreDemo /></Protected>} />
          <Route path="/visual-enhancements-demo" element={<Protected><VisualEnhancementsDemo /></Protected>} />
          <Route path="/project-docs" element={<Protected><ProjectDocumentation /></Protected>} />
          <Route path="/pitch" element={<Protected><Pitch /></Protected>} />
          <Route path="*" element={<Navigate to="/deals" replace />} />
        </Routes>
      </ToastProvider>
    </ClerkProvider>
  );
}