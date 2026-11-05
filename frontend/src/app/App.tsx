import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '../theme/index.js';
import { store } from '../store/index.js';
import { PublicLayout } from '../layouts/PublicLayout.js';
import { DashboardLayout } from '../layouts/DashboardLayout.js';
import { LandingPage } from '../pages/LandingPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ProtectedRoute } from '../routes/ProtectedRoute.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,

      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Public Surfaces */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
              </Route>

              {/* Protected Authenticated Surface */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
