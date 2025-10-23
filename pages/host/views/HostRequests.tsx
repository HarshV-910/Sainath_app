


import React, { useState, useMemo } from 'react';
import { Event } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';

interface HostRequestsProps {
  event: Event;
}

const HostRequests: React.FC<HostRequestsProps> = ({ event }) => {
    const { orders, users, items, verifyOrder, rejectOrder } = useAppContext();
    const [filterDate, setFilterDate] = useState('');

    const eventOrders = useMemo(() => {
        // FIX: Property 'eventId' does not exist on type 'Order'. Did you mean 'event_id'?
        let filtered = orders.filter(o => o.event_id === event.id);
        if (filterDate) {
            // FIX: Property 'dateTime' does not exist on type 'Order'. Did you mean 'date_time'?
            filtered = filtered.filter(o => new Date(o.date_time).toISOString().slice(0, 10) === filterDate);
        }
        // FIX: Property 'dateTime' does not exist on type 'Order'. Did you mean 'date_time'?
        return filtered.sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
    }, [orders, event.id, filterDate]);
    
    const thClasses = "p-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider";
    const tdClasses = "p-3 text-sm text-gray-800";

    // FIX: Define OrderCard as a React.FC with an explicit props interface to resolve the TypeScript error.
    // The `key` prop is special in React and this change helps TypeScript understand it correctly.
    interface OrderCardProps {
        order: (typeof eventOrders)[0];
    }
    const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
        const member = users.find(u => u.id === order.member_id);
        const item = items.find(i => i.id === order.item_id);
        const statusText = order.verified ? 'Verified' : (order.edited ? 'Pending (Edited)' : 'Pending');
        const statusColor = order.verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800';
        
        return (
            <GlassCard className="mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg">{item?.name}</p>
                        <p className="text-sm text-gray-600">for {order.customer_name}</p>
                        <p className="font-semibold text-brand-secondary">{member?.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor} text-center`}>
                        {statusText}
                    </span>
                </div>
                <div className="border-t my-3"></div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="font-semibold">{order.quantity_kg.toFixed(2)} kg</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-semibold">₹{order.amount_inr.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-500">Date/Time</p>
                        <p className="font-semibold">{new Date(order.date_time).toLocaleString()}</p>
                    </div>
                </div>
                {!order.verified && (
                    <div className="mt-4 flex gap-2">
                        <Button variant="success" size="sm" onClick={() => verifyOrder(order.id)} className="flex-1">Verify</Button>
                        <Button variant="danger" size="sm" onClick={() => rejectOrder(order.id)} className="flex-1">Reject</Button>
                    </div>
                )}
            </GlassCard>
        );
    };


    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Member Requests for {event.name} {event.year}</h1>

            <GlassCard>
                <div className="flex items-center">
                    <label htmlFor="dateFilter" className="mr-2 font-medium text-sm md:text-base">Filter by Date:</label>
                    <input
                        type="date"
                        id="dateFilter"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
            </GlassCard>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
                <GlassCard>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className={thClasses}>Date/Time</th>
                                    <th className={thClasses}>Member</th>
                                    <th className={thClasses}>Customer</th>
                                    <th className={thClasses}>Item</th>
                                    <th className={thClasses}>Qty</th>
                                    <th className={thClasses}>Amount</th>
                                    <th className={thClasses}>Status</th>
                                    <th className={thClasses}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventOrders.map(order => {
                                    const member = users.find(u => u.id === order.member_id);
                                    const item = items.find(i => i.id === order.item_id);
                                    const statusText = order.verified ? 'Verified' : (order.edited ? 'Pending (Edited)' : 'Pending');
                                    const statusColor = order.verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800';

                                    return (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-white/70">
                                            <td className={tdClasses}>{new Date(order.date_time).toLocaleString()}</td>
                                            <td className={tdClasses}>{member?.name}</td>
                                            <td className={tdClasses}>{order.customer_name}</td>
                                            <td className={tdClasses}>{item?.name}</td>
                                            <td className={tdClasses}>{order.quantity_kg.toFixed(2)}</td>
                                            <td className={tdClasses}>₹{order.amount_inr.toFixed(2)}</td>
                                            <td className={tdClasses}>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className={tdClasses}>
                                                {!order.verified && (
                                                    <div className="flex gap-2">
                                                        <Button variant="success" size="sm" onClick={() => verifyOrder(order.id)}>Verify</Button>
                                                        <Button variant="danger" size="sm" onClick={() => rejectOrder(order.id)}>Reject</Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {eventOrders.length === 0 && <p className="text-center p-4">No requests found for the selected criteria.</p>}
                    </div>
                </GlassCard>
            </div>
            
            {/* Mobile/Tablet Card View */}
            <div className="block lg:hidden">
                {eventOrders.map(order => <OrderCard key={order.id} order={order} />)}
                {eventOrders.length === 0 && <GlassCard><p className="text-center p-4">No requests found for the selected criteria.</p></GlassCard>}
            </div>
        </div>
    );
};

export default HostRequests;