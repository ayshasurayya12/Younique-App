import React, { useState } from "react";
import { Eye, EyeOff, UserPlus, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import client from '../api/client';

const SignUp = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        if (!fullName || !email || !username || !password || !confirmPass) {
            toast.error("All required fields must be filled!");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return false;
        }
        if (password !== confirmPass) {
            toast.error("Passwords do not match!");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const response = await client.post('/auth/register/', {
                username,
                email,
                password,
                password2: confirmPass,
                first_name: fullName,
                phone: phone || null,
            });

            const data = response.data;

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify({
                id: data.user.id,
                name: data.user.first_name || data.user.username,
                email: data.user.email,
                username: data.user.username,
                role: 'user',
                isBlocked: false,
            }));

            toast.success("Registration successful!");
            setTimeout(() => navigate("/"), 1500);

        } catch (error) {
            const errors = error.response?.data;
            if (errors) {
                const firstError = Object.values(errors)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                toast.error("Registration failed. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-zinc-100 p-4 relative">
            <ToastContainer position="top-right" autoClose={3000} />

            <Link
                to="/"
                className="absolute top-4 left-4 flex items-center gap-2 text-[#B37869] hover:text-[#a06757] transition-colors"
            >
                <Home size={24} />
                <span className="font-medium">Back to Home</span>
            </Link>

            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border-t-4 border-[#B37869] mt-8">
                <h2 className="text-3xl text-center font-semibold mb-6 text-[#B37869]">Create Account</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input type="text" placeholder="Full Name *" value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition" required />

                    <input type="email" placeholder="Email Address *" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition" required />

                    <input type="tel" placeholder="Phone Number (optional)" value={phone}
                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition" />

                    <input type="text" placeholder="Create Username *" value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition" required />

                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Create Password *" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-zinc-100 p-3 rounded-md border w-full focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition" required />
                        <span className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-[#B37869]"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </span>
                    </div>

                    <input type={showPassword ? "text" : "password"} placeholder="Confirm Password *" value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="bg-zinc-100 p-3 rounded-md border w-full focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition" required />

                    <button
                        className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        type="submit" disabled={loading}>
                        {loading ? "Registering..." : <><UserPlus size={20} /> Sign Up</>}
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#B37869] font-medium hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;