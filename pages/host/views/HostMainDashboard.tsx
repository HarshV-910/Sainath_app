
import React, { useMemo } from 'react';
import { Event } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';

interface HostMainDashboardProps {
  event: Event;
}

const HostMainDashboard: React.FC<HostMainDashboardProps> = ({ event }) => {
    const { items, orders, users, verifyOrder } = useAppContext();
    
    // FIX: Property 'eventId' does not exist on type 'Item'. Did you mean 'event_id'?
    const eventItems = useMemo(() => items.filter(i => i.event_id === event.id), [items, event.id]);
    // FIX: Property 'eventId' does not exist on type 'Order'. Did you mean 'event_id'?
    const unverifiedOrders = useMemo(() => orders.filter(o => o.event_id === event.id && !o.verified), [orders, event.id]);

    const totalStockConsumed = (itemId: string) => {
        return orders
            // FIX: Property 'itemId' does not exist on type 'Order'. Did you mean 'item_id'?
            .filter(o => o.item_id === itemId && o.verified)
            // FIX: Property 'quantityKg' does not exist on type 'Order'. Did you mean 'quantity_kg'?
            .reduce((sum, o) => sum + o.quantity_kg, 0);
    };

    const memberConsumptionSummary = useMemo(() => {
        const summary: { [key: string]: { memberName: string, itemName: string, quantity: number, amount: number } } = {};
        // FIX: Property 'eventId' does not exist on type 'Order'. Did you mean 'event_id'?
        const verifiedOrders = orders.filter(o => o.event_id === event.id && o.verified);
        
        for (const order of verifiedOrders) {
            // FIX: Property 'memberId' does not exist on type 'Order'. Did you mean 'member_id'?
            const member = users.find(u => u.id === order.member_id);
            // FIX: Property 'itemId' does not exist on type 'Order'. Did you mean 'item_id'?
            const item = items.find(i => i.id === order.item_id);
            if (member && item) {
                const key = `${member.id}-${item.id}`;
                if (!summary[key]) {
                    summary[key] = { memberName: member.name, itemName: item.name, quantity: 0, amount: 0 };
                }
                // FIX: Property 'quantityKg' does not exist on type 'Order'. Did you mean 'quantity_kg'?
                summary[key].quantity += order.quantity_kg;
                // FIX: Property 'amountInr' does not exist on type 'Order'. Did you mean 'amount_inr'?
                summary[key].amount += order.amount_inr;
            }
        }
        return Object.values(summary);
    }, [orders, users, items, event.id]);

    const thClasses = "p-2 text-left text-xs md:p-3 md:text-sm font-bold text-gray-800 uppercase tracking-wider";
    const tdClasses = "p-2 text-sm md:p-3 md:text-base text-gray-800";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Dashboard for {event.name} {event.year}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {eventItems.map(item => (
                    <GlassCard key={item.id}>
                        <h3 className="font-bold text-lg text-brand-secondary">{item.name}</h3>
                        <p className="text-2xl font-bold">{item.available_stock_kg.toFixed(2)} kg</p>
                        <p className="text-sm text-gray-600">Available Stock</p>
                        <p className="text-lg font-semibold text-red-600 mt-2">{totalStockConsumed(item.id).toFixed(2)} kg</p>
                        <p className="text-sm text-gray-600">Consumed</p>
                    </GlassCard>
                ))}
                 {eventItems.length === 0 && <p>No items added for this event yet.</p>}
            </div>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-brand-dark">Member Consumption Verification</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className={thClasses}>Member</th>
                                <th className={thClasses}>Item</th>
                                <th className={thClasses}>Qty (kg)</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Date/Time</th>
                                <th className={thClasses}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unverifiedOrders.map(order => {
                                const member = users.find(u => u.id === order.member_id);
                                const item = items.find(i => i.id === order.item_id);
                                return (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-white/70">
                                        <td className={tdClasses}>{member?.name}</td>
                                        <td className={tdClasses}>{item?.name}</td>
                                        <td className={tdClasses}>{order.quantity_kg.toFixed(2)}</td>
                                        <td className={`${tdClasses} hidden md:table-cell`}>{new Date(order.date_time).toLocaleString()}</td>
                                        <td className={tdClasses}>
                                            <Button variant="success" size="sm" onClick={() => verifyOrder(order.id)}>Verify</Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {unverifiedOrders.length === 0 && <p className="text-center p-4">No new consumption requests to verify.</p>}
                </div>
            </GlassCard>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-brand-dark">Member Consumption Summary</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className={thClasses}>Member</th>
                                <th className={thClasses}>Item</th>
                                <th className={thClasses}>Qty (kg)</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberConsumptionSummary.map(summary => (
                                <tr key={`${summary.memberName}-${summary.itemName}`} className="border-b border-gray-100 hover:bg-white/70">
                                    <td className={tdClasses}>{summary.memberName}</td>
                                    <td className={tdClasses}>{summary.itemName}</td>
                                    <td className={tdClasses}>{summary.quantity.toFixed(2)}</td>
                                    <td className={`${tdClasses} hidden md:table-cell`}>₹{summary.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {memberConsumptionSummary.length === 0 && <p className="text-center p-4">No verified member consumption data available.</p>}
                </div>
            </GlassCard>
        </div>
    );
};

export default HostMainDashboard;