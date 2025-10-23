
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const { login, requestToJoin, error, clearError } = useAppContext();
    const [isJoining, setIsJoining] = useState(false);
    
    // State for form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(email, password);
    };

    const handleJoinRequest = (e: React.FormEvent) => {
        e.preventDefault();
        requestToJoin(name, email, password);
        // Clear fields and show success message
        setName('');
        setEmail('');
        setPassword('');
        setIsJoining(false); // Switch back to login view after request
    };

    const toggleForm = () => {
        setIsJoining(!isJoining);
        // Clear all fields and errors when toggling form
        setName('');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        clearError();
    };
    
    const inputClasses = "w-full px-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";
    
    const passwordField = (id: string) => (
        <div className="relative">
            <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                id={id}
                required
                className={`${inputClasses} pr-10`}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen">
            <GlassCard className="w-full max-w-md mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-brand-dark">Sainath</h1>
                    <p className="text-gray-600 mt-2">{isJoining ? 'Request to Join' : 'Welcome Back'}</p>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

                {isJoining ? (
                    <form onSubmit={handleJoinRequest} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">Full Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} type="text" id="name" required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="email-join">Email</label>
                            <input value={email} onChange={e => setEmail(e.target.value)} type="email" id="email-join" required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="password-join">Password</label>
                            {passwordField("password-join")}
                        </div>
                        <Button type="submit" className="w-full">Send Join Request</Button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="email-login">Email</label>
                            <input value={email} onChange={e => setEmail(e.target.value)} type="email" id="email-login" required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="password-login">Password</label>
                            {passwordField("password-login")}
                        </div>
                        <div className="flex justify-end">
                            <a href="#" className="text-sm text-indigo-600 hover:underline">Forgot Password?</a>
                        </div>
                        <Button type="submit" className="w-full">Log In</Button>
                    </form>
                )}

                <div className="text-center mt-6">
                    <button onClick={toggleForm} className="text-indigo-600 hover:underline">
                        {isJoining ? 'Already have an account? Log In' : 'New member? Request to join'}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default Login;