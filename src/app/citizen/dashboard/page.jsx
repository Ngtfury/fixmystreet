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
    }, [router]);

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

    const [feedbackText, setFeedbackText] = useState({});

    const submitFeedback = async (id, rating, reviewText = "") => {
        try {
            const res = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedbackRating: rating, feedbackReview: reviewText }),
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
                        <p className="text-gray-500 mb-6">You haven&apos;t reported any civic issues yet.</p>
                        <Link href="/citizen/report" className="btn-secondary">Create your first report</Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {complaints.map(complaint => (
                            <div key={complaint.id} className="glass-card p-6 flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all duration-300 group">
                                <div className="w-full md:w-56 grid grid-cols-2 gap-2 shrink-0">
                                    {complaint.mediaPaths && complaint.mediaPaths.map((media, idx) => (
                                        <div key={idx} className={`rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-white/10 ${idx === 0 && complaint.mediaPaths.length % 2 !== 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                                            {media.endsWith('.mp4') || media.endsWith('.webm') ? (
                                                <video src={media} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" controls />
                                            ) : (
                                                <img src={media} alt={`Issue ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            )}
                                        </div>
                                    ))}
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

                                    {/* Authority Proofs */}
                                    {(complaint.progressImagePath || complaint.resolvedImagePath) && (
                                        <div className="mt-4 p-4 border rounded-2xl bg-white/50 dark:bg-black/20 border-blue-100 dark:border-blue-900/30">
                                            <h4 className="text-sm font-semibold mb-3 text-blue-700 dark:text-blue-400">Authority Updates</h4>
                                            <div className="flex gap-4 overflow-x-auto pb-2">
                                                {complaint.progressImagePath && (
                                                    <div className="shrink-0 w-32 space-y-2 text-center">
                                                        <img src={complaint.progressImagePath} className="w-32 h-32 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" />
                                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Started Working</span>
                                                    </div>
                                                )}
                                                {complaint.resolvedImagePath && (
                                                    <div className="shrink-0 w-32 space-y-2 text-center">
                                                        <img src={complaint.resolvedImagePath} className="w-32 h-32 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" />
                                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Issue Resolved & Fixed!</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase pt-2">
                                            Reported {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>

                                        {complaint.status === 'Resolved' && (
                                            <div className="flex flex-col gap-3 bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 w-full sm:w-auto min-w-[300px]">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Rate resolution:</span>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                key={star}
                                                                onClick={() => submitFeedback(complaint.id, star, feedbackText[complaint.id] || complaint.feedbackReview)}
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
                                                {!complaint.feedbackReview ? (
                                                    <div className="flex gap-2">
                                                        <textarea
                                                            className="flex-1 text-sm p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/40 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                                                            rows="2"
                                                            placeholder="Add a review..."
                                                            value={feedbackText[complaint.id] || ''}
                                                            onChange={(e) => setFeedbackText({ ...feedbackText, [complaint.id]: e.target.value })}
                                                        />
                                                        <button
                                                            className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-xl text-xs font-bold transition-colors self-end"
                                                            onClick={() => submitFeedback(complaint.id, complaint.feedbackRating || 0, feedbackText[complaint.id])}
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 italic border-l-4 border-yellow-400">
                                                        &quot;{complaint.feedbackReview}&quot;
                                                    </div>
                                                )}
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
