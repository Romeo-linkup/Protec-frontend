import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import Layout from '../components/Layout.jsx';
import Login from '../pages/Login.jsx';

// Admin
import AdminDashboard      from '../pages/admin/Dashboard.jsx';
import AdminCapture        from '../pages/admin/CaptureResults.jsx';
import AdminAllResults     from '../pages/admin/AllResults.jsx';
import AdminProgress       from '../pages/admin/ProgressTracker.jsx';
import AdminAwards         from '../pages/admin/Awards.jsx';
import AdminRegister       from '../pages/admin/LearnerRegister.jsx';
import AdminInterventions  from '../pages/admin/Interventions.jsx';
import AdminBranchReport   from '../pages/admin/BranchReport.jsx';
import AdminSendNotif      from '../pages/admin/SendNotification.jsx';
import AdminLessonRegisters from '../pages/admin/LessonRegisters.jsx';
import AdminAttendance from '../pages/tutor/AttendanceUpload.jsx';
import AdminActivityLog from '../pages/admin/ActivityLog.jsx';

// Tutor
import TutorDashboard  from '../pages/tutor/Dashboard.jsx';
import TutorCapture    from '../pages/tutor/CaptureResults.jsx';
import TutorAllResults from '../pages/tutor/AllResults.jsx';
import TutorProgress   from '../pages/tutor/ProgressTracker.jsx';
import TutorAwards     from '../pages/tutor/Awards.jsx';
import TutorLessonRegister from '../pages/tutor/LessonRegister.jsx';

// Learner
import MyResults    from '../pages/learner/MyResults.jsx';
import UploadReport from '../pages/learner/UploadReport.jsx';
import LearnerAwards from '../pages/learner/Awards.jsx';

// Parent
import ParentReport  from '../pages/parent/ProgressReport.jsx';
import ParentNotifs  from '../pages/parent/Notifications.jsx';

// Shared
import ChangePassword from '../pages/ChangePassword.jsx';
import AdminUploadedReports from '../pages/admin/UploadedReports.jsx';
import CalendarPage from '../pages/Calendar.jsx';

export default function AppRouter() {
  const { user } = useContext(AuthContext);

  // Redirect root based on role
  const homeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    const map = { admin: '/admin', tutor: '/tutor', learner: '/learner', parent: '/parent' };
    return <Navigate to={map[user.role] || '/login'} replace />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={homeRedirect()} />

      {/* ADMIN */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="capture" element={<AdminCapture />} />
        <Route path="results" element={<AdminAllResults />} />
        <Route path="progress" element={<AdminProgress />} />
        <Route path="awards" element={<AdminAwards />} />
        <Route path="register" element={<AdminRegister />} />
        <Route path="interventions" element={<AdminInterventions />} />
        <Route path="branch-report" element={<AdminBranchReport />} />
        <Route path="notify" element={<AdminSendNotif />} />
        <Route path="uploaded-reports" element={<AdminUploadedReports />} />
        <Route path="lesson-registers" element={<AdminLessonRegisters />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="activity-log" element={<AdminActivityLog />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* TUTOR */}
      <Route path="/tutor" element={
        <ProtectedRoute allowedRoles={['tutor']}><Layout /></ProtectedRoute>
      }>
        <Route index element={<TutorDashboard />} />
        <Route path="capture" element={<TutorCapture />} />
        <Route path="results" element={<TutorAllResults />} />
        <Route path="progress" element={<TutorProgress />} />
        <Route path="awards" element={<TutorAwards />} />
        <Route path="lesson-register" element={<TutorLessonRegister />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* LEARNER */}
      <Route path="/learner" element={
        <ProtectedRoute allowedRoles={['learner']}><Layout /></ProtectedRoute>
      }>
        <Route index element={<MyResults />} />
        <Route path="upload" element={<UploadReport />} />
        <Route path="awards" element={<LearnerAwards />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* PARENT */}
      <Route path="/parent" element={
        <ProtectedRoute allowedRoles={['parent']}><Layout /></ProtectedRoute>
      }>
        <Route index element={<ParentReport />} />
        <Route path="notifications" element={<ParentNotifs />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}