/**
 * App Component (Optimized)
 * Main application with code splitting and error boundaries
 */

import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import ScrollToTop from '@/components/ScrollToTop';
import Chatbot from '@/components/features/chatbot/Chatbot';
import VoiceCallButton from '@/components/features/voice-call/VoiceCallButton';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Code-split routes for better performance
const Index = lazy(() => import('./pages/Index'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const WatchDemo = lazy(() => import('./pages/WatchDemo'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Renders the floating Chatbot and VoiceCallButton only on public marketing routes.
 * Hidden on /login, /signup, /dashboard, /onboarding and any future product routes.
 */
function MarketingWidgets() {
  const location = useLocation();

  const PRODUCT_ROUTES = ['/login', '/signup', '/dashboard', '/onboarding'];
  const isProductRoute = PRODUCT_ROUTES.some(route => location.pathname.startsWith(route));

  if (isProductRoute) return null;

  return (
    <>
      <ErrorBoundary
        fallback={
          <div className="fixed bottom-6 right-6 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg text-sm">
            Chat unavailable
          </div>
        }
      >
        <Chatbot />
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="fixed bottom-6 left-6 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg text-sm">
            Voice call unavailable
          </div>
        }
      >
        <VoiceCallButton />
      </ErrorBoundary>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<div className="min-h-screen bg-white" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/watch-demo" element={<WatchDemo />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            {/* Chatbot & Voice Call — marketing pages only */}
            <MarketingWidgets />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
