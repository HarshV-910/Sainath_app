import React, { useMemo } from 'react';
import { Event, PaymentStatus } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';

interface MemberMainDashboardProps {
  event: Event;
}

const MemberMainDashboard: React.FC<MemberMainDashboardProps> = ({ event }) => {
    const { items, orders, currentUser } = useAppContext();

    const eventItems = useMemo(() => items.filter(i => i.eventId === event.id), [items, event.id]);
    const myOrders = useMemo(() => orders.filter(o => o.memberId === currentUser!.id && o.eventId === event.id && o.verified), [orders, currentUser, event.id]);

    const totalSales = useMemo(() => myOrders.reduce((sum, order) => sum + order.amountInr, 0), [myOrders]);

    const paymentStatusTotals = useMemo(() => {
        const stats = { [PaymentStatus.BAKI]: 0, [PaymentStatus.CASH]: 0, [PaymentStatus.ONLINE]: 0 };
        myOrders.forEach(order => {
            stats[order.paymentStatus] += order.amountInr;
        });
        return stats;
    }, [myOrders]);
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Dashboard for {event.name} {event.year}</h1>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Available Stock</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {eventItems.map(item => (
                        <div key={item.id} className="p-2 md:p-4 bg-white/70 rounded-lg text-center">
                            <p className="font-semibold text-brand-secondary text-sm md:text-base">{item.name}</p>
                            <p className="text-lg md:text-xl font-bold">{item.availableStockKg.toFixed(2)} kg</p>
                        </div>
                    ))}
                    {eventItems.length === 0 && <p>No items available for this event.</p>}
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard>
                    <h3 className="font-bold text-base md:text-lg text-brand-secondary">Total Sales</h3>
                    <p className="text-2xl md:text-3xl font-bold">₹{totalSales.toFixed(2)}</p>
                </GlassCard>
                 <GlassCard>
                    <h3 className="font-bold text-base md:text-lg text-red-600">Baki (Pending)</h3>
                    <p className="text-2xl md:text-3xl font-bold">₹{paymentStatusTotals[PaymentStatus.BAKI].toFixed(2)}</p>
                </GlassCard>
                 <GlassCard>
                    <h3 className="font-bold text-base md:text-lg text-green-600">Cash Received</h3>
                    <p className="text-2xl md:text-3xl font-bold">₹{paymentStatusTotals[PaymentStatus.CASH].toFixed(2)}</p>
                </GlassCard>
                 <GlassCard>
                    <h3 className="font-bold text-base md:text-lg text-blue-600">Online Received</h3>
                    <p className="text-2xl md:text-3xl font-bold">₹{paymentStatusTotals[PaymentStatus.ONLINE].toFixed(2)}</p>
                </GlassCard>
            </div>
        </div>
    );
};

export default MemberMainDashboard;