import { useAuth } from '@/contexts/AuthContext';
import { UserDashboard } from '@/components/dashboards/UserDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { TechnicianDashboard } from '@/components/dashboards/TechnicianDashboard';

const DashboardPage = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboard />;
  return <UserDashboard />;
};

export default DashboardPage;
