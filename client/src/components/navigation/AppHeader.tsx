import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bookmark } from 'lucide-react';
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
        navigate('/deals');
      }
      return;
    }
    navigate('/');
  };

  return (
    <header className={cn('w-full border-b bg-background', className)}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={handleBrandClick}
        >
          <img
            src="/logo.png"
            alt="Finsight logo"
            className="h-20 w-auto object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleBrandClick}>Home</Button>
          <Button variant="ghost" onClick={() => navigate('/saved-deals')} className="gap-2">
            <Bookmark className="w-4 h-4" />
            Saved Deals
          </Button>
          <Button variant="ghost" onClick={() => navigate('/project-docs')}>
            Documentation
          </Button>
          <Button onClick={() => navigate('/deals?create=1')}>Create Deal</Button>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;

