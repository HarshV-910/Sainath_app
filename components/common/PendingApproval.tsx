import React from 'react';
import GlassCard from './GlassCard';
import { useAppContext } from '../hooks/useAppContext';
import Button from './Button';
import { Clock } from 'lucide-react';

const PendingApproval: React.FC = () => {
  const { currentUser, logout } = useAppContext();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <GlassCard className="w-full max-w-md mx-4 text-center">
        <Clock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-brand-dark mb-2">Account Pending Approval</h1>
        <p className="text-gray-600 mb-6">
          Thank you for joining, {currentUser?.name}! Your account is currently waiting for the host to approve it. Please check back later.
        </p>
        <Button variant="danger" onClick={logout}>
          Log Out
        </Button>
      </GlassCard>
    </div>
  );
};

export default PendingApproval;
