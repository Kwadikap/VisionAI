import { cn } from '@/lib/utils';
import { loginRequest } from '@/shared/authConfig';
import { useMsal } from '@azure/msal-react';
import { LoaderCircle, LogInIcon } from 'lucide-react';

export const SignInButton = ({ className }: { className?: string }) => {
  const { instance, inProgress } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: loginRequest.scopes,
    });
  };

  const loading = inProgress === 'login';
  return (
    <button
      disabled={loading}
      onClick={handleLogin}
      className={cn(
        'inline-flex w-max items-center rounded bg-gray-800 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {loading && <LoaderCircle className="animate-spin" />}
      <div>{loading ? 'Signing In...' : 'Sign In'}</div>
      <LogInIcon className="ml-2 h-5 w-5" />
    </button>
  );
};
