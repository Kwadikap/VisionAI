import { Outlet } from 'react-router-dom';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeProvider } from './providers/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-screen w-full overflow-hidden">
          <header className="sticky top-0 z-10 flex h-12 items-center gap-2 px-2">
            <SidebarTrigger />
          </header>
          <main className="h-full flex-1 overflow-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
