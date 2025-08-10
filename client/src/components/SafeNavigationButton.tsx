import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface SafeNavigationButtonProps {
  to: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function SafeNavigationButton({ 
  to, 
  children, 
  variant = 'default',
  size = 'default',
  className 
}: SafeNavigationButtonProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    // Use setTimeout to ensure the event is fully processed
    setTimeout(() => {
      navigate(to);
    }, 0);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      type="button"
    >
      {children}
    </Button>
  );
} 