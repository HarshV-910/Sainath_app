
import React from 'react';
import { Event } from '../../../types';
import GlassCard from '../../../components/common/GlassCard';
import { useAppContext } from '../../../hooks/useAppContext';

interface HostEventSelectionProps {
  onEventSelect: (event: Event) => void;
}

const HostEventSelection: React.FC<HostEventSelectionProps> = ({ onEventSelect }) => {
  const { events } = useAppContext();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold text-brand-dark mb-8">Select an Event</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <GlassCard
            key={event.id}
            className="cursor-pointer hover:shadow-3d-hover hover:-translate-y-2 transition-transform duration-300 w-80"
            onClick={() => onEventSelect(event)}
          >
            <img src={event.image_url} alt={event.name} className="w-full h-48 object-cover rounded-t-lg mb-4" />
            <div className="p-4">
              <h2 className="text-2xl font-bold text-center text-brand-secondary">
                {event.name} {event.year}
              </h2>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default HostEventSelection;
