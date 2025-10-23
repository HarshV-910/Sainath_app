
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Event, Item, Expense } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { MoreVertical, Edit } from 'lucide-react';

interface HostExpenseAndItemsProps {
  event: Event;
}

const HostExpenseAndItems: React.FC<HostExpenseAndItemsProps> = ({ event }) => {
    const { items, orders, expenses, users, addItem, addStock, editItemStock, addExpense, verifyExpense, editExpense, currentUser } = useAppContext();
    
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [isStockModalOpen, setStockModalOpen] = useState(false);
    const [isEditStockModalOpen, setEditStockModalOpen] = useState(false);
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [isEditMemberExpenseModalOpen, setEditMemberExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const itemNameRef = useRef<HTMLInputElement>(null);
    const itemStockRef = useRef<HTMLInputElement>(null);
    const stockAmountRef = useRef<HTMLInputElement>(null);
    const editStockAmountRef = useRef<HTMLInputElement>(null);
    const expenseNameRef = useRef<HTMLInputElement>(null);
    const expenseAmountRef = useRef<HTMLInputElement>(null);

    const eventItems = useMemo(() => items.filter(i => i.event_id === event.id), [items, event.id]);
    const allExpensesForEvent = useMemo(() => expenses.filter(e => e.event_id === event.id), [expenses, event.id]);
    const hostExpenses = useMemo(() => allExpensesForEvent.filter(e => e.added_by_id === currentUser!.id), [allExpensesForEvent, currentUser]);
    const memberExpenses = useMemo(() => allExpensesForEvent.filter(e => e.added_by_id !== currentUser!.id).sort((a,b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()), [allExpensesForEvent, currentUser]);

    const totalEventExpenses = useMemo(() => {
        return allExpensesForEvent.filter(e => e.verified || e.added_by_id === currentUser!.id).reduce((sum, exp) => sum + exp.amount_inr, 0);
    }, [allExpensesForEvent, currentUser]);

    const memberTotalExpenses = useMemo(() => {
        const summary: { [key: string]: { memberName: string, totalAmount: number } } = {};
        memberExpenses.filter(e => e.verified).forEach(exp => {
            const member = users.find(u => u.id === exp.added_by_id);
            if (member) {
                if (!summary[member.id]) {
                    summary[member.id] = { memberName: member.name, totalAmount: 0 };
                }
                summary[member.id].totalAmount += exp.amount_inr;
            }
        });
        return Object.values(summary);
    }, [memberExpenses, users]);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const name = itemNameRef.current?.value;
        const stock = itemStockRef.current?.value;
        if (name && stock) {
            addItem(event.id, name, parseFloat(stock));
            setItemModalOpen(false);
        }
    };

    const handleAddStock = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = stockAmountRef.current?.value;
        if (amount && selectedItem) {
            addStock(selectedItem.id, parseFloat(amount));
            setStockModalOpen(false);
        }
    };
    
    const handleEditStock = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = editStockAmountRef.current?.value;
        if (amount && selectedItem) {
            editItemStock(selectedItem.id, parseFloat(amount));
            setEditStockModalOpen(false);
        }
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const name = expenseNameRef.current?.value;
        const amount = expenseAmountRef.current?.value;
        if (name && amount && currentUser) {
            addExpense(currentUser.id, event.id, name, parseFloat(amount));
            setExpenseModalOpen(false);
        }
    };

    const handleEditMemberExpense = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value;
        const amount = (e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value;
        if (name && amount && editingExpense) {
            editExpense(editingExpense.id, name, parseFloat(amount));
            setEditMemberExpenseModalOpen(false);
            setEditingExpense(null);
        }
    };

    const inputClasses = "w-full mt-1 p-2 border rounded-lg bg-white";
    const thClasses = "p-2 text-left text-xs md:p-3 md:text-sm font-bold text-gray-800 uppercase tracking-wider";
    const tdClasses = "p-2 text-sm md:p-3 md:text-base text-gray-800";
    
    const ExpenseCard: React.FC<{ expense: Expense }> = ({ expense }) => {
        const member = users.find(u => u.id === expense.added_by_id);
        return (
            <GlassCard className="mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg">{expense.name}</p>
                        <p className="text-sm text-gray-600">by {member?.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${expense.verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {expense.verified ? 'Verified' : 'Pending'}
                    </span>
                </div>
                <div className="border-t my-3"></div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-semibold">₹{expense.amount_inr.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-semibold">{new Date(expense.date_time).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="mt-4 flex gap-2">
                    {!expense.verified && <Button variant="success" size="sm" onClick={() => verifyExpense(expense.id)} className="flex-1">Verify</Button>}
                    <Button variant="secondary" size="sm" onClick={() => { setEditingExpense(expense); setEditMemberExpenseModalOpen(true); }} className="flex-1">
                        <Edit size={16} className="inline-block mr-1" /> Edit
                    </Button>
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Expenses & Items for {event.name} {event.year}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-brand-dark">Items / Products</h2>
                        <Button onClick={() => setItemModalOpen(true)} size="sm">Add New Item</Button>
                    </div>
                    <ul>
                        {eventItems.map(item => {
                            const consumedStock = orders
                                .filter(o => o.item_id === item.id && o.verified && o.event_id === event.id)
                                .reduce((sum, order) => sum + order.quantity_kg, 0);
                            const totalStock = item.available_stock_kg + consumedStock;

                            return (
                                <li key={item.id} className="flex justify-between items-center p-2 md:p-3 mb-2 bg-white/70 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-base md:text-lg">{item.name}</p>
                                        <p className="text-gray-600 text-sm md:text-base">Available: {item.available_stock_kg.toFixed(2)} kg</p>
                                        <p className="text-xs md:text-sm text-gray-500 font-medium">Total Stock: {totalStock.toFixed(2)} kg</p>
                                    </div>
                                    <div className="relative">
                                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }} className="p-2 rounded-full hover:bg-gray-200">
                                            <MoreVertical size={20} />
                                        </button>
                                        {openMenuId === item.id && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 border">
                                                <a href="#" onClick={(e) => { e.preventDefault(); setSelectedItem(item); setStockModalOpen(true); setOpenMenuId(null); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Stock</a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); setSelectedItem(item); setEditStockModalOpen(true); setOpenMenuId(null); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Stock</a>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                         {eventItems.length === 0 && <p className="text-center p-4">No items added yet.</p>}
                    </ul>
                </GlassCard>

                <GlassCard>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-brand-dark">My Expenses</h2>
                        <Button onClick={() => setExpenseModalOpen(true)} size="sm">Add Expense</Button>
                    </div>
                    <ul>
                        {hostExpenses.map(exp => (
                            <li key={exp.id} className="flex justify-between items-center p-2 md:p-3 mb-2 bg-white/70 rounded-lg">
                                <div>
                                    <p className="font-semibold">{exp.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(exp.date_time).toLocaleString()}</p>
                                </div>
                                <p className="font-bold text-base md:text-lg">₹{exp.amount_inr.toFixed(2)}</p>
                            </li>
                        ))}
                        {hostExpenses.length === 0 && <p className="text-center p-4">No expenses added yet.</p>}
                    </ul>
                </GlassCard>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h2 className="text-xl md:text-2xl font-bold text-brand-dark">Total Event Expense</h2>
                    <p className="text-3xl md:text-4xl font-bold text-indigo-600 mt-2">₹{totalEventExpenses.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Includes your expenses and verified member expenses.</p>
                </GlassCard>
                <GlassCard>
                    <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Total Expenses by Member</h2>
                    <table className="w-full">
                         <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className={thClasses}>Member</th>
                                <th className={`${thClasses} text-right`}>Total Amount (₹)</th>
                            </tr>
                         </thead>
                         <tbody>
                            {memberTotalExpenses.map(memExp => (
                                <tr key={memExp.memberName} className="border-b border-gray-100">
                                    <td className={tdClasses}>{memExp.memberName}</td>
                                    <td className={`${tdClasses} text-right font-semibold`}>₹{memExp.totalAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                     {memberTotalExpenses.length === 0 && <p className="text-center p-4">No verified member expenses yet.</p>}
                </GlassCard>
            </div>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">All Member Expenses</h2>
                <div className="hidden lg:block overflow-x-auto">
                     <table className="w-full">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className={thClasses}>Member</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Expense Name</th>
                                <th className={thClasses}>Amount (₹)</th>
                                <th className={`${thClasses} hidden md:table-cell`}>Date</th>
                                <th className={thClasses}>Status</th>
                                <th className={thClasses}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberExpenses.map(exp => {
                                const member = users.find(u => u.id === exp.added_by_id);
                                return (
                                <tr key={exp.id} className="border-b border-gray-100 hover:bg-white/70">
                                    <td className={tdClasses}>{member?.name}</td>
                                    <td className={`${tdClasses} hidden md:table-cell`}>{exp.name}</td>
                                    <td className={tdClasses}>₹{exp.amount_inr.toFixed(2)}</td>
                                    <td className={`${tdClasses} hidden md:table-cell`}>{new Date(exp.date_time).toLocaleDateString()}</td>
                                    <td className={tdClasses}>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exp.verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                            {exp.verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className={tdClasses}>
                                        <div className="flex gap-2">
                                            {!exp.verified && <Button variant="success" size="sm" onClick={() => verifyExpense(exp.id)}>Verify</Button>}
                                            <Button variant="secondary" size="sm" onClick={() => { setEditingExpense(exp); setEditMemberExpenseModalOpen(true); }}><Edit size={16} /></Button>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {memberExpenses.length === 0 && <p className="text-center p-4">No member expenses submitted.</p>}
                </div>
                <div className="block lg:hidden">
                    {memberExpenses.map(exp => <ExpenseCard key={exp.id} expense={exp} />)}
                    {memberExpenses.length === 0 && <p className="text-center p-4">No member expenses submitted.</p>}
                </div>
            </GlassCard>

            <Modal isOpen={isItemModalOpen} onClose={() => setItemModalOpen(false)} title="Add New Item">
                <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                        <label className="block font-medium">Item Name</label>
                        <input ref={itemNameRef} type="text" required className={inputClasses}/>
                    </div>
                    <div>
                        <label className="block font-medium">Initial Stock (kg)</label>
                        <input ref={itemStockRef} type="number" step="0.01" required className={inputClasses}/>
                    </div>
                    <Button type="submit" className="w-full">Add Item</Button>
                </form>
            </Modal>
            <Modal isOpen={isStockModalOpen} onClose={() => setStockModalOpen(false)} title={`Add Stock to ${selectedItem?.name}`}>
                <form onSubmit={handleAddStock} className="space-y-4">
                    <div>
                        <label className="block font-medium">Stock to Add (kg)</label>
                        <input ref={stockAmountRef} type="number" step="0.01" required className={inputClasses}/>
                    </div>
                    <Button type="submit" className="w-full">Update Stock</Button>
                </form>
            </Modal>
             <Modal isOpen={isEditStockModalOpen} onClose={() => setEditStockModalOpen(false)} title={`Edit Stock for ${selectedItem?.name}`}>
                <form onSubmit={handleEditStock} className="space-y-4">
                    <div>
                        <label className="block font-medium">New Total Stock (kg)</label>
                        <input ref={editStockAmountRef} type="number" step="0.01" defaultValue={selectedItem?.available_stock_kg} required className={inputClasses}/>
                    </div>
                    <Button type="submit" className="w-full">Set Stock</Button>
                </form>
            </Modal>
            <Modal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add Expense">
                <form onSubmit={handleAddExpense} className="space-y-4">
                    <div>
                        <label className="block font-medium">Expense Name</label>
                        <input ref={expenseNameRef} type="text" required className={inputClasses}/>
                    </div>
                    <div>
                        <label className="block font-medium">Amount (₹)</label>
                        <input ref={expenseAmountRef} type="number" step="0.01" required className={inputClasses}/>
                    </div>
                    <Button type="submit" className="w-full">Add Expense</Button>
                </form>
            </Modal>
            <Modal isOpen={isEditMemberExpenseModalOpen} onClose={() => setEditMemberExpenseModalOpen(false)} title="Edit Member Expense">
                <form onSubmit={handleEditMemberExpense} className="space-y-4">
                    <div>
                        <label className="block font-medium">Expense Name</label>
                        <input name="name" type="text" defaultValue={editingExpense?.name} required className={inputClasses}/>
                    </div>
                    <div>
                        <label className="block font-medium">Amount (₹)</label>
                        <input name="amount" type="number" step="0.01" defaultValue={editingExpense?.amount_inr} required className={inputClasses}/>
                    </div>
                    <Button type="submit" className="w-full">Update Expense</Button>
                </form>
            </Modal>
        </div>
    );
};

export default HostExpenseAndItems;
