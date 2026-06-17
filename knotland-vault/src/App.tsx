import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import PlansPage from "@/pages/plans";
import SubmitPaymentPage from "@/pages/submit-payment";
import ContentPage from "@/pages/content";
import ProfilePage from "@/pages/profile";
import TestimonialsPage from "@/pages/testimonials";
import AdminPage from "@/pages/admin";
import AdminMembersPage from "@/pages/admin-members";
import AdminPaymentsPage from "@/pages/admin-payments";
import AdminAnnouncementsPage from "@/pages/admin-announcements";
import AdminTestimonialsPage from "@/pages/admin-testimonials";
import AdminContentPage from "@/pages/admin-content";
import CommunityPage from "@/pages/community";
import EventsPage from "@/pages/events";
import PreviewsPage from "@/pages/previews";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// Wire Supabase session token into every API call
setAuthTokenGetter(async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
});

function AuthSync() {
  const { session } = useAuth();
  useEffect(() => {
    if (!session) {
      queryClient.clear();
    }
  }, [session]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/plans" component={PlansPage} />
      <Route path="/testimonials" component={TestimonialsPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/content" component={ContentPage} />
      <Route path="/submit-payment" component={SubmitPaymentPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/previews" component={PreviewsPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/members" component={AdminMembersPage} />
      <Route path="/admin/payments" component={AdminPaymentsPage} />
      <Route path="/admin/announcements" component={AdminAnnouncementsPage} />
      <Route path="/admin/testimonials" component={AdminTestimonialsPage} />
      <Route path="/admin/content" component={AdminContentPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthSync />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
