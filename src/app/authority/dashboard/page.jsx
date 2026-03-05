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
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [proofImage, setProofImage] = useState(null);
    const [proofImagePreview, setProofImagePreview] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

    // For Authority Filtering by Ward/Municipality
    const [locationFilter, setLocationFilter] = useState('All');
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
    }, [router]);

    useEffect(() => {
        let filtered = complaints;

        if (activeFilter !== 'All') {
            filtered = filtered.filter(c => c.status === activeFilter);
        }

        if (locationFilter !== 'All') {
            filtered = filtered.filter(c => {
                // Determine the citizen details from matching the citizenId with users DB?
                // since we don't have users populated directly in complaints without a join,
                // we'll filter by the complaint's 'location' string containing the filter for now
                // Alternatively, we filter if user.municipality is in the text
                return c.location.toLowerCase().includes(locationFilter.toLowerCase());
            });
        }

        setFilteredComplaints(filtered);
    }, [complaints, activeFilter, locationFilter]);

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

    const openUpdateModal = (complaint) => {
        setSelectedComplaint(complaint);
        setNewStatus(complaint.status);
        setProofImage(null);
        setProofImagePreview(null);
        setUpdateModalOpen(true);
    };

    const handleProofImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB");
                return;
            }
            setProofImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitStatusUpdate = async () => {
        if (!selectedComplaint || !newStatus) return;

        if (newStatus !== 'Pending' && !proofImage && newStatus !== selectedComplaint.status) {
            alert('Please upload a proof image detailing the progress or resolution.');
            return;
        }

        setUpdating(selectedComplaint.id);
        setUpdateModalOpen(false);

        try {
            const formData = new FormData();
            formData.append('status', newStatus);
            if (proofImage) {
                formData.append('proofImage', proofImage);
            }

            const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
                method: 'PATCH',
                body: formData,
            });
            if (res.ok) {
                fetchAllComplaints();
            } else {
                alert("Failed to update status");
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

                    <div className="flex flex-col sm:flex-row gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden self-stretch sm:self-auto">
                        {/* Status Filters */}
                        <div className="flex bg-white/50 dark:bg-black/20 p-1 rounded-lg">
                            {['All', 'Pending', 'In Progress', 'Resolved'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${activeFilter === filter
                                        ? 'bg-white dark:bg-[#32253a] text-purple-700 dark:text-purple-300 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Location Mock Filter */}
                        {user?.municipality && (
                            <button
                                onClick={() => setLocationFilter(locationFilter === 'All' ? user.municipality : 'All')}
                                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center border
                                    ${locationFilter !== 'All'
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200'
                                        : 'bg-white/50 dark:bg-black/20 text-gray-600 border-transparent hover:bg-gray-200/50'}`}
                            >
                                <MapPin size={14} className="mr-1" />
                                {locationFilter !== 'All' ? `Filtered by ${user.municipality}` : `Filter by My District`}
                            </button>
                        )}
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

                                        {/* Image Gallery */}
                                        <div className="w-full lg:w-56 grid grid-cols-2 gap-2 h-32 lg:h-auto rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-800 relative">
                                            {complaint.mediaPaths && complaint.mediaPaths.length > 0 ? (
                                                complaint.mediaPaths.slice(0, 4).map((media, idx) => (
                                                    <div key={idx} className={`relative w-full h-full cursor-pointer hover:opacity-90 transition-opacity ${idx === 0 && complaint.mediaPaths.length % 2 !== 0 && complaint.mediaPaths.length < 4 ? 'col-span-2' : ''}`} onClick={() => setSelectedMedia({ url: media, type: media.endsWith('.mp4') || media.endsWith('.webm') ? 'video' : 'image' })}>
                                                        {media.endsWith('.mp4') || media.endsWith('.webm') ? (
                                                            <video src={media} className="w-full h-full object-cover pointer-events-none" muted />
                                                        ) : (
                                                            <img src={media} alt={`Issue ${idx}`} className="w-full h-full object-cover" />
                                                        )}
                                                        {idx === 3 && complaint.mediaPaths.length > 4 && (
                                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                                                                +{complaint.mediaPaths.length - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <img
                                                    src={complaint.imagePath}
                                                    alt="Issue"
                                                    className="w-full h-full object-cover col-span-2 cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => setSelectedMedia({ url: complaint.imagePath, type: 'image' })}
                                                />
                                            )}
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
                                            <div className="mt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <div className="flex-1">
                                                    {complaint.feedbackRating ? (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-500 w-fit">
                                                                Citizen Rating: {complaint.feedbackRating}/5 Stars ★
                                                            </div>
                                                            {complaint.feedbackReview && (
                                                                <div className="text-sm p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 italic border-l-4 border-yellow-400">
                                                                    &quot;{complaint.feedbackReview}&quot;
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-400 font-medium italic">
                                                            {complaint.status === 'Resolved' ? 'Awaiting Citizen Rating & Review' : 'Feedback not available yet'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 bg-white dark:bg-black/30 p-2 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-sm shrink-0">
                                                    <button
                                                        onClick={() => openUpdateModal(complaint)}
                                                        disabled={updating === complaint.id}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all flexItems-center gap-2 disabled:opacity-50"
                                                    >
                                                        {updating === complaint.id ? (
                                                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                                        ) : 'Update Status / Add Proof'}
                                                    </button>
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

            {/* Update Status Modal */}
            {updateModalOpen && selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1525] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
                            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Update Issue Status</h3>
                            <button onClick={() => setUpdateModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">New Status</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/40 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>

                            {newStatus !== 'Pending' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-semibold">Upload Proof of Action <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-gray-500">Provide photographic evidence of the team working or the finalized resolution.</p>

                                    <div className="relative border-2 border-dashed border-blue-300 dark:border-blue-700/50 rounded-2xl h-40 flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 transition-colors">
                                        {proofImagePreview ? (
                                            <img src={proofImagePreview} alt="Proof Preview" className="w-full h-full object-cover rounded-xl p-1" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <div className="text-blue-500 mb-2">📸</div>
                                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Click to upload photo</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProofImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setUpdateModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitStatusUpdate}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                                >
                                    Save Verification
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Overlay Modal */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setSelectedMedia(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <span className="text-2xl leading-none block w-6 h-6 flex items-center justify-center">&times;</span>
                    </button>

                    <div className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {selectedMedia.type === 'video' ? (
                            <video
                                src={selectedMedia.url}
                                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                                controls
                                autoPlay
                            />
                        ) : (
                            <img
                                src={selectedMedia.url}
                                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                                alt="Expanded view"
                            />
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
