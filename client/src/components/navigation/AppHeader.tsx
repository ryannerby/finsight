import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bookmark } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';

export function AppHeader({ className }: { className?: string }) {
  const navigate = useNavigate();
  const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const handleBrandClick = () => {
    if (hasClerk) {
      navigate('/deals');
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    if (hasClerk && isSignedIn) {
      try {
        await signOut();
        navigate('/login');
      } catch (error) {
        console.error('Error signing out:', error);
        navigate('/login');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <header className={cn('w-full border-b bg-background', className)}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
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
          
          {hasClerk && isSignedIn && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}</span>
            </div>
          )}
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
          {hasClerk && isSignedIn ? (
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          ) : hasClerk ? (
            <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
          ) : (
            <Button variant="outline" onClick={handleLogout}>Demo Mode</Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;

