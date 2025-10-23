
import React from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';

const MemberProfile: React.FC = () => {
    const { currentUser, logout } = useAppContext();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">My Profile</h1>

            <GlassCard>
                 <div className="flex flex-col items-center">
                    <img
                        // FIX: Property 'profilePhotoUrl' does not exist on type 'User'.
                        src={`https://i.pravatar.cc/150?u=${currentUser?.id}`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white shadow-lg"
                    />
                    <h2 className="text-2xl font-bold text-brand-dark">{currentUser?.name}</h2>
                    <p className="text-gray-600">{currentUser?.email}</p>
                    <div className="mt-6 space-y-2 w-full max-w-sm">
                        {/* Add forms for changing password etc. here */}
                        <Button variant="danger" className="w-full" onClick={logout}>Log Out</Button>
                    </div>
                 </div>
            </GlassCard>
        </div>
    );
};

export default MemberProfile;