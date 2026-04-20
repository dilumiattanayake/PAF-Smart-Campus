import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import OAuth2CallbackPage from "@/pages/auth/OAuth2CallbackPage";
import DashboardPage from "@/pages/DashboardPage";
import ResourceListPage from "@/pages/resources/ResourceListPage";
import ResourceDetailPage from "@/pages/resources/ResourceDetailPage";
import AdminResourceFormPage from "@/pages/resources/AdminResourceFormPage";
import BookingListPage from "@/pages/bookings/BookingListPage";
import BookingDetailPage from "@/pages/bookings/BookingDetailPage";
import NewBookingPage from "@/pages/bookings/NewBookingPage";
import TicketListPage from "@/pages/tickets/TicketListPage";
import TechnicianTicketsPage from "./pages/technician/TechnicianTicketsPage";
import TicketDetailPage from "@/pages/tickets/TicketDetailPage";
import NewTicketPage from "@/pages/tickets/NewTicketPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage";
import AdminTicketsPage from "@/pages/admin/AdminTicketsPage";
import TechnicianTasksPage from "@/pages/technician/TechnicianTasksPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
    <Route path="/oauth2/callback" element={<PublicRoute><OAuth2CallbackPage /></PublicRoute>} />

    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/resources" element={<ResourceListPage />} />
      <Route path="/resources/:id" element={<ResourceDetailPage />} />
      <Route path="/admin/resources/new" element={<AdminResourceFormPage />} />
      <Route path="/admin/resources/:id/edit" element={<AdminResourceFormPage />} />
      <Route path="/bookings" element={<BookingListPage />} />
      <Route path="/bookings/new" element={<NewBookingPage />} />
      <Route path="/bookings/:id" element={<BookingDetailPage />} />
      <Route path="/tickets" element={<TicketListPage />} />
      <Route path="/tickets/new" element={<NewTicketPage />} />
      <Route path="/tickets/:id" element={<TicketDetailPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin/bookings" element={<AdminBookingsPage />} />
      <Route path="/admin/tickets" element={<AdminTicketsPage />} />
      <Route path="/technician/tasks" element={<TechnicianTasksPage />} />
      <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
