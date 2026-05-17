import Link from 'next/link';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, LayoutDashboard } from './icons';
import type { AuthenticatedUser } from '@/types/auth';

interface UserSectionProps {
  user: AuthenticatedUser | null;
  authCheckStatus: string;
  isMounted: boolean;
  onLogout: () => Promise<void>;
  onAdminDashboard: () => void;
}

export const UserSection = memo(function UserSection({ 
  user, 
  authCheckStatus, 
  isMounted, 
  onLogout,
  onAdminDashboard
}: UserSectionProps) {
  // LOADING STATE FIX: Don't show login button while checking auth
  if (!isMounted || ((authCheckStatus === 'idle' || authCheckStatus === 'loading') && !user)) {
    // Show skeleton while checking auth or hydrating to prevent flash/mismatch
    return <div className="hidden h-10 w-10 animate-pulse rounded-full bg-slate-100 md:flex" />;
  }

  if (user) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative hidden h-10 w-10 rounded-full p-0 ring-2 ring-slate-100 transition-all hover:ring-slate-200 md:flex"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || '/default-avatar.png'} alt={user.name || 'User'} className="scale-150" />
              <AvatarFallback className="border border-slate-100 bg-slate-50 font-bold text-slate-700">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs leading-none">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>

          {user && user.role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onAdminDashboard}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              onLogout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        asChild
        className="hidden rounded-full bg-slate-900 px-6 font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 sm:flex"
      >
        <Link href="/login" prefetch={false}>
          Log in
        </Link>
      </Button>
    </div>
  );
});