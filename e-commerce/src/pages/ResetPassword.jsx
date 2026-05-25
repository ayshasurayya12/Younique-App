import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ password: '', password2: '' });

    useEffect(() => {
        if (!token) {
            toast.error('Invalid reset link');
            navigate('/forgot-password');
        }
    }, [token]);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'password') {
            if (!value) error = 'Password is required';
            else if (value.length < 6) error = 'Must be at least 6 characters';
        }
        if (name === 'password2') {
            if (!value) error = 'Please confirm your password';
            else if (value !== password) error = 'Passwords do not match';
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const err1 = validateField('password', password);
        const err2 = validateField('password2', password2);
        if (err1 || err2) return;

        setLoading(true);
        try {
            await client.post('/auth/reset-password/', { token, password, password2 });
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const msg = err.response?.data?.error || 'Reset failed. The link may have expired.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full bg-zinc-100 p-3 rounded-md border outline-none transition focus:ring-1 ${
            errors[field]
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:border-[#B37869] focus:ring-[#B37869]'
        }`;

    return (
        <div className="min-h-screen flex justify-center items-center bg-zinc-100 p-4 relative">
            <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-[#B37869] hover:text-[#a06757]">
                <Home size={24} />
                <span className="font-medium">Back to Home</span>
            </Link>

            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border-t-4 border-[#B37869]">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#F2E8E6] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} className="text-[#B37869]" />
                    </div>
                    <h2 className="text-3xl font-semibold text-[#B37869]">Reset Password</h2>
                    <p className="text-gray-500 mt-2 text-sm">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    validateField('password', e.target.value);
                                    if (password2) validateField('password2', password2);
                                }}
                                className={inputClass('password')}
                            />
                            <span
                                className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-[#B37869]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                    </div>

                    <div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm New Password"
                            value={password2}
                            onChange={(e) => {
                                setPassword2(e.target.value);
                                validateField('password2', e.target.value);
                            }}
                            className={inputClass('password2')}
                        />
                        {errors.password2 && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password2}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;