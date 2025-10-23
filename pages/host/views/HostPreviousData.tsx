import React, { useState, useMemo, useRef } from 'react';
import { Event } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { Download, Upload, Trash2 } from 'lucide-react';
// FIX: Import supabase client to generate public URLs for stored files.
import { supabase } from '../../../supabaseClient';

interface HostPreviousDataProps {
  event: Event;
}

const HostPreviousData: React.FC<HostPreviousDataProps> = ({ event }) => {
    const { orders, users, items, storedFiles, uploadFile, deleteFile, currentUser } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [customFileName, setCustomFileName] = useState('');

    const yearlySalesData = useMemo(() => {
        return orders
            // FIX: Property 'eventId' does not exist on type 'Order'. Did you mean 'event_id'?
            .filter(o => o.event_id === event.id && o.verified)
            .map(order => {
                // FIX: Property 'memberId' does not exist on type 'Order'. Did you mean 'member_id'?
                const member = users.find(u => u.id === order.member_id);
                // FIX: Property 'itemId' does not exist on type 'Order'. Did you mean 'item_id'?
                const item = items.find(i => i.id === order.item_id);
                return {
                    memberName: member?.name || 'N/A',
                    // FIX: Property 'dateTime' does not exist on type 'Order'. Did you mean 'date_time'?
                    saleDateTime: new Date(order.date_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                    // FIX: Property 'customerName' does not exist on type 'Order'. Did you mean 'customer_name'?
                    customerName: order.customer_name,
                    item: item?.name || 'N/A',
                    // FIX: Property 'quantityKg' does not exist on type 'Order'. Did you mean 'quantity_kg'?
                    quantityKg: order.quantity_kg,
                    // FIX: Property 'amountInr' does not exist on type 'Order'. Did you mean 'amount_inr'?
                    amountInr: order.amount_inr,
                };
            });
    }, [orders, users, items, event.id]);

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;
        
        const escapeCSV = (val: any) => {
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const header = Object.keys(data[0]).map(escapeCSV).join(',');
        const rows = data.map(row => Object.values(row).map(escapeCSV).join(',')).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentUser) {
            const name = customFileName || file.name;
            // FIX: Expected 3 arguments, but got 4. Pass the file object directly.
            uploadFile(currentUser.id, name, file);
            setCustomFileName('');
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // FIX: Function to get public URL for a file from its path.
    const getFileUrl = (filePath: string): string => {
        const { data } = supabase.storage.from('sainath-uploads').getPublicUrl(filePath);
        return data.publicUrl;
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Previous Data for {event.name} {event.year}</h1>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Yearly Sales Data</h2>
                <Button onClick={() => exportToCSV(yearlySalesData, `sales_${event.name}_${event.year}.csv`)} disabled={yearlySalesData.length === 0}>
                    <Download className="inline-block mr-2" />
                    Download Merged CSV
                </Button>
                {/* Could add tables here for member-wise and item-wise sales if needed */}
            </GlassCard>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">File Storage</h2>
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center p-4 border rounded-lg bg-white/70">
                    <input
                        type="text"
                        placeholder="Custom file name (optional)"
                        value={customFileName}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        className="p-2 border rounded-lg flex-grow w-full md:w-auto bg-white"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv,.pdf,.txt,.docx"
                        className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full md:w-auto">
                        <Upload className="inline-block mr-2" />
                        Upload File
                    </Button>
                </div>

                <ul className="mt-4 space-y-2">
                    {storedFiles.map(file => (
                        <li key={file.id} className="flex justify-between items-center p-2 md:p-3 bg-white/70 rounded-lg">
                            <div>
                               <p className="font-semibold text-sm md:text-base">{file.name}</p>
                               {/* FIX: Property 'uploadDate' does not exist on type 'StoredFile'. Did you mean 'upload_date'? */}
                               <p className="text-xs text-gray-500">Uploaded on {new Date(file.upload_date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                {/* FIX: Property 'url' does not exist on type 'StoredFile'. */}
                                <a href={getFileUrl(file.file_path)} download={file.name} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"><Download /></a>
                                <button onClick={() => deleteFile(file.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 /></button>
                            </div>
                        </li>
                    ))}
                    {storedFiles.length === 0 && <p className="text-center p-4">No files uploaded yet.</p>}
                </ul>
            </GlassCard>
        </div>
    );
};

export default HostPreviousData;
