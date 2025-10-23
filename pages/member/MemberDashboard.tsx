import React, { useState, useMemo } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import MemberMainDashboard from './views/MemberMainDashboard';
import MemberRequests from './views/MemberRequests';
import MemberMyOrderNotes from './views/MemberMyOrderNotes';
import MemberMyExpenses from './views/MemberMyExpenses';
import MemberMyData from './views/MemberMyData';
import MemberProfile from './views/MemberProfile';
import { Role } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';

const MemberDashboard: React.FC = () => {
    const { events } = useAppContext();
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedEventId, setSelectedEventId] = useState<string | null>(events.length > 0 ? events[0].id : null);
    
    const currentEvent = useMemo(() => events.find(e => e.id === selectedEventId) || null, [events, selectedEventId]);

    const renderView = () => {
        if (!currentEvent) {
            return <div className="flex justify-center items-center h-full"><p className="text-xl">No active event. Please contact the host.</p></div>
        }
        
        switch (activeView) {
            case 'dashboard':
                return <MemberMainDashboard event={currentEvent} />;
            case 'requests':
                return <MemberRequests event={currentEvent} />;
            case 'my_order_notes':
                return <MemberMyOrderNotes event={currentEvent} />;
            case 'my_expenses':
                return <MemberMyExpenses event={currentEvent} />;
            case 'my_data':
                return <MemberMyData event={currentEvent} />;
            case 'profile':
                return <MemberProfile />;
            default:
                return <MemberMainDashboard event={currentEvent} />;
        }
    };

    return (
        <div className="flex h-screen p-2 md:p-4 gap-2 md:gap-4">
            <Sidebar userRole={Role.MEMBER} activeView={activeView} onNavigate={setActiveView} />
            <main className="flex-1 flex flex-col">
                <Header 
                    onProfileClick={() => setActiveView('profile')}
                    currentEvent={currentEvent}
                    onEventChange={setSelectedEventId}
                    events={events}
                />
                <div className="flex-grow overflow-y-auto pr-2">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default MemberDashboard;