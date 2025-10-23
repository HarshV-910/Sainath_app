
import React, { useState, useMemo } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import HostMainDashboard from './views/HostMainDashboard';
import HostRequests from './views/HostRequests';
import HostMemberData from './views/HostMemberData';
import HostExpenseAndItems from './views/HostExpenseAndItems';
import HostPreviousData from './views/HostPreviousData';
import HostProfile from './views/HostProfile';
import { Role, Event } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';


const HostDashboard: React.FC = () => {
    const { events } = useAppContext();
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedEventId, setSelectedEventId] = useState<string | null>(events.length > 0 ? events[0].id : null);

    const currentEvent = useMemo(() => events.find(e => e.id === selectedEventId) || null, [events, selectedEventId]);

    const renderView = () => {
        if (!currentEvent) {
             return <div className="flex flex-col justify-center items-center h-full"><p className="text-xl text-gray-700">No events found.</p><p className="text-gray-500">Please create a new event in your profile settings to begin.</p></div>
        }

        switch (activeView) {
            case 'dashboard':
                return <HostMainDashboard event={currentEvent} />;
            case 'requests':
                return <HostRequests event={currentEvent} />;
            case 'member_data':
                return <HostMemberData event={currentEvent} />;
            case 'expense_items':
                return <HostExpenseAndItems event={currentEvent} />;
            case 'previous_data':
                return <HostPreviousData event={currentEvent} />;
            case 'profile':
                return <HostProfile />;
            default:
                return <HostMainDashboard event={currentEvent} />;
        }
    };

    return (
        <div className="flex h-screen p-2 md:p-4 gap-2 md:gap-4">
            <Sidebar userRole={Role.HOST} activeView={activeView} onNavigate={setActiveView} />
            <main className="flex-1 flex flex-col">
                {currentEvent && (
                     <Header 
                        onProfileClick={() => setActiveView('profile')}
                        currentEvent={currentEvent}
                        onEventChange={setSelectedEventId}
                        events={events}
                    />
                )}
                <div className="flex-grow overflow-y-auto pr-2">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default HostDashboard;