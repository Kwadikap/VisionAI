import {
  ChevronDown,
  Send,
  Plus,
  Sun,
  MoreHorizontal,
  MessageCirclePlus,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { ComponentType } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { useTheme, type Theme } from '@/providers/ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignInButton } from './SignInButton';
import { useIsAuthenticated } from '@azure/msal-react';
import { SignOutButton } from './SignOutButton';

interface MenuItem {
  title: string;
  url: string;
  icon: ComponentType;
}

const AGENT_DROPDOWN_LIST: string[] = ['V1'];

// const USER_SETTINGS: string[] = ['Sign out'];

const settings: MenuItem[] = [
  {
    title: 'New Chat',
    url: '/',
    icon: MessageCirclePlus,
  },
  {
    title: 'Feedback',
    url: '/feedback',
    icon: Send,
  },
];

const chatHistory = [
  {
    name: 'How to videos',
    isActive: true,
  },
  {
    name: 'What is an llm',
    isActive: false,
  },
  {
    name: 'Who was the first..',
    isActive: false,
  },
];

enum DISPLAY_MODES {
  LIGHT_MODE = 'Light mode',
  DARK_MODE = 'Dark mode',
  SYSTEM_MODE = 'System mode',
}

const MODE_TO_THEME: Record<string, Theme> = {
  [DISPLAY_MODES.LIGHT_MODE]: 'light',
  [DISPLAY_MODES.DARK_MODE]: 'dark',
  [DISPLAY_MODES.SYSTEM_MODE]: 'system',
};

export function AppSidebar() {
  const isAuthenticated = useIsAuthenticated();
  console.log('user is authenticated', isAuthenticated);
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Sidebar>
      {/* sidebar header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  Select Agent
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                {AGENT_DROPDOWN_LIST.map((agent) => (
                  <DropdownMenuItem key={agent} className="cursor-pointer">
                    <span>{agent}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* sidebar content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                  >
                    <div className="flex cursor-pointer">
                      <item.icon />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Sun />
                  <span>Toggle mode</span>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction>
                      <MoreHorizontal />
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    {Object.values(DISPLAY_MODES).map((mode) => (
                      <DropdownMenuItem
                        key={mode}
                        className="cursor-pointer"
                        onClick={() => setTheme(MODE_TO_THEME[mode])}
                      >
                        <span>{mode}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupAction title="New Chat">
            <Plus /> <span className="sr-only">New Chat</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu className="pr-2">
              {chatHistory.map((chat) => (
                <SidebarMenuItem key={chat.name}>
                  <SidebarMenuButton asChild isActive={chat.isActive}>
                    <span className="cursor-pointer">{chat.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* sidebar footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Replace DropdownMenu with a simple button */}
            <SidebarMenuButton asChild>
              {isAuthenticated ? (
                <SignOutButton />
              ) : (
                <SignInButton className="w-full justify-start" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
