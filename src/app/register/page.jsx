"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'citizen',
        localBodyType: '',
        authorityType: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'citizen') {
                router.push('/citizen/dashboard');
            } else {
                router.push('/authority/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[70vh] py-8">
            <div className="glass-card w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                    <p className="text-gray-500 dark:text-gray-400">Join to improve your community</p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="input-field"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Placeholder"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="input-field"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Account Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${formData.role === 'citizen' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="citizen"
                                    checked={formData.role === 'citizen'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                Citizen
                            </label>
                            <label className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${formData.role === 'authority' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="authority"
                                    checked={formData.role === 'authority'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                Authority
                            </label>
                        </div>
                    </div>

                    {/* Conditional Fields based on Role */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50 space-y-5 animate-in slide-in-from-top-2">
                        {formData.role === 'citizen' ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Local Body Type</label>
                                        <select name="localBodyType" className="input-field" onChange={handleChange} value={formData.localBodyType} required>
                                            <option value="" disabled>Select Type...</option>
                                            <option value="corporation">Municipal Corporation</option>
                                            <option value="municipality">Municipality</option>
                                            <option value="gram_panchayat">Gram Panchayat</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Name of Local Body</label>
                                        <input type="text" name="localBodyName" className="input-field" onChange={handleChange} value={formData.localBodyName || ''} placeholder="e.g. City Corporation" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Ward Number</label>
                                        <input type="text" name="wardNumber" className="input-field" onChange={handleChange} value={formData.wardNumber || ''} placeholder="e.g. 15" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Ward Member Name</label>
                                        <input type="text" name="wardMember" className="input-field" onChange={handleChange} value={formData.wardMember || ''} placeholder="Member Name" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Residential Address</label>
                                    <textarea name="address" className="input-field resize-none" rows="2" onChange={handleChange} value={formData.address || ''} placeholder="House No, Street, Landmark..." required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Mobile Number</label>
                                    <input type="tel" name="mobileNumber" className="input-field" onChange={handleChange} value={formData.mobileNumber || ''} placeholder="+91..." required />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Administered Local Body</label>
                                    <input type="text" name="municipality" className="input-field" onChange={handleChange} value={formData.municipality || ''} placeholder="e.g. Central District Municipality" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Authority Level / Role</label>
                                    <select name="authorityType" className="input-field" onChange={handleChange} value={formData.authorityType} required>
                                        <option value="" disabled>Select Role...</option>
                                        <option value="inspector">Ward Inspector</option>
                                        <option value="engineer">Municipal Engineer</option>
                                        <option value="commissioner">Commissioner</option>
                                        <option value="admin">System Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Official Mobile Number</label>
                                    <input type="tel" name="mobileNumber" className="input-field" onChange={handleChange} value={formData.mobileNumber || ''} placeholder="+91..." required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Staff / Employee ID</label>
                                    <input type="text" name="employeeId" className="input-field" onChange={handleChange} value={formData.employeeId || ''} placeholder="e.g. EMP-12345" required />
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 mt-4 disabled:opacity-70"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
                    Already have an account? <Link href="/login" className="text-purple-600 font-medium hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
