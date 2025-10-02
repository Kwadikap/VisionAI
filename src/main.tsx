import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { ChatProvider } from './providers/ChatProvider.tsx';
import { ChatUI } from './pages/ChatUI.tsx';
import { FeedbackForm } from './pages/FeedbackForm.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { MsalProvider } from '@azure/msal-react';
import { pca } from './shared/msal';
import { store } from './store.ts';
import { Provider } from 'react-redux';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: (
          <ChatProvider>
            <ChatUI />
          </ChatProvider>
        ),
      },
      {
        path: '/feedback',
        element: <FeedbackForm />,
      },
    ],
  },
]);

const queryClient = new QueryClient();
if (pca.initialize) await pca.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={pca}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
        <Toaster />
      </Provider>
    </MsalProvider>
  </StrictMode>
);
