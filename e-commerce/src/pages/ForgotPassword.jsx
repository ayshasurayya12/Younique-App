import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Enter a valid email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await client.post('/auth/forgot-password/', { email });
            setSent(true);
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-zinc-100 p-4 relative">
            <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-[#B37869] hover:text-[#a06757]">
                <Home size={24} />
                <span className="font-medium">Back to Home</span>
            </Link>

            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border-t-4 border-[#B37869]">

                {!sent ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#F2E8E6] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail size={32} className="text-[#B37869]" />
                            </div>
                            <h2 className="text-3xl font-semibold text-[#B37869]">Forgot Password</h2>
                            <p className="text-gray-500 mt-2 text-sm">
                                Enter your email and we'll send you a reset link
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError('');
                                    }}
                                    className={`w-full bg-zinc-100 p-3 rounded-md border outline-none transition focus:ring-1 ${
                                        error
                                            ? 'border-red-400 focus:ring-red-300'
                                            : 'border-gray-300 focus:border-[#B37869] focus:ring-[#B37869]'
                                    }`}
                                />
                                {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Check your inbox</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            If <span className="font-medium text-gray-700">{email}</span> is registered,
                            you'll receive a password reset link shortly.
                        </p>
                        <p className="text-xs text-gray-400 mb-6">
                            Didn't receive it? Check your spam folder or try again.
                        </p>
                        <button
                            onClick={() => { setSent(false); setEmail(''); }}
                            className="text-[#B37869] font-medium hover:underline text-sm"
                        >
                            Try a different email
                        </button>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t text-center">
                    <Link to="/login" className="flex items-center justify-center gap-2 text-[#B37869] font-medium hover:underline text-sm">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;