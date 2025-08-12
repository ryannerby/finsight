import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import DealsList from './pages/DealsList';
import DealDetail from './pages/DealDetail';
import CreateDeal from './pages/CreateDeal';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import AppHeader from './components/navigation/AppHeader';
import { Button } from '@/components/ui/button';
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
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
      <div>
        <AppHeader />
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/login" element={<SetupPage />} />
          <Route path="/deals" element={<DealsList />} />
          <Route path="/deals/new" element={<CreateDeal />} />
          <Route path="/deals/:dealId" element={<DealDetail />} />
          <Route path="*" element={<SetupPage />} />
        </Routes>
      </div>
    );
  }
  
  return (
    <ClerkProvider
      publishableKey={pk}
      routerPush={(to: string) => navigate(to)}
      routerReplace={(to: string) => navigate(to, { replace: true })}
      afterSignInUrl="/deals"
      afterSignUpUrl="/deals"
    >
      <AppHeader />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/deals" element={<Protected><DealsList /></Protected>} />
        <Route path="/deals/new" element={<Protected><CreateDeal /></Protected>} />
        <Route path="/deals/:dealId" element={<Protected><DealDetail /></Protected>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ClerkProvider>
  );
}