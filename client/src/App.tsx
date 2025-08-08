import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import DealsList from './pages/DealsList';
import DealDetail from './pages/DealDetail';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import './App.css';

const pk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
  return (
    <ClerkProvider
      publishableKey={pk}
      routerPush={(to: string) => navigate(to)}
      routerReplace={(to: string) => navigate(to, { replace: true })}
      afterSignInUrl="/deals"
      afterSignUpUrl="/deals"
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/deals" element={<Protected><DealsList /></Protected>} />
        <Route path="/deals/:dealId" element={<Protected><DealDetail /></Protected>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ClerkProvider>
  );
}