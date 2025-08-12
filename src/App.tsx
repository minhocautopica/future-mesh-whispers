import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import AppRoutes from './AppRoutes';
import { SurveyProvider } from './context/SurveyContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SurveyProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
            <Toaster />
            <Sonner />
          </Router>
        </ThemeProvider>
      </SurveyProvider>
    </QueryClientProvider>
  );
}

export default App;
