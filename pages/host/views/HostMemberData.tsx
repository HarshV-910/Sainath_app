
import React, { useMemo, useState } from 'react';
import { Event } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

interface HostMemberDataProps {
  event: Event;
}

const HostMemberData: React.FC<HostMemberDataProps> = ({ event }) => {
    const { users, orders, items, addConsumptionByHost, showNotification } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);

    const members = useMemo(() => users.filter(u => u.role === 'member' && u.status === 'approved'), [users]);
    const eventItems = useMemo(() => items.filter(i => i.event_id === event.id), [items, event.id]);

    const getMemberStats = (memberId: string) => {
        const memberOrders = orders.filter(o => o.member_id === memberId && o.event_id === event.id);
        const totalSales = memberOrders
            .filter(o => o.verified)
            .reduce((sum, o) => sum + o.amount_inr, 0);
        const pendingRequests = memberOrders.filter(o => !o.verified).length;
        return { totalSales, pendingRequests };
    };

    const handleAddConsumption = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const memberId = formData.get('memberId') as string;
        const itemId = formData.get('itemId') as string;
        const customerName = formData.get('customerName') as string;
        const quantityKg = parseFloat(formData.get('quantityKg') as string);
        const amountInr = parseFloat(formData.get('amountInr') as string);

        if (memberId && itemId && customerName && !isNaN(quantityKg) && quantityKg > 0 && !isNaN(amountInr) && amountInr >= 0) {
            const success = await addConsumptionByHost(memberId, event.id, itemId, customerName, quantityKg, amountInr);
            if (success) {
                setModalOpen(false);
            }
        } else {
            showNotification('Please fill out all fields correctly.', 'error');
        }
    };

    const thClasses = "p-2 text-left text-xs md:p-3 md:text-sm font-bold text-gray-800 uppercase tracking-wider";
    const tdClasses = "p-2 text-sm md:p-3 md:text-base text-gray-800";
    const inputClasses = "w-full mt-1 p-2 border rounded-lg bg-white";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Member Data for {event.name} {event.year}</h1>
                <Button onClick={() => setModalOpen(true)} className="w-full md:w-auto">Add Member Consumption</Button>
            </div>

            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className={thClasses}>Member Name</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Email</th>
                                <th className={thClasses}>Sales (₹)</th>
                                <th className={thClasses}>Pending</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(member => {
                                const stats = getMemberStats(member.id);
                                return (
                                    <tr key={member.id} className="border-b border-gray-100 hover:bg-white/70">
                                        <td className={`${tdClasses} font-medium`}>{member.name}</td>
                                        <td className={`${tdClasses} hidden md:table-cell`}>{member.email}</td>
                                        <td className={tdClasses}>₹{stats.totalSales.toFixed(2)}</td>
                                        <td className={tdClasses}>{stats.pendingRequests}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {members.length === 0 && <p className="text-center p-4">No members have been approved yet.</p>}
                </div>
            </GlassCard>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Member Consumption">
                <form onSubmit={handleAddConsumption} className="space-y-4">
                    <div>
                        <label className="block font-medium">Member</label>
                        <select name="memberId" required className={inputClasses}>
                            <option value="">Select a member</option>
                            {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium">Item</label>
                        <select name="itemId" required className={inputClasses}>
                            <option value="">Select an item</option>
                            {eventItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium">Customer Name</label>
                        <input name="customerName" type="text" required className={inputClasses}/>
                    </div>
                     <div>
                        <label className="block font-medium">Quantity (kg)</label>
                        <input name="quantityKg" type="number" step="0.01" required className={inputClasses}/>
                    </div>
                     <div>
                        <label className="block font-medium">Amount (₹)</label>
                        <input name="amountInr" type="number" step="0.01" required className={inputClasses}/>
                    </div>
                    <Button type="submit" className="w-full">Add and Verify Consumption</Button>
                </form>
            </Modal>
        </div>
    );
};

export default HostMemberData;
