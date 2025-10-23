
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Event } from '../../types';
import { User, LogOut } from 'lucide-react';
import GlassCard from '../common/GlassCard';

interface HeaderProps {
    onProfileClick: () => void;
    currentEvent: Event | null;
    onEventChange: (eventId: string) => void;
    events: Event[];
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, currentEvent, onEventChange, events }) => {
  const { logout, currentUser } = useAppContext();
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      };
      setDateTime(new Date().toLocaleString('en-IN', options));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <GlassCard className="w-full mb-6 !p-3 md:!p-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-brand-dark">Sainath</h1>
            <select
                value={currentEvent?.id || ''}
                onChange={(e) => onEventChange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
                {events.map(event => (
                    <option key={event.id} value={event.id}>
                        {event.name} {event.year}
                    </option>
                ))}
            </select>
        </div>

        <div className="text-center">
             <div className="bg-white/50 border border-white/30 rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-inner">
                <p className="font-mono font-semibold text-gray-700 tracking-wider text-xs md:text-sm">{dateTime}</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
            {currentUser?.role !== 'host' && <div className="font-semibold text-sm md:text-base">Hi, {currentUser?.name.split(' ')[0]}</div>}
            <button onClick={onProfileClick} className="p-2 rounded-full hover:bg-white/80 transition-colors">
                <User className="text-indigo-600"/>
            </button>
            <button onClick={logout} className="p-2 rounded-full hover:bg-white/80 transition-colors">
                <LogOut className="text-red-600"/>
            </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default Header;
