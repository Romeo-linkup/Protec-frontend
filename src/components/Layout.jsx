import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

const NAV = {
  admin: [
    { sec: 'Overview', items: [
      { id: 'dashboard',    path: '/admin',             icon: 'ti-layout-dashboard',  label: 'Dashboard' },
      { id: 'capture',      path: '/admin/capture',     icon: 'ti-clipboard-list',    label: 'Capture results' },
      { id: 'calendar',     path: '/admin/calendar',    icon: 'ti-calendar',         label: 'Calendar' },
    ]},
    { sec: 'Learners', items: [
      { id: 'results',      path: '/admin/results',     icon: 'ti-table',             label: 'All results' },
      { id: 'progress',     path: '/admin/progress',    icon: 'ti-trending-up',       label: 'Progress tracker' },
    ]},
    { sec: 'Recognition', items: [
      { id: 'awards',       path: '/admin/awards',      icon: 'ti-award',             label: 'Awards' },
    ]},
    { sec: 'Admin Tools', items: [
      { id: 'register',          path: '/admin/register',          icon: 'ti-users',             label: 'User register' },
      { id: 'attendance',        path: '/admin/attendance',        icon: 'ti-calendar-check',    label: 'Attendance' },
      { id: 'interventions',     path: '/admin/interventions',     icon: 'ti-first-aid-kit',     label: 'Interventions' },
      { id: 'branch-report',     path: '/admin/branch-report',     icon: 'ti-report-analytics',  label: 'Branch report' },
      { id: 'notify',            path: '/admin/notify',            icon: 'ti-send',              label: 'Send notification' },
      { id: 'uploaded-reports',  path: '/admin/uploaded-reports',  icon: 'ti-files',             label: 'Uploaded reports' },
      { id: 'lesson-registers',  path: '/admin/lesson-registers',  icon: 'ti-notebook',          label: 'Lesson registers' },
      { id: 'activity-log',      path: '/admin/activity-log',      icon: 'ti-camera',            label: 'Activity log' },
      { id: 'change-password',   path: '/admin/change-password',   icon: 'ti-lock',              label: 'Change password' },
    ]},
  ],
  tutor: [
    { sec: 'Overview', items: [
      { id: 'dashboard',  path: '/tutor',             icon: 'ti-layout-dashboard', label: 'Dashboard' },
      { id: 'calendar',   path: '/tutor/calendar',    icon: 'ti-calendar',         label: 'Calendar' },
    ]},
    { sec: 'My Classes', items: [
      { id: 'capture',    path: '/tutor/capture',     icon: 'ti-clipboard-list',   label: 'Capture results' },
      { id: 'results',    path: '/tutor/results',     icon: 'ti-table',            label: 'View results' },
      { id: 'progress',   path: '/tutor/progress',    icon: 'ti-trending-up',      label: 'Progress tracker' },
      { id: 'awards',     path: '/tutor/awards',      icon: 'ti-award',            label: 'Awards' },
      { id: 'lesson-register', path: '/tutor/lesson-register', icon: 'ti-notebook', label: 'Lesson register' },
      { id: 'change-password', path: '/tutor/change-password', icon: 'ti-lock', label: 'Change password' },
    ]},
  ],
  learner: [
    { sec: 'My Profile', items: [
      { id: 'my-results', path: '/learner',         icon: 'ti-chart-bar', label: 'My results' },
      { id: 'upload',     path: '/learner/upload',  icon: 'ti-upload',    label: 'Upload term report' },
    ]},
    { sec: 'Explore', items: [
      { id: 'awards',     path: '/learner/awards',  icon: 'ti-award',     label: 'Awards' },
      { id: 'change-password', path: '/learner/change-password', icon: 'ti-lock', label: 'Change password' },
    ]},
  ],
  parent: [
    { sec: 'My Child', items: [
      { id: 'parent-report',   path: '/parent',                icon: 'ti-report', label: 'Progress report' },
      { id: 'notifications',   path: '/parent/notifications',  icon: 'ti-bell',   label: 'Notifications' },
      { id: 'change-password', path: '/parent/change-password', icon: 'ti-lock',  label: 'Change password' },
    ]},
  ],
};

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeId, setActiveId] = useState('');

  const role = user?.role || 'admin';
  const groups = NAV[role] || [];

  useEffect(() => {
    for (const g of groups) {
      for (const item of g.items) {
        if (location.pathname === item.path || location.pathname.startsWith(item.path + '/')) {
          setActiveId(item.id);
          return;
        }
      }
    }
  }, [location.pathname]);

  const handleNav = (item) => {
    setActiveId(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    admin:   'Admin · INK Branch',
    tutor:   'Tutor · INK Branch',
    learner: `Learner · ${user?.grade || 'Grade 10'}`,
    parent:  'Parent / Guardian',
  }[role];

  const branch = role === 'parent' ? '' : 'INK Branch';

  return (
    <div className="app-wrap">
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sb-top">
            <div className="sb-logo">
              <svg width="26" height="30" viewBox="0 0 28 32" fill="none">
                <path d="M14 1L2 6V16C2 23 8 29 14 31C20 29 26 23 26 16V6L14 1Z" fill="#1a2d5a" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
                <path d="M14 3.5L4 8V16C4 22 9 27.5 14 29.2C19 27.5 24 22 24 16V8L14 3.5Z" fill="#c8102e"/>
                <text x="14" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">P</text>
              </svg>
              <div>
                <div className="sb-wordmark">PRO<em>TEC</em></div>
                <div className="sb-branch">{branch}</div>
              </div>
            </div>
          </div>

          <div className="sb-nav">
            {groups.map((group, gi) => (
              <div key={gi}>
                <div className="sb-sec">{group.sec}</div>
                {group.items.map(item => (
                  <div
                    key={item.id}
                    className={`sb-item${activeId === item.id ? ' active' : ''}`}
                    onClick={() => handleNav(item)}
                  >
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="sb-footer">
            <div className="sb-user">
              <div className="sb-av">{user?.initials || '?'}</div>
              <div>
                <div className="sb-name">{user?.fullName || '—'}</div>
                <div className="sb-role">{roleLabel}</div>
              </div>
            </div>
            <NotificationBell />
            <i className="ti ti-logout sb-logout" onClick={handleLogout} title="Sign out" />
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}