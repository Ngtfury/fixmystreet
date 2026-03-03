"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, CheckCircle, AlertTriangle, Clock, MapPin, Eye, Filter, Inbox, ChevronDown } from 'lucide-react';

export default function AuthorityDashboard() {
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [isFlushing, setIsFlushing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'authority') {
            router.push('/citizen/dashboard');
            return;
        }
        setUser(parsedUser);
        fetchAllComplaints();
    }, []);

    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredComplaints(complaints);
        } else {
            setFilteredComplaints(complaints.filter(c => c.status === activeFilter));
        }
    }, [complaints, activeFilter]);

    const fetchAllComplaints = async () => {
        try {
            const res = await fetch(`/api/complaints`);
            if (res.ok) {
                const data = await res.json();
                setComplaints(data.complaints);
            }
        } catch (error) {
            console.error("Failed to fetch complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        setUpdating(id);
        try {
            const res = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchAllComplaints();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdating(null);
        }
    };

    const handleFlushDatabase = async () => {
        const confirmed = window.confirm("🚨 CRITICAL WARNING 🚨\n\nAre you sure you want to completely wipe the database? This action will permanently delete ALL users, complaints, and uploaded images. It cannot be undone.\n\nType 'YES' to confirm.");

        if (confirmed) {
            setIsFlushing(true);
            try {
                const res = await fetch('/api/database', { method: 'DELETE' });
                if (res.ok) {
                    alert("Database successfully flushed. You will be redirected to the login page.");
                    localStorage.removeItem('user');
                    router.push('/login');
                } else {
                    alert("Failed to flush database.");
                }
            } catch (err) {
                console.error(err);
                alert("An error occurred during flush.");
            } finally {
                setIsFlushing(false);
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <AlertTriangle className="text-orange-500" size={20} />;
            case 'In Progress': return <Clock className="text-blue-500" size={20} />;
            case 'Resolved': return <CheckCircle className="text-green-500" size={20} />;
            default: return <Clock size={20} />;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]"><div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div></div>;
    }

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 p-6 sm:p-8 rounded-3xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <LayoutDashboard size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-300 dark:to-indigo-300">
                            Operations Control
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Municipal Authority Dashboard - {user?.name}</p>
                    </div>
                </div>

                <button
                    onClick={handleFlushDatabase}
                    disabled={isFlushing}
                    className="flexItems-center justify-center gap-2 px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                >
                    {isFlushing ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                            Flushing...
                        </span>
                    ) : '🚨 Flush Database'}
                </button>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-purple-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Issues</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-4xl font-black">{stats.total}</h2>
                        <Inbox className="text-purple-300 dark:text-purple-900/50" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-orange-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Pending</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-4xl font-black">{stats.pending}</h2>
                        <AlertTriangle className="text-orange-300 dark:text-orange-900/50" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-blue-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">In Progress</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-4xl font-black">{stats.inProgress}</h2>
                        <Clock className="text-blue-300 dark:text-blue-900/50" size={32} />
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-green-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Resolved</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-4xl font-black">{stats.resolved}</h2>
                        <CheckCircle className="text-green-300 dark:text-green-900/50" size={32} />
                    </div>
                </div>
            </div>

            {/* Filter & List Area */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-black/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Filter size={20} className="text-purple-500" />
                        Issue Management Feed
                    </h2>

                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden self-stretch sm:self-auto">
                        {['All', 'Pending', 'In Progress', 'Resolved'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeFilter === filter
                                    ? 'bg-white dark:bg-[#32253a] text-purple-700 dark:text-purple-300 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-0">
                    {filteredComplaints.length === 0 ? (
                        <div className="p-16 text-center text-gray-500 text-lg font-medium">
                            No issues match the current filter. All clear!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {filteredComplaints.map(complaint => (
                                <div key={complaint.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex flex-col lg:flex-row gap-6">

                                        {/* Image */}
                                        <div className="w-full lg:w-48 h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-800">
                                            <img src={complaint.imagePath} alt="Issue" className="w-full h-full object-cover" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-3">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-full">
                                                            {complaint.category}
                                                        </span>
                                                        <span className="text-sm text-gray-500 font-medium">
                                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold mb-1">{complaint.description}</h3>
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${complaint.location.replace(/\s+/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
                                                    >
                                                        <MapPin size={16} className="text-gray-400" /> {complaint.location}
                                                    </a>
                                                </div>

                                                {/* Status Label */}
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold shadow-sm shrink-0
                            ${complaint.status === 'Pending' ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800' :
                                                        complaint.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800' :
                                                            'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800'}
                          `}
                                                >
                                                    {getStatusIcon(complaint.status)}
                                                    {complaint.status}
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                {complaint.feedbackRating ? (
                                                    <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-500">
                                                        Citizen Rating: {complaint.feedbackRating}/5 Stars ★
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 font-medium italic">
                                                        {complaint.status === 'Resolved' ? 'Awaiting Citizen Rating' : 'Feedback not available yet'}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 bg-white dark:bg-black/30 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                                                    <span className="text-sm font-semibold pl-3 pr-2 text-gray-600 dark:text-gray-400">Update Action:</span>
                                                    <select
                                                        className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer pr-8 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                        value={complaint.status}
                                                        disabled={updating === complaint.id}
                                                        onChange={(e) => updateStatus(complaint.id, e.target.value)}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                    </select>
                                                    {updating === complaint.id && (
                                                        <div className="w-4 h-4 ml-2 mr-3 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
