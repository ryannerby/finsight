import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// Avoid React hooks from Clerk here to support demo mode without provider

export function AppHeader({ className }: { className?: string }) {
  const navigate = useNavigate();
  const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  const handleBrandClick = () => {
    if (hasClerk) {
      navigate('/deals');
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    // Use global Clerk if available, otherwise just navigate
    const anyWindow = window as any;
    if (anyWindow?.Clerk?.signOut) {
      try {
        await anyWindow.Clerk.signOut();
      } finally {
        navigate('/login');
      }
      return;
    }
    navigate('/');
  };

  return (
    <header className={cn('w-full border-b bg-white', className)}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div
          className="font-semibold text-gray-900 cursor-pointer select-none"
          onClick={handleBrandClick}
        >
          Finsight
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleBrandClick}>Home</Button>
          <Button onClick={() => navigate('/deals/new')}>Create Deal</Button>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;

