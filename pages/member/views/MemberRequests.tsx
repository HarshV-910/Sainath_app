
import React, { useState, useMemo, useEffect } from 'react';
import { Event, PaymentStatus, Order, Item as ItemType } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { Edit, Trash2 } from 'lucide-react';

interface MemberRequestsProps {
  event: Event;
}

const MemberRequests: React.FC<MemberRequestsProps> = ({ event }) => {
    const { items, orders, currentUser, addOrder, updateOrderPaymentStatus, editOrder, deleteOrder } = useAppContext();
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    // FIX: Property 'eventId' does not exist on type 'Item'. Did you mean 'event_id'?
    const eventItems = useMemo(() => items.filter(i => i.event_id === event.id), [items, event.id]);
    // FIX: Property 'memberId' does not exist on type 'Order'. Did you mean 'member_id'?
    // FIX: Property 'eventId' does not exist on type 'Order'. Did you mean 'event_id'?
    // FIX: Property 'dateTime' does not exist on type 'Order'. Did you mean 'date_time'?
    const myOrders = useMemo(() => orders.filter(o => o.member_id === currentUser!.id && o.event_id === event.id)
        .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()), [orders, currentUser, event.id]);
        
    const bakiPayments = useMemo(() => myOrders.filter(o => o.verified && o.payment_status === PaymentStatus.BAKI), [myOrders]);

    useEffect(() => {
        if (!isRequestModalOpen) {
            setEditingOrder(null);
        }
    }, [isRequestModalOpen]);
    
    const handleRequestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const itemId = formData.get('itemId') as string;
        const quantityKg = parseFloat(formData.get('quantityKg') as string);
        const amountInr = parseFloat(formData.get('amountInr') as string);
        const customerName = formData.get('customerName') as string;
        
        if (itemId && quantityKg > 0 && amountInr >= 0 && customerName && currentUser) {
            if (editingOrder) {
                editOrder(editingOrder.id, { customerName, itemId, quantityKg, amountInr });
            } else {
                addOrder(currentUser.id, event.id, itemId, customerName, quantityKg, amountInr);
            }
            setRequestModalOpen(false);
        }
    };
    
    const handleDeleteOrder = (orderId: string) => {
        if (window.confirm('Are you sure you want to delete this request?')) {
            deleteOrder(orderId);
        }
    }

    const openEditModal = (order: Order) => {
        setEditingOrder(order);
        setRequestModalOpen(true);
    };

    const inputClasses = "w-full mt-1 p-2 border rounded-lg bg-white";
    const thClasses = "p-2 text-left text-xs md:p-3 md:text-sm font-bold text-gray-800 uppercase tracking-wider";
    const tdClasses = "p-2 text-xs md:p-3 md:text-sm text-gray-800";

    const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
        const item = items.find(i => i.id === order.item_id);
        const statusText = order.verified ? 'Verified' : (order.edited ? 'Pending (Edited)' : 'Pending');
        const statusColor = order.verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800';

        return (
            <GlassCard className="mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg">{item?.name}</p>
                        <p className="text-sm text-gray-600">for {order.customer_name}</p>
                        <p className="text-xs text-gray-500">{new Date(order.date_time).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {statusText}
                    </span>
                </div>
                <div className="border-t my-3"></div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="font-semibold">{order.quantity_kg.toFixed(2)} kg</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-semibold">₹{order.amount_inr.toFixed(2)}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Payment Status</label>
                        <select
                            value={order.payment_status}
                            onChange={(e) => updateOrderPaymentStatus(order.id, e.target.value as PaymentStatus)}
                            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            disabled={!order.verified}
                        >
                            {Object.values(PaymentStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    {!order.verified && (
                        <div className="flex gap-2">
                            <Button onClick={() => openEditModal(order)} variant="secondary" size="sm" className="flex-1"><Edit size={16} className="inline mr-1"/> Edit</Button>
                            <Button onClick={() => handleDeleteOrder(order.id)} variant="danger" size="sm" className="flex-1"><Trash2 size={16} className="inline mr-1"/> Delete</Button>
                        </div>
                    )}
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">My Orders & Requests</h1>
                <Button onClick={() => setRequestModalOpen(true)} className="w-full md:w-auto">New Consumption Request</Button>
            </div>
            
            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Baki Payments</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                         <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className={thClasses}>Date</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Customer</th>
                                <th className={thClasses}>Item</th>
                                <th className={thClasses}>Qty</th>
                                <th className={thClasses}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bakiPayments.map(order => {
                                const item = items.find(i => i.id === order.item_id);
                                return (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-white/70">
                                    <td className={tdClasses}>{new Date(order.date_time).toLocaleDateString()}</td>
                                    <td className={`${tdClasses} hidden md:table-cell`}>{order.customer_name}</td>
                                    <td className={tdClasses}>{item?.name}</td>
                                    <td className={tdClasses}>{order.quantity_kg.toFixed(2)}</td>
                                    <td className={`${tdClasses} font-semibold text-red-600`}>{order.amount_inr.toFixed(2)}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                     {bakiPayments.length === 0 && <p className="text-center p-4">You have no pending payments.</p>}
                </div>
            </GlassCard>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">All Orders</h2>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b-2 border-gray-200">
                             <tr>
                                <th className={thClasses}>Date</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Customer</th>
                                <th className={thClasses}>Item</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Amount</th>
                                <th className={thClasses}>Payment</th>
                                <th className={thClasses}>Status</th>
                                <th className={thClasses}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.map(order => {
                                const item = items.find(i => i.id === order.item_id);
                                const statusText = order.verified ? 'Verified' : (order.edited ? 'Pending (Edited)' : 'Pending');
                                const statusColor = order.verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800';
                                
                                return (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-white/70">
                                    <td className={tdClasses}>{new Date(order.date_time).toLocaleDateString()}</td>
                                    <td className={`${tdClasses} hidden md:table-cell`}>{order.customer_name}</td>
                                    <td className={tdClasses}>{item?.name}</td>
                                    <td className={`${tdClasses} hidden md:table-cell`}>{order.amount_inr.toFixed(2)}</td>
                                    <td className={tdClasses}>
                                        <select 
                                            value={order.payment_status} 
                                            onChange={(e) => updateOrderPaymentStatus(order.id, e.target.value as PaymentStatus)}
                                            className="bg-white border border-gray-300 rounded-lg p-1 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-24"
                                            disabled={!order.verified}
                                        >
                                            {Object.values(PaymentStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                    </td>
                                    <td className={tdClasses}>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                            {statusText}
                                        </span>
                                    </td>
                                    <td className={tdClasses}>
                                        {!order.verified && (
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal(order)} className="text-indigo-600 hover:text-indigo-800"><Edit size={18} /></button>
                                                <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                     {myOrders.length === 0 && <p className="text-center p-4">You have not made any requests yet.</p>}
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="block lg:hidden">
                    {myOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    {myOrders.length === 0 && <p className="text-center p-4">You have not made any requests yet.</p>}
                </div>
            </GlassCard>
            
            <Modal isOpen={isRequestModalOpen} onClose={() => setRequestModalOpen(false)} title={editingOrder ? "Edit Consumption Request" : "New Consumption Request"}>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                     <div>
                        <label className="block font-medium">Customer Name</label>
                        <input name="customerName" type="text" defaultValue={editingOrder?.customer_name} required className={inputClasses}/>
                    </div>
                     <div>
                        <label className="block font-medium">Item</label>
                        <select name="itemId" defaultValue={editingOrder?.item_id} required className={inputClasses}>
                            <option value="">Select an item</option>
                            {eventItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block font-medium">Quantity (kg)</label>
                        <input name="quantityKg" type="number" step="0.01" defaultValue={editingOrder?.quantity_kg} required className={inputClasses}/>
                    </div>
                     <div>
                        <label className="block font-medium">Amount (₹)</label>
                        <input name="amountInr" type="number" step="0.01" defaultValue={editingOrder?.amount_inr} required className={inputClasses}/>
                    </div>
                    <p className="text-sm text-gray-600">Payment status is 'Baki' by default. You can change it after the host verifies the order.</p>
                    <Button type="submit" className="w-full">{editingOrder ? 'Update Request' : 'Submit Request'}</Button>
                </form>
            </Modal>
        </div>
    );
};

export default MemberRequests;