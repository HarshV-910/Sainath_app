
import React from 'react';
import { LayoutDashboard, ShoppingCart, Users, BarChart, FileText, Settings, Bell, DollarSign, StickyNote, FileUp } from 'lucide-react';
import { Role } from '../../types';

interface SidebarProps {
    userRole: Role;
    activeView: string;
    onNavigate: (view: string) => void;
}

const hostNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: Bell },
    { id: 'member_data', label: 'Member Data', icon: Users },
    { id: 'expense_items', label: 'Expense & Items', icon: ShoppingCart },
    { id: 'previous_data', label: 'Previous Data', icon: BarChart },
];

const memberNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: ShoppingCart },
    { id: 'my_order_notes', label: 'My Order Notes', icon: StickyNote },
    { id: 'my_expenses', label: 'My Expenses', icon: DollarSign },
    { id: 'my_data', label: 'My Data', icon: FileText },
];

const Sidebar: React.FC<SidebarProps> = ({ userRole, activeView, onNavigate }) => {
    const navItems = userRole === Role.HOST ? hostNavItems : memberNavItems;

    return (
        <aside className="w-20 md:w-64 bg-white/50 backdrop-blur-xl border-r border-white/30 rounded-2xl p-4 transition-all duration-300 flex flex-col">
            <div className="mb-10 flex items-center justify-center md:justify-start gap-2">
                <img src="https://picsum.photos/40/40" alt="Logo" className="rounded-full" />
                <h1 className="hidden md:block text-2xl font-bold text-brand-dark">Sainath</h1>
            </div>
            <nav className="flex-grow">
                <ul>
                    {navItems.map(item => (
                        <li key={item.id} className="mb-2">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                                className={`flex items-center justify-center md:justify-start p-3 rounded-lg transition-all duration-200 ${
                                    activeView === item.id 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
                                }`}
                            >
                                <item.icon className="h-7 w-7" />
                                <span className="hidden md:inline-block ml-4 font-medium">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto">
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
                    className={`flex items-center justify-center md:justify-start p-3 rounded-lg transition-all duration-200 ${
                        activeView === 'profile'
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
                    }`}
                 >
                    <Settings className="h-7 w-7" />
                    <span className="hidden md:inline-block ml-4 font-medium">Profile Settings</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;