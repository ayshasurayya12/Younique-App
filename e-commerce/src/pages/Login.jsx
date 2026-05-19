import React, { useState, useEffect } from "react";
import { Eye, EyeOff, LogIn, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import client from '../api/client';

const Login = ({ handleLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        if (token && user) navigate('/');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = { username: '', password: '' };
        if (!username) newErrors.username = 'Username or email is required';
        if (!password) newErrors.password = 'Password is required';

        if (newErrors.username || newErrors.password) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({ username: '', password: '' });

        try {
            const response = await client.post('auth/login/', { username, password });
            const data = response.data;

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify({
                id: data.user.id,
                name: data.user.first_name || data.user.username,
                email: data.user.email,
                username: data.user.username,
                role: data.user.is_staff ? 'admin' : 'user',
                isBlocked: data.user.is_blocked,
            }));

            if (handleLogin) handleLogin(data.user);
            toast.success('Login successful!');

            setTimeout(() => {
                data.user.is_staff ? navigate('/admin') : navigate('/');
            }, 1200);

        } catch (error) {
            const msg = error.response?.data?.error || 'Login failed. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `bg-zinc-100 p-3 rounded-md border w-full outline-none transition focus:ring-1 ${
            errors[field]
                ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:border-[#B37869] focus:ring-[#B37869]'
        }`;

    return (
        <div className="min-h-screen flex justify-center items-center bg-zinc-100 p-4 relative">
            <Link
                to="/"
                className="absolute top-4 left-4 flex items-center gap-2 text-[#B37869] hover:text-[#a06757] transition-colors"
            >
                <Home size={24} />
                <span className="font-medium">Back to Home</span>
            </Link>

            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border-t-4 border-[#B37869] mt-8">
                <h2 className="text-3xl text-center font-semibold mb-6 text-[#B37869]">Welcome Back</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Username or Email"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                            }}
                            className={inputClass('username')}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
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
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
                        )}
                    </div>

                    <button
                        className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : <LogIn size={20} />}
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                    <div className="text-center">
    <span className="text-gray-500 text-sm">or </span>
    <Link to="/otp-login" className="text-[#B37869] text-sm font-medium hover:underline">
        Login with OTP
    </Link>
</div>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-[#B37869] font-medium hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;