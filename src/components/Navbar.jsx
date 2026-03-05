"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Basic client-side auth check
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            // eslint-disable-next-line
            setUser(JSON.parse(storedUser));
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        return user.role === 'citizen' ? '/citizen/dashboard' : '/authority/dashboard';
    };

    return (
        <nav className="glass sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                            <MapPin size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400">
                            FixMyStreet
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium hover:text-purple-600 transition-colors">Home</Link>

                        {user ? (
                            <>
                                <Link href={getDashboardLink()} className="text-sm font-medium hover:text-purple-600 transition-colors">Dashboard</Link>
                                <div className="flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-gray-800">
                                    <span className="text-sm opacity-70 flex items-center gap-2">
                                        <User size={16} />
                                        {user.name}
                                    </span>
                                    <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-600">
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-medium hover:text-purple-600 transition-colors">Citizen Portal</Link>
                                <Link href="/authority-login" className="text-sm font-medium hover:text-blue-600 transition-colors">Authority Portal</Link>
                                <Link href="/register" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 dark:text-gray-300"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass absolute top-16 left-0 w-full border-b border-white/20 shadow-xl pb-4 px-4 flex flex-col gap-4 pt-4">
                    <Link href="/" className="font-medium p-2" onClick={() => setIsOpen(false)}>Home</Link>
                    {user ? (
                        <>
                            <Link href={getDashboardLink()} className="font-medium p-2" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <button onClick={handleLogout} className="text-left font-medium p-2 text-red-500">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="font-medium p-2" onClick={() => setIsOpen(false)}>Log In</Link>
                            <Link href="/register" className="btn-primary inline-block text-center mt-2" onClick={() => setIsOpen(false)}>Sign Up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
