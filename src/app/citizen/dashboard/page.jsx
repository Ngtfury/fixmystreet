"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, AlertTriangle, Star, MapPin } from 'lucide-react';

export default function CitizenDashboard() {
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'citizen') {
            router.push('/authority/dashboard');
            return;
        }
        setUser(parsedUser);
        fetchComplaints(parsedUser.id);
    }, []);

    const fetchComplaints = async (citizenId) => {
        try {
            const res = await fetch(`/api/complaints?citizenId=${citizenId}`);
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

    const submitFeedback = async (id, rating) => {
        try {
            const res = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedbackRating: rating }),
            });
            if (res.ok) {
                fetchComplaints(user.id);
            }
        } catch (error) {
            console.error("Failed to submit feedback:", error);
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-100 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/10 p-6 rounded-3xl border border-purple-200/50 dark:border-purple-800/30">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-fuchsia-700 dark:from-purple-300 dark:to-fuchsia-300">
                        Citizen Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
                </div>
                <Link href="/citizen/report" className="btn-primary flex items-center gap-2 px-6 py-3">
                    <Plus size={20} />
                    Report New Issue
                </Link>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Reports</h2>

                {complaints.length === 0 ? (
                    <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Plus size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                        <p className="text-gray-500 mb-6">You haven't reported any civic issues yet.</p>
                        <Link href="/citizen/report" className="btn-secondary">Create your first report</Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {complaints.map(complaint => (
                            <div key={complaint.id} className="glass-card p-6 flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all duration-300 group">
                                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-white/10">
                                    <img src={complaint.imagePath} alt="Issue" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full mb-3">
                                                    {complaint.category}
                                                </span>
                                                <h3 className="text-lg font-medium">{complaint.description}</h3>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${complaint.location.replace(/\s+/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-700 dark:hover:text-purple-300 w-fit px-2.5 py-1 rounded-md transition-colors"
                                                >
                                                    <MapPin size={14} className="text-purple-500" /> {complaint.location}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-black/30 text-sm font-medium border border-gray-100 dark:border-gray-800 shadow-sm shrink-0">
                                                {getStatusIcon(complaint.status)}
                                                {complaint.status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                                            Reported {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>

                                        {complaint.status === 'Resolved' && (
                                            <div className="flex items-center gap-3 bg-white dark:bg-black/20 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Rate resolution:</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            onClick={() => submitFeedback(complaint.id, star)}
                                                            className={`p-1 transition-all hover:scale-125 active:scale-95 ${(complaint.feedbackRating >= star)
                                                                ? 'text-yellow-400 drop-shadow-md'
                                                                : 'text-gray-200 dark:text-gray-700 hover:text-yellow-200'
                                                                }`}
                                                        >
                                                            <Star size={20} fill={complaint.feedbackRating >= star ? "currentColor" : "none"} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
