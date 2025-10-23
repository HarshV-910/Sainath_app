
import React from 'react';
import { useAppContext } from './hooks/useAppContext';
import Login from './pages/auth/Login';
import HostDashboard from './pages/host/HostDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import Notification from './components/common/Notification';

const App: React.FC = () => {
  const { currentUser, notification, clearNotification } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 text-gray-800">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
      {!currentUser ? (
        <Login />
      ) : currentUser.role === 'host' ? (
        <HostDashboard />
      ) : (
        <MemberDashboard />
      )}
    </div>
  );
};

export default App;