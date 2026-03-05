"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Upload, X, AlertCircle, Camera } from 'lucide-react';
import Link from 'next/link';

export default function ReportIssue() {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        location: ''
    });
    const [mediaItems, setMediaItems] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [error, setError] = useState('');
    const [authChecking, setAuthChecking] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
        } else {
            setAuthChecking(false);
        }
    }, [router]);

    const categories = [
        "Roads & Potholes",
        "Waste & Garbage",
        "Water Supply & Leakage",
        "Streetlights & Power",
        "Public Infrastructure",
        "Other"
    ];

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            let validFiles = [];
            let validPreviews = [];

            for (const file of files) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit for combinations of videos/images
                    setError("Each file should be less than 10MB");
                    continue;
                }
                validFiles.push(file);

                // Create preview
                if (file.type.startsWith('image/')) {
                    validPreviews.push({ type: 'image', url: URL.createObjectURL(file) });
                } else if (file.type.startsWith('video/')) {
                    validPreviews.push({ type: 'video', url: URL.createObjectURL(file) });
                }
            }

            setMediaItems(prev => [...prev, ...validFiles]);
            setMediaPreviews(prev => [...prev, ...validPreviews]);
        }
    };

    const removeMedia = (index) => {
        const newItems = [...mediaItems];
        newItems.splice(index, 1);
        setMediaItems(newItems);

        const newPreviews = [...mediaPreviews];
        // Release object URL to avoid memory leaks
        URL.revokeObjectURL(newPreviews[index].url);
        newPreviews.splice(index, 1);
        setMediaPreviews(newPreviews);

        if (newItems.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        if (window.isSecureContext === false) {
            setError("Geolocation requires a secure connection (HTTPS) or localhost. Please type the location manually.");
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData({ ...formData, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
                setGeoLoading(false);
            },
            (error) => {
                console.error(error);
                setError("Unable to retrieve your location. Please ensure location permissions are granted.");
                setGeoLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mediaItems.length === 0) {
            setError("Please upload at least one image or video of the issue");
            return;
        }

        if (!formData.location) {
            setError("Please provide the location using the GPS button");
            return;
        }

        setLoading(true);

        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                router.push('/login');
                return;
            }

            const user = JSON.parse(storedUser);

            const submitData = new FormData();
            submitData.append('citizenId', user.id);
            submitData.append('category', formData.category);
            submitData.append('description', formData.description);
            submitData.append('location', formData.location);

            mediaItems.forEach(item => {
                submitData.append('media', item);
            });

            const res = await fetch('/api/complaints', {
                method: 'POST',
                body: submitData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit report');
            }

            router.push('/citizen/dashboard');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (authChecking) {
        return <div className="flex justify-center items-center min-h-[50vh]"><div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="mb-8 pl-2">
                <Link href="/citizen/dashboard" className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors inline-block mb-4">
                    ← Back to Dashboard
                </Link>
                <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-fuchsia-700 dark:from-purple-300 dark:to-fuchsia-300">
                    Report an Issue
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Help us keep your neighborhood safe and clean by providing accurate details.</p>
            </div>

            <div className="glass-card p-6 md:p-10">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 border border-red-200 dark:border-red-800/50 shadow-sm animate-in zoom-in-95">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        <div className="md:col-span-3 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2 ml-1 text-gray-800 dark:text-gray-200">Category</label>
                                <select
                                    required
                                    className="input-field appearance-none cursor-pointer"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="" disabled>Select an issue category...</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 ml-1 text-gray-800 dark:text-gray-200">Issue Location</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Click button or type location..."
                                        className="input-field flex-1"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={getLocation}
                                        disabled={geoLoading}
                                        className="btn-secondary px-5 py-3 rounded-2xl shrink-0 flex items-center justify-center gap-2 hover:bg-purple-200 shadow-sm active:scale-95 transition-all"
                                        title="Get Current Location"
                                    >
                                        {geoLoading ? (
                                            <div className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                                        ) : (
                                            <><MapPin size={20} /> <span className="hidden sm:inline">Get GPS Map</span></>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 ml-2">Pinpoint accuracy helps authorities find the exact spot faster.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 ml-1 text-gray-800 dark:text-gray-200">Description</label>
                                <textarea
                                    required
                                    rows="5"
                                    className="input-field resize-none"
                                    placeholder="Provide specific details about the issue..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-2 ml-1 text-gray-800 dark:text-gray-200">
                                Evidentiary Media (Photos/Videos)
                            </label>
                            <div className="flex flex-col gap-4">
                                {/* Upload Button Area */}
                                <div
                                    className={`relative border-2 border-dashed rounded-3xl min-h-[160px] flex flex-col items-center justify-center transition-all duration-300 border-gray-300 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 hover:shadow-inner`}
                                >
                                    <div className="text-center p-6 pointer-events-none space-y-3">
                                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto text-purple-500 shadow-inner">
                                            <Camera size={32} />
                                        </div>
                                        <div>
                                            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Click to upload files</p>
                                            <p className="text-xs text-gray-500 mt-1">Images & Videos up to 10MB each</p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        ref={fileInputRef}
                                        onChange={handleMediaChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>

                                {/* Preview Gallery */}
                                {mediaPreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {mediaPreviews.map((preview, idx) => (
                                            <div key={idx} className="relative aspect-square group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                                                {preview.type === 'image' ? (
                                                    <img src={preview.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <video src={preview.url} className="w-full h-full object-cover" muted playsInline />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedia(idx)}
                                                    className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-md p-1.5 rounded-full text-red-500 hover:text-red-600 hover:bg-white transition-all shadow-md opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                                    title="Remove media"
                                                >
                                                    <X size={16} />
                                                </button>
                                                {preview.type === 'video' && (
                                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                        Video
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 mt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary py-4 px-10 text-lg disabled:opacity-70 flex items-center justify-center min-w-[220px]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                    Submitting Report...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Upload size={22} />
                                    Submit Report
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
