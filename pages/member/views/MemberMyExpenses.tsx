import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Event, Expense } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { MoreVertical } from 'lucide-react';

interface MemberMyExpensesProps {
  event: Event;
}

const MemberMyExpenses: React.FC<MemberMyExpensesProps> = ({ event }) => {
    const { expenses, currentUser, addExpense, editExpense, deleteExpense } = useAppContext();
    const expenseNameRef = useRef<HTMLInputElement>(null);
    const expenseAmountRef = useRef<HTMLInputElement>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const myExpenses = useMemo(() => expenses.filter(e => e.addedById === currentUser!.id && e.eventId === event.id)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()), [expenses, currentUser, event.id]);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const name = expenseNameRef.current?.value;
        const amount = expenseAmountRef.current?.value;
        if (name && amount && currentUser) {
            addExpense(currentUser.id, event.id, name, parseFloat(amount));
            if (expenseNameRef.current) expenseNameRef.current.value = '';
            if (expenseAmountRef.current) expenseAmountRef.current.value = '';
        }
    };
    
    const handleEditExpense = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value;
        const amount = (e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value;
        if (name && amount && editingExpense) {
            editExpense(editingExpense.id, name, parseFloat(amount));
            setEditModalOpen(false);
            setEditingExpense(null);
        }
    };
    
    const handleDeleteExpense = (expenseId: string) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            deleteExpense(expenseId);
        }
    }

    const inputClasses = "w-full mt-1 p-2 border rounded-lg bg-white";
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">My Expenses for {event.name} {event.year}</h1>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Add New Expense</h2>
                <form onSubmit={handleAddExpense} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow w-full">
                        <label className="block font-medium">Expense Name</label>
                        <input ref={expenseNameRef} type="text" required className={inputClasses} />
                    </div>
                    <div className="flex-grow w-full">
                         <label className="block font-medium">Amount (₹)</label>
                        <input ref={expenseAmountRef} type="number" step="0.01" required className={inputClasses} />
                    </div>
                    <Button type="submit" className="w-full md:w-auto flex-shrink-0">Add Expense</Button>
                </form>
            </GlassCard>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">My Expense History</h2>
                 <ul className="space-y-2">
                    {myExpenses.map(exp => (
                        <li key={exp.id} className="flex justify-between items-center p-2 md:p-3 bg-white/70 rounded-lg">
                            <div>
                                <p className="font-semibold">{exp.name}</p>
                                <p className="text-xs text-gray-500">{new Date(exp.dateTime).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="text-right">
                                    <p className="font-bold text-base md:text-lg">₹{exp.amountInr.toFixed(2)}</p>
                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exp.verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                        {exp.verified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                {!exp.verified && (
                                    <div className="relative">
                                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === exp.id ? null : exp.id); }} className="p-2 rounded-full hover:bg-gray-200">
                                            <MoreVertical size={20} />
                                        </button>
                                        {openMenuId === exp.id && (
                                            <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg z-20 border">
                                                <a href="#" onClick={(e) => { e.preventDefault(); setEditingExpense(exp); setEditModalOpen(true); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteExpense(exp.id); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
                {myExpenses.length === 0 && <p className="text-center p-4">You have not added any expenses yet.</p>}
            </GlassCard>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Expense">
                <form onSubmit={handleEditExpense} className="space-y-4">
                    <div>
                        <label className="block font-medium">Expense Name</label>
                        <input name="name" type="text" defaultValue={editingExpense?.name} required className={inputClasses}/>
                    </div>
                    <div>
                        <label className="block font-medium">Amount (₹)</label>
                        <input name="amount" type="number" step="0.01" defaultValue={editingExpense?.amountInr} required className={inputClasses}/>
                    </div>
                    <Button type="submit" className="w-full">Update Expense</Button>
                </form>
            </Modal>
        </div>
    );
};

export default MemberMyExpenses;