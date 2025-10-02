import { useMsal } from '@azure/msal-react';
import React from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { LogOutIcon } from 'lucide-react';

export interface Props {
  className?: string;
}

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY;

export const SignOutButton = React.forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    const { instance } = useMsal();

    const handleLogout = () => {
      instance.logoutRedirect();
      localStorage.removeItem('accessToken');
      localStorage.removeItem(STORAGE_KEY);
    };
    return (
      <span className="flex w-full items-center">
        <LogOutIcon className="h-5 w-5" />
        <Button
          onClick={handleLogout}
          ref={ref}
          variant="ghost"
          size="default"
          className={cn('w-full', props.className)}
        >
          Sign Out
        </Button>
      </span>
    );
  }
);
