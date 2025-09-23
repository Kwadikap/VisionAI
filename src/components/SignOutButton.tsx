import { useMsal } from '@azure/msal-react';
import React from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface Props {
  className?: string;
}

export const SignOutButton = React.forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    const { instance } = useMsal();

    const handleLogout = () => {
      instance.logoutRedirect();
      localStorage.removeItem('accessToken');
    };
    return (
      <Button
        onClick={handleLogout}
        ref={ref}
        variant="ghost"
        size="default"
        className={cn(
          'w-full justify-start bg-slate-600 dark:text-white',
          props.className
        )}
      >
        Sign Out
      </Button>
    );
  }
);
