import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/workout"
            element={
              <RequireAuth>
                <Workout />
              </RequireAuth>
            }
          />
          <Route
            path="/diet"
            element={
              <RequireAuth>
                <Diet />
              </RequireAuth>
            }
          />
          <Route
            path="/analysis"
            element={
              <RequireAuth>
                <Analysis />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
