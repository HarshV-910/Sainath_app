import React, { useMemo } from 'react';
import { Event } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { Download } from 'lucide-react';

interface MemberMyDataProps {
  event: Event;
}

const MemberMyData: React.FC<MemberMyDataProps> = ({ event }) => {
    const { orders, items, currentUser } = useAppContext();
    
    const myData = useMemo(() => {
        return orders
            .filter(o => o.memberId === currentUser!.id && o.eventId === event.id && o.verified)
            .map(order => {
                const item = items.find(i => i.id === order.itemId);
                return {
                    requestDate: new Date(order.dateTime).toLocaleDateString(),
                    customerName: order.customerName,
                    item: item?.name || 'N/A',
                    quantityKg: order.quantityKg,
                    amountInr: order.amountInr,
                    paymentStatus: order.paymentStatus,
                };
            });
    }, [orders, items, currentUser, event.id]);

    const exportToCSV = () => {
        if (myData.length === 0) return;
        const header = Object.keys(myData[0]).join(',');
        const rows = myData.map(row => Object.values(row).join(',')).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `my_data_${event.name}_${event.year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const thClasses = "p-2 text-left text-xs md:p-3 md:text-sm font-bold text-gray-800 uppercase tracking-wider";
    const tdClasses = "p-2 text-sm md:p-3 md:text-base text-gray-800";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">My Data for {event.name} {event.year}</h1>

            <GlassCard>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
                     <h2 className="text-xl md:text-2xl font-bold text-brand-dark">My Sales Report</h2>
                     <div className="flex gap-2 w-full md:w-auto">
                        <Button onClick={exportToCSV} disabled={myData.length === 0} className="w-full md:w-auto"><Download className="inline-block mr-2" /> Export to CSV</Button>
                     </div>
                </div>

                 <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b-2 border-gray-200">
                             <tr>
                                <th className={thClasses}>Date</th>
                                <th className={thClasses}>Customer</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Item</th>
                                <th className={thClasses}>Qty</th>
                                <th className={thClasses}>Amount</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myData.map((row, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-white/70">
                                    <td className={tdClasses}>{row.requestDate}</td>
                                    <td className={tdClasses}>{row.customerName}</td>
                                    <td className={`${tdClasses} hidden md:table-cell`}>{row.item}</td>
                                    <td className={tdClasses}>{row.quantityKg.toFixed(2)}</td>
                                    <td className={tdClasses}>₹{row.amountInr.toFixed(2)}</td>
                                    <td className={`${tdClasses} hidden md:table-cell`}>{row.paymentStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {myData.length === 0 && <p className="text-center p-4">No verified sales data to display.</p>}
                </div>
            </GlassCard>
        </div>
    );
};

export default MemberMyData;