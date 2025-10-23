

import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { User, Role, UserStatus, Event, Item, Order, Expense, StoredFile, Note, PaymentStatus } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

// A simple hashing function for demonstration. In a real app, use a proper library like bcrypt.
const simpleHash = (s: string) => {
    let hash = 0;
    if (s.length === 0) return hash.toString();
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
};

export interface NotificationType {
    message: string;
    type: 'success' | 'error';
}

export interface AppContextType {
    currentUser: User | null;
    users: User[];
    events: Event[];
    items: Item[];
    orders: Order[];
    expenses: Expense[];
    storedFiles: StoredFile[];
    notes: Note[];
    error: string | null;
    notification: NotificationType | null;
    login: (email: string, pass: string) => void;
    logout: () => void;
    requestToJoin: (name: string, email: string, pass: string) => void;
    clearError: () => void;
    clearNotification: () => void;
    showNotification: (message: string, type?: 'success' | 'error') => void;
    approveMember: (memberId: string) => void;
    createEvent: (name: string, year: number, imageUrl: string) => void;
    addItem: (eventId: string, name: string, initialStock: number) => void;
    addStock: (itemId: string, amount: number) => void;
    editItemStock: (itemId: string, newStock: number) => void;
    addExpense: (addedById: string, eventId: string, name: string, amount: number) => void;
    verifyExpense: (expenseId: string) => void;
    editExpense: (expenseId: string, newName: string, newAmount: number) => void;
    deleteExpense: (expenseId: string) => void;
    uploadFile: (uploadedById: string, name: string, type: string, url: string) => void;
    deleteFile: (fileId: string) => void;
    verifyOrder: (orderId: string) => void;
    rejectOrder: (orderId: string) => void;
    addOrder: (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => void;
    editOrder: (orderId: string, newValues: { customerName: string; itemId: string; quantityKg: number; amountInr: number; }) => void;
    deleteOrder: (orderId: string) => void;
    updateOrderPaymentStatus: (orderId: string, status: PaymentStatus) => void;
    addNote: (memberId: string, eventId: string, content: string, imageUrls?: string[]) => void;
    editNote: (noteId: string, newContent: string, newImageUrls?: string[]) => void;
    deleteNote: (noteId: string) => void;
    changePassword: (userId: string, newPass: string) => void;
    changeEmail: (userId: string, newEmail: string, currentPass: string) => boolean;
    addConsumptionByHost: (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useLocalStorage<User[]>('sainath_users', []);
    const [events, setEvents] = useLocalStorage<Event[]>('sainath_events', []);
    const [items, setItems] = useLocalStorage<Item[]>('sainath_items', []);
    const [orders, setOrders] = useLocalStorage<Order[]>('sainath_orders', []);
    const [expenses, setExpenses] = useLocalStorage<Expense[]>('sainath_expenses', []);
    const [storedFiles, setStoredFiles] = useLocalStorage<StoredFile[]>('sainath_files', []);
    const [notes, setNotes] = useLocalStorage<Note[]>('sainath_notes', []);
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('sainath_currentUser', null);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<NotificationType | null>(null);

    useEffect(() => {
        // Initialize default data if it's the first run
        if (users.length === 0) {
            const host: User = {
                id: crypto.randomUUID(),
                name: 'Sainath host',
                email: 'harshvekariya910@gmail.com',
                passwordHash: simpleHash('123456'),
                role: Role.HOST,
                status: UserStatus.APPROVED,
            };
            setUsers([host]);

            const rakhi: Event = { id: crypto.randomUUID(), name: 'Rakshabandhan', year: 2024, imageUrl: 'https://images.unsplash.com/photo-1597987299991-248de49a78fd?q=80&w=2070&auto=format&fit=crop' };
            const diwali: Event = { id: crypto.randomUUID(), name: 'Diwali', year: 2024, imageUrl: 'https://images.unsplash.com/photo-1542866752-45a730a35914?q=80&w=2070&auto=format&fit=crop' };
            setEvents([rakhi, diwali]);
            
            const kajuKatli: Item = { id: crypto.randomUUID(), eventId: diwali.id, name: 'Kaju-Katli', availableStockKg: 50 };
            const chikki: Item = { id: crypto.randomUUID(), eventId: diwali.id, name: 'Chikki', availableStockKg: 100 };
            const kajuKatliRakhi: Item = { id: crypto.randomUUID(), eventId: rakhi.id, name: 'Kaju-Katli', availableStockKg: 30 };
            setItems([kajuKatli, chikki, kajuKatliRakhi]);
        }
    }, []);

    const clearError = () => setError(null);
    const clearNotification = () => setNotification(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
        setNotification({ message, type });
    };

    const login = (email: string, pass: string) => {
        clearError();
        const passwordHash = simpleHash(pass);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);
        
        if (user) {
            if (user.status === UserStatus.PENDING) {
                setError('Your account is pending approval from the host.');
            } else if (user.status === UserStatus.APPROVED) {
                setCurrentUser(user);
            }
        } else {
            setError('Invalid email or password.');
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const requestToJoin = (name: string, email: string, pass: string) => {
        clearError();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            setError('An account with this email already exists.');
            return;
        }
        const newUser: User = {
            id: crypto.randomUUID(),
            name,
            email,
            passwordHash: simpleHash(pass || '121212'), // Use 121212 if empty
            role: Role.MEMBER,
            status: UserStatus.PENDING,
        };
        setUsers(prev => [...prev, newUser]);
        showNotification('Join request sent! Please wait for host approval.', 'success');
    };

    const approveMember = (memberId: string) => {
        setUsers(prev => prev.map(u => u.id === memberId ? { ...u, status: UserStatus.APPROVED } : u));
    };
    
    const createEvent = (name: string, year: number, imageUrl: string) => {
        const newEvent: Event = {
            id: crypto.randomUUID(),
            name,
            year,
            imageUrl: imageUrl || `https://picsum.photos/seed/${name}${year}/400/300`,
        };
        setEvents(prev => [...prev, newEvent]);
    };
    
    const addItem = (eventId: string, name: string, initialStock: number) => {
        const newItem: Item = {
            id: crypto.randomUUID(),
            eventId,
            name,
            availableStockKg: initialStock,
        };
        setItems(prev => [...prev, newItem]);
    };

    const addStock = (itemId: string, amount: number) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, availableStockKg: i.availableStockKg + amount } : i));
    };

    const editItemStock = (itemId: string, newStock: number) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, availableStockKg: newStock } : i));
    };

    const addOrder = (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => {
        const item = items.find(i => i.id === itemId);
        if (!item) {
            showNotification("Selected item not found. Please refresh and try again.");
            return;
        }
        
        if (item.availableStockKg < quantityKg) {
            showNotification(`Insufficient stock for ${item.name}. Available: ${item.availableStockKg.toFixed(2)} kg.`);
            return;
        }

        const newOrder: Order = {
            id: crypto.randomUUID(),
            memberId, eventId, itemId, customerName, quantityKg, amountInr,
            paymentStatus: PaymentStatus.BAKI,
            verified: false,
            dateTime: new Date().toISOString(),
        };
        setOrders(prev => [...prev, newOrder]);
    };
    
    const addConsumptionByHost = (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number): boolean => {
        const item = items.find(i => i.id === itemId);
        if (!item) {
            showNotification("Selected item not found. Please refresh and try again.");
            return false;
        }
        
        if (item.availableStockKg < quantityKg) {
            showNotification(`Insufficient stock for ${item.name}. Available: ${item.availableStockKg.toFixed(2)} kg.`);
            return false;
        }

        const newOrder: Order = {
            id: crypto.randomUUID(),
            memberId, eventId, itemId, customerName, quantityKg, amountInr,
            paymentStatus: PaymentStatus.BAKI,
            verified: true, // Auto-verified
            dateTime: new Date().toISOString(),
        };
        setOrders(prev => [...prev, newOrder]);
        // Reduce stock immediately
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, availableStockKg: i.availableStockKg - quantityKg } : i));
        return true;
    };

    const editOrder = (orderId: string, newValues: { customerName: string; itemId: string; quantityKg: number; amountInr: number; }) => {
        const item = items.find(i => i.id === newValues.itemId);
        if (!item) {
            showNotification("Selected item not found. Please refresh and try again.");
            return;
        }
        
        if (item.availableStockKg < newValues.quantityKg) {
            showNotification(`Insufficient stock for ${item.name}. Available: ${item.availableStockKg.toFixed(2)} kg.`);
            return;
        }

        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...newValues, verified: false, edited: true, dateTime: new Date().toISOString() } : o));
    };

    const deleteOrder = (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };

    const verifyOrder = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) {
            showNotification("Order not found.");
            return;
        }
        const item = items.find(i => i.id === order.itemId);
        if (!item) {
            showNotification("Item associated with this order not found.");
            return;
        }
    
        if (item.availableStockKg < order.quantityKg) {
            showNotification(`Cannot verify. Insufficient stock for ${item.name}. Available: ${item.availableStockKg.toFixed(2)} kg, Requested: ${order.quantityKg.toFixed(2)} kg.`);
            return;
        }
    
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, verified: true, edited: false } : o));
        // Reduce stock
        setItems(prev => prev.map(i => i.id === order.itemId ? { ...i, availableStockKg: i.availableStockKg - order.quantityKg } : i));
    };

    const rejectOrder = (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };
    
    const updateOrderPaymentStatus = (orderId: string, status: PaymentStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
    };

    const addExpense = (addedById: string, eventId: string, name: string, amountInr: number) => {
        const newExpense: Expense = {
            id: crypto.randomUUID(),
            addedById,
            eventId,
            name,
            amountInr,
            verified: currentUser?.role === Role.HOST, // Host expenses are auto-verified
            dateTime: new Date().toISOString(),
        };
        setExpenses(prev => [...prev, newExpense]);
    };

    const editExpense = (expenseId: string, newName: string, newAmount: number) => {
        setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, name: newName, amountInr: newAmount } : e));
    };

    const deleteExpense = (expenseId: string) => {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
    };

    const verifyExpense = (expenseId: string) => {
        setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, verified: true } : e));
    };

    const uploadFile = (uploadedById: string, name: string, type: string, url: string) => {
        const newFile: StoredFile = {
            id: crypto.randomUUID(),
            uploadedById,
            name,
            type,
            url,
            uploadDate: new Date().toISOString(),
        };
        setStoredFiles(prev => [...prev, newFile]);
    };

    const deleteFile = (fileId: string) => {
        setStoredFiles(prev => prev.filter(f => f.id !== fileId));
    };
    
    const addNote = (memberId: string, eventId: string, content: string, imageUrls: string[] = []) => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            memberId,
            eventId,
            content,
            imageUrls,
            dateTime: new Date().toISOString(),
        };
        setNotes(prev => [...prev, newNote]);
    };

    const editNote = (noteId: string, newContent: string, newImageUrls: string[] = []) => {
        setNotes(prev => prev.map(n => 
            n.id === noteId 
            ? { ...n, content: newContent, imageUrls: newImageUrls, dateTime: new Date().toISOString() } 
            : n
        ));
    };

    const deleteNote = (noteId: string) => {
        setNotes(prev => prev.filter(n => n.id !== noteId));
    };

    const changePassword = (userId: string, newPass: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, passwordHash: simpleHash(newPass) } : u));
        // If the current user is changing their own password, update the currentUser object as well
        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, passwordHash: simpleHash(newPass) } : null);
        }
        showNotification('Password changed successfully!', 'success');
    };
    
    const changeEmail = (userId: string, newEmail: string, currentPass: string): boolean => {
        const user = users.find(u => u.id === userId);
        if (!user) {
            showNotification("User not found.", 'error');
            return false;
        }

        if (simpleHash(currentPass) !== user.passwordHash) {
            showNotification("Incorrect password.", 'error');
            return false;
        }

        const emailInUse = users.some(u => u.email.toLowerCase() === newEmail.toLowerCase() && u.id !== userId);
        if (emailInUse) {
            showNotification("This email is already in use by another account.", 'error');
            return false;
        }

        setUsers(prev => prev.map(u => u.id === userId ? { ...u, email: newEmail } : u));
        
        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, email: newEmail } : null);
        }
        
        showNotification('Email changed successfully!', 'success');
        return true;
    };

    const value: AppContextType = {
        currentUser,
        users,
        events,
        items,
        orders,
        expenses,
        storedFiles,
        notes,
        error,
        notification,
        login,
        logout,
        requestToJoin,
        clearError,
        clearNotification,
        showNotification,
        approveMember,
        createEvent,
        addItem,
        addStock,
        editItemStock,
        addExpense,
        verifyExpense,
        editExpense,
        deleteExpense,
        uploadFile,
        deleteFile,
        verifyOrder,
        rejectOrder,
        addOrder,
        editOrder,
        deleteOrder,
        updateOrderPaymentStatus,
        addNote,
        editNote,
        deleteNote,
        changePassword,
        changeEmail,
        addConsumptionByHost,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};