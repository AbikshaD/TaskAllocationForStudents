import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';

// Auth
import Login from '../pages/auth/Login';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import Students from '../pages/admin/Students';
import Marks from '../pages/admin/Marks';
import AdminAssignments from '../pages/admin/tasks/Assignments';
import AdminPresentations from '../pages/admin/tasks/Presentations';
import AdminLabTasks from '../pages/admin/tasks/LabTasks';
import AdminProjects from '../pages/admin/tasks/Projects';

// Student pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentMarks from '../pages/student/Marks';
import MyAssignments from '../pages/student/tasks/MyAssignment';
import { MyPresentations, MyLabTasks, MyProjects } from '../pages/student/tasks/StudentTasks';

function AdminLayout() {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  
  if (!user) {
    console.warn('AdminLayout: No user found, redirecting to login');
    console.log('User from auth:', user);
    console.log('LocalStorage user:', localStorage.getItem('user'));
    console.log('LocalStorage token:', localStorage.getItem('token'));
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    console.warn('AdminLayout: User is not admin, redirecting to student', { role: user.role, name: user.name });
    return <Navigate to="/student" replace />;
  }
  
  console.log('AdminLayout: Admin logged in successfully', { role: user.role, name: user.name });
  
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="marks" element={<Marks />} />
          <Route path="tasks/assignments" element={<AdminAssignments />} />
          <Route path="tasks/presentations" element={<AdminPresentations />} />
          <Route path="tasks/lab-tasks" element={<AdminLabTasks />} />
          <Route path="tasks/projects" element={<AdminProjects />} />
        </Routes>
      </div>
    </div>
  );
}

function StudentLayout() {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) {
    console.warn('StudentLayout: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'student') {
    console.warn('StudentLayout: User is not student, redirecting to admin');
    return <Navigate to="/admin" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path="marks" element={<StudentMarks />} />
          <Route path="assignments" element={<MyAssignments />} />
          <Route path="presentations" element={<MyPresentations />} />
          <Route path="lab-tasks" element={<MyLabTasks />} />
          <Route path="projects" element={<MyProjects />} />
        </Routes>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/student" element={<StudentLayout />} />
      <Route path="/student/*" element={<StudentLayout />} />
      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
