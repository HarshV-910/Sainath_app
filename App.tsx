import React from 'react';
import { useAppContext } from './hooks/useAppContext';
import Login from './pages/auth/Login';
import HostDashboard from './pages/host/HostDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import Notification from './components/common/Notification';
import PendingApproval from './components/common/PendingApproval';
import { UserStatus } from './types';

const App: React.FC = () => {
  const { currentUser, notification, clearNotification, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (!currentUser) {
      return <Login />;
    }

    if (currentUser.status === UserStatus.PENDING) {
      return <PendingApproval />;
    }

    if (currentUser.status === UserStatus.APPROVED) {
      if (currentUser.role === 'host') {
        return <HostDashboard />;
      }
      return <MemberDashboard />;
    }
    
    // Fallback in case of an unexpected status
    return <Login />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 text-gray-800">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
      {renderContent()}
    </div>
  );
};

export default App;
