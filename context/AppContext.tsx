
import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { User, Role, UserStatus, Event, Item, Order, Expense, StoredFile, Note, PaymentStatus } from '../types';
import { supabase } from '../supabaseClient';
import { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface NotificationType {
    message: string;
    type: 'success' | 'error';
}

export interface AppContextType {
    currentUser: User | null;
    users: User[]; // Now represents all profiles
    events: Event[];
    items: Item[];
    orders: Order[];
    expenses: Expense[];
    storedFiles: StoredFile[];
    notes: Note[];
    error: string | null;
    notification: NotificationType | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    requestToJoin: (name: string, email: string, pass: string) => Promise<void>;
    clearError: () => void;
    clearNotification: () => void;
    showNotification: (message: string, type?: 'success' | 'error') => void;
    approveMember: (memberId: string) => Promise<void>;
    createEvent: (name: string, year: number, imageFile?: File) => Promise<void>;
    addItem: (eventId: string, name: string, initialStock: number) => Promise<void>;
    addStock: (itemId: string, amount: number) => Promise<void>;
    editItemStock: (itemId: string, newStock: number) => Promise<void>;
    addExpense: (addedById: string, eventId: string, name: string, amount: number) => Promise<void>;
    verifyExpense: (expenseId: string) => Promise<void>;
    editExpense: (expenseId: string, newName: string, newAmount: number) => Promise<void>;
    deleteExpense: (expenseId: string) => Promise<void>;
    uploadFile: (uploadedById: string, name: string, file: File) => Promise<void>;
    deleteFile: (fileId: string) => Promise<void>;
    verifyOrder: (orderId: string) => Promise<void>;
    rejectOrder: (orderId: string) => Promise<void>;
    addOrder: (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => Promise<void>;
    editOrder: (orderId: string, newValues: { customerName: string; itemId: string; quantityKg: number; amountInr: number; }) => Promise<void>;
    deleteOrder: (orderId: string) => Promise<void>;
    updateOrderPaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
    addNote: (memberId: string, eventId: string, content: string, imageFiles?: File[]) => Promise<void>;
    editNote: (noteId: string, newContent: string, newImageFiles?: File[], existingImageUrls?: string[]) => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;
    changePassword: (newPass: string) => Promise<void>;
    changeEmail: (newEmail: string) => Promise<void>;
    resetMemberPassword: (memberId: string, newPass: string) => Promise<void>;
    addConsumptionByHost: (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State is no longer from localStorage
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    
    // --- NOTIFICATION & ERROR HELPERS ---
    const clearError = () => setError(null);
    const clearNotification = () => setNotification(null);
    const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
        setNotification({ message, type });
    };

    // --- DATA FETCHING & REALTIME ---
    const fetchAllData = async () => {
        const fetchTables = [
            supabase!.from('profiles').select('*').then(({ data }) => setUsers(data as User[] || [])),
            supabase!.from('events').select('*').then(({ data }) => setEvents(data || [])),
            supabase!.from('items').select('*').then(({ data }) => setItems(data || [])),
            supabase!.from('orders').select('*').then(({ data }) => setOrders(data || [])),
            supabase!.from('expenses').select('*').then(({ data }) => setExpenses(data || [])),
            supabase!.from('stored_files').select('*').then(({ data }) => setStoredFiles(data || [])),
            supabase!.from('notes').select('*').then(({ data }) => setNotes(data || [])),
        ];
        await Promise.all(fetchTables);
    };

    useEffect(() => {
        fetchAllData(); // Fetch initial data
        
        // Listen for changes in any table and refetch all data
        const subscription = supabase!.channel('public-db-changes')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            fetchAllData();
          })
          .subscribe();

        return () => {
            supabase!.removeChannel(subscription);
        };
    }, []);


    // --- AUTHENTICATION ---
    useEffect(() => {
        const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase!
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile) {
                    setCurrentUser({
                        id: session.user.id,
                        email: session.user.email!,
                        name: profile.name,
                        role: profile.role,
                        status: profile.status,
                    });
                }
            } else {
                setCurrentUser(null);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        clearError();
        const { error } = await supabase!.auth.signInWithPassword({ email, password: pass });
        if (error) setError(error.message);
    };

    const logout = async () => {
        await supabase!.auth.signOut();
        setCurrentUser(null);
    };

    const requestToJoin = async (name: string, email: string, pass: string) => {
        clearError();
        const { error } = await supabase!.auth.signUp({
            email, password: pass, options: { data: { name } }
        });
        if (error) {
             setError(error.message);
        } else {
            showNotification('Join request sent! Please check your email to verify your account.', 'success');
        }
    };
    
    // --- USER & EVENT MANAGEMENT ---
    const approveMember = async (memberId: string) => {
        await supabase!.from('profiles').update({ status: UserStatus.APPROVED }).eq('id', memberId);
    };

    const createEvent = async (name: string, year: number, imageFile?: File) => {
        let imageUrl = `https://picsum.photos/seed/${name}${year}/400/300`;
        if (imageFile) {
            const filePath = `events/${Date.now()}-${imageFile.name}`;
            const { error: uploadError } = await supabase!.storage.from('sainath-uploads').upload(filePath, imageFile);
            if (!uploadError) {
                const { data } = supabase!.storage.from('sainath-uploads').getPublicUrl(filePath);
                imageUrl = data.publicUrl;
            }
        }
        await supabase!.from('events').insert({ name, year, image_url: imageUrl });
    };

    const changePassword = async (newPass: string) => {
        const { error } = await supabase!.auth.updateUser({ password: newPass });
        if (error) showNotification(error.message, 'error');
        else showNotification('Password updated successfully!', 'success');
    };

    const changeEmail = async (newEmail: string) => {
        const { error } = await supabase!.auth.updateUser({ email: newEmail });
        if (error) showNotification(error.message, 'error');
        else showNotification('Email change initiated. Please check both your old and new email to confirm.', 'success');
    };

    const resetMemberPassword = async (memberId: string, newPass: string) => {
        // Note: This requires admin privileges, which you'd set up in Supabase.
        // For now, this is a placeholder for a more secure implementation.
        showNotification("Password reset for members must be configured with admin privileges in Supabase.", 'error');
    };
    
    // --- ITEM & STOCK MANAGEMENT ---
    const addItem = async (eventId: string, name: string, initialStock: number) => {
        await supabase!.from('items').insert({ event_id: eventId, name, available_stock_kg: initialStock });
    };

    const addStock = async (itemId: string, amount: number) => {
        const { data: item } = await supabase!.from('items').select('available_stock_kg').eq('id', itemId).single();
        if (item) {
            await supabase!.from('items').update({ available_stock_kg: item.available_stock_kg + amount }).eq('id', itemId);
        }
    };

    const editItemStock = async (itemId: string, newStock: number) => {
        await supabase!.from('items').update({ available_stock_kg: newStock }).eq('id', itemId);
    };

    // --- ORDERS & CONSUMPTION ---
    const addOrder = async (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => {
        const { data: item } = await supabase!.from('items').select('available_stock_kg, name').eq('id', itemId).single();
        if (!item || item.available_stock_kg < quantityKg) {
            showNotification(`Insufficient stock for ${item?.name}. Available: ${item?.available_stock_kg || 0} kg.`, 'error');
            return;
        }
        await supabase!.from('orders').insert({ member_id: memberId, event_id: eventId, item_id: itemId, customer_name: customerName, quantity_kg: quantityKg, amount_inr: amountInr });
    };
    
    const addConsumptionByHost = async (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number): Promise<boolean> => {
        const { data: item } = await supabase!.from('items').select('available_stock_kg, name').eq('id', itemId).single();
        if (!item || item.available_stock_kg < quantityKg) {
            showNotification(`Insufficient stock for ${item?.name}. Available: ${item?.available_stock_kg || 0} kg.`, 'error');
            return false;
        }

        const { error } = await supabase!.from('orders').insert({ member_id: memberId, event_id: eventId, item_id: itemId, customer_name: customerName, quantity_kg: quantityKg, amount_inr: amountInr, verified: true });
        
        if (!error) {
            await supabase!.from('items').update({ available_stock_kg: item.available_stock_kg - quantityKg }).eq('id', itemId);
            return true;
        }
        return false;
    };

    const verifyOrder = async (orderId: string) => {
        const { data: order } = await supabase!.from('orders').select('*, items(available_stock_kg, name)').eq('id', orderId).single();
        if (!order || !order.items) return;

        if (order.items.available_stock_kg < order.quantity_kg) {
            showNotification(`Cannot verify. Insufficient stock for ${order.items.name}.`, 'error');
            return;
        }

        await supabase!.from('orders').update({ verified: true, edited: false }).eq('id', orderId);
        await supabase!.from('items').update({ available_stock_kg: order.items.available_stock_kg - order.quantity_kg }).eq('id', order.item_id);
    };

    const rejectOrder = async (orderId: string) => {
        await supabase!.from('orders').delete().eq('id', orderId);
    };

    const editOrder = async (orderId: string, newValues: { customerName: string; itemId: string; quantityKg: number; amountInr: number; }) => {
        await supabase!.from('orders').update({
            customer_name: newValues.customerName,
            item_id: newValues.itemId,
            quantity_kg: newValues.quantityKg,
            amount_inr: newValues.amountInr,
            verified: false,
            edited: true,
            date_time: new Date().toISOString()
        }).eq('id', orderId);
    };
    
    const deleteOrder = async (orderId: string) => {
        await supabase!.from('orders').delete().eq('id', orderId);
    };

    const updateOrderPaymentStatus = async (orderId: string, status: PaymentStatus) => {
        await supabase!.from('orders').update({ payment_status: status }).eq('id', orderId);
    };

    // --- EXPENSES ---
    const addExpense = async (addedById: string, eventId: string, name: string, amountInr: number) => {
        const verified = currentUser?.role === Role.HOST;
        await supabase!.from('expenses').insert({ added_by_id: addedById, event_id: eventId, name, amount_inr: amountInr, verified });
    };

    const editExpense = async (expenseId: string, newName: string, newAmount: number) => {
        await supabase!.from('expenses').update({ name: newName, amount_inr: newAmount }).eq('id', expenseId);
    };

    const deleteExpense = async (expenseId: string) => {
        await supabase!.from('expenses').delete().eq('id', expenseId);
    };

    const verifyExpense = async (expenseId: string) => {
        await supabase!.from('expenses').update({ verified: true }).eq('id', expenseId);
    };

    // --- FILES & NOTES ---
    const uploadFile = async (uploadedById: string, name: string, file: File) => {
        const filePath = `files/${uploadedById}/${Date.now()}-${file.name}`;
        const { error } = await supabase!.storage.from('sainath-uploads').upload(filePath, file);
        if (!error) {
            await supabase!.from('stored_files').insert({ uploaded_by_id: uploadedById, name, file_path: filePath });
        }
    };
    
    const deleteFile = async (fileId: string) => {
        const { data: file } = await supabase!.from('stored_files').select('file_path').eq('id', fileId).single();
        if (file) {
            await supabase!.storage.from('sainath-uploads').remove([file.file_path]);
            await supabase!.from('stored_files').delete().eq('id', fileId);
        }
    };

    const addNote = async (memberId: string, eventId: string, content: string, imageFiles: File[] = []) => {
        const imageUrls: string[] = [];
        for (const file of imageFiles) {
            const filePath = `notes/${memberId}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase!.storage.from('sainath-uploads').upload(filePath, file);
            if (!uploadError) {
                const { data } = supabase!.storage.from('sainath-uploads').getPublicUrl(filePath);
                imageUrls.push(data.publicUrl);
            }
        }
        await supabase!.from('notes').insert({ member_id: memberId, event_id: eventId, content, image_urls: imageUrls });
    };

    const editNote = async (noteId: string, newContent: string, newImageFiles: File[] = [], existingImageUrls: string[] = []) => {
        const newImageUrls: string[] = [...existingImageUrls];
         for (const file of newImageFiles) {
            const filePath = `notes/${currentUser?.id}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase!.storage.from('sainath-uploads').upload(filePath, file);
            if (!uploadError) {
                const { data } = supabase!.storage.from('sainath-uploads').getPublicUrl(filePath);
                newImageUrls.push(data.publicUrl);
            }
        }
        await supabase!.from('notes').update({ content: newContent, image_urls: newImageUrls }).eq('id', noteId);
    };

    const deleteNote = async (noteId: string) => {
        // Note: This doesn't delete images from storage to keep it simple.
        await supabase!.from('notes').delete().eq('id', noteId);
    };

    const value: AppContextType = {
        currentUser, users, events, items, orders, expenses, storedFiles, notes, error, notification,
        login, logout, requestToJoin, clearError, clearNotification, showNotification, approveMember,
        createEvent, addItem, addStock, editItemStock, addExpense, verifyExpense, editExpense, deleteExpense,
        uploadFile, deleteFile, verifyOrder, rejectOrder, addOrder, editOrder, deleteOrder,
        updateOrderPaymentStatus, addNote, editNote, deleteNote, changePassword, changeEmail,
        resetMemberPassword, addConsumptionByHost,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};