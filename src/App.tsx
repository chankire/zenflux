import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SecurityProvider } from "@/lib/security";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EnhancedDashboard from "./components/EnhancedDashboard";
import OnboardingFlow from "./components/OnboardingFlow";
import Waitlist from "./pages/Waitlist";
import Documentation from "./pages/Documentation";
import Blog from "./pages/Blog";
import SpreadsheetsBroken from "./pages/blog/SpreadsheetsBroken";
import RunwayGuide from "./pages/blog/RunwayGuide";
import CFOsAI from "./pages/blog/CFOsAI";
import MultiBankVisibility from "./pages/blog/MultiBankVisibility";
import AIForecasting from "./pages/blog/AIForecasting";
import ForexAnalysis from "./components/ForexAnalysis";
import ManualDataUpload from "./components/ManualDataUpload";
import NavigationSidebar from "./components/NavigationSidebar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setNeedsOnboarding(null);
        return;
      }

      try {
        const { data: memberships } = await supabase
          .from('memberships')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1);

        setNeedsOnboarding(!memberships || memberships.length === 0);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setNeedsOnboarding(true);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading || needsOnboarding === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    if (needsOnboarding) {
      return <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />;
    }
    
    return <>{children}</>;
  };

  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Index />
          </PublicRoute>
        } />
        <Route path="/auth" element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <div className="w-64 flex-shrink-0">
                <NavigationSidebar />
              </div>
              <div className="flex-1 overflow-auto p-6">
                <EnhancedDashboard />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/forex" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <div className="w-64 flex-shrink-0">
                <NavigationSidebar />
              </div>
              <div className="flex-1 overflow-auto p-6">
                <ForexAnalysis />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <div className="w-64 flex-shrink-0">
                <NavigationSidebar />
              </div>
              <div className="flex-1 overflow-auto p-6">
                <ManualDataUpload />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/cash-flow-forecasting-broken-spreadsheets" element={<SpreadsheetsBroken />} />
        <Route path="/blog/founders-guide-managing-runway-2025" element={<RunwayGuide />} />
        <Route path="/blog/how-cfos-leverage-ai-improve-forecast-accuracy" element={<CFOsAI />} />
        <Route path="/blog/cfos-leverage-ai-improve-forecast-accuracy" element={<CFOsAI />} />
        <Route path="/blog/multi-bank-visibility-growing-businesses" element={<MultiBankVisibility />} />
        <Route path="/blog/future-financial-forecasting-ai-powered" element={<AIForecasting />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SecurityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </SecurityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
