import {
  Send,
  Sun,
  MoreHorizontal,
  MessageCirclePlus,
  ChevronUp,
  CircleUserRound,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { useEffect, useState, type ComponentType } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { useTheme, type Theme } from '@/providers/ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignInButton } from './SignInButton';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from '@azure/msal-react';
import { SignOutButton } from './SignOutButton';
import { useUserConfig } from '@/hooks/useUserConfig';
import { clearMessages } from './chat-ui/chatSlice';
import { useAppDispatch } from '@/hooks/useState';
import { useSession, type ChatHistory } from '@/hooks/useSession';

interface MenuItem {
  title: string;
  url: string;
  icon: ComponentType;
}

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
  const [chats, setChats] = useState<ChatHistory[]>();
  const { username } = useUserConfig();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { chatHistory, refetchHistory, createSession, sessionLoading } =
    useSession();

  useEffect(() => {
    if (sessionLoading) return;
    setChats(chatHistory?.sessions);
  }, [sessionLoading, chatHistory]);

  const handleNewChat = async () => {
    dispatch(clearMessages());
    try {
      await createSession.mutateAsync(); // wait for /session/init
      // Optionally inspect result.session_id
      refetchHistory(); // after session exists
      navigate('/');
    } catch (e) {
      console.error('Failed to start new chat', e);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => {
                      if (item.title === 'New Chat') {
                        handleNewChat();
                      } else {
                        navigate(item.url);
                      }
                    }}
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

        <AuthenticatedTemplate>
          <SidebarGroup>
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="pr-2">
                {chats?.map((session) => {
                  const firstWithText = session.messages?.find((m) =>
                    m?.data?.trim()
                  );
                  const title =
                    firstWithText?.data?.slice(0, 40) || 'Empty conversation';
                  return (
                    <SidebarMenuItem key={session.session_id}>
                      <SidebarMenuButton
                        asChild
                        isActive={false}
                        onClick={() => {
                          navigate(`/chat/${session.session_id}`);
                        }}
                        className="flex h-10 items-center gap-2 border py-2"
                      >
                        <span className="cursor-pointer">{title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </AuthenticatedTemplate>
      </SidebarContent>
      {/* sidebar footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UnauthenticatedTemplate>
              <SidebarMenuButton asChild>
                <SignInButton className="h-full w-full" />
              </SidebarMenuButton>
            </UnauthenticatedTemplate>

            {/* Authenticated menu */}
            <AuthenticatedTemplate>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-full min-h-12 bg-gray-200 dark:bg-black dark:text-white">
                    <CircleUserRound />
                    {username}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>
                      <SignOutButton />
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </AuthenticatedTemplate>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
