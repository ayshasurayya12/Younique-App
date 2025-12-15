import React, { useState } from "react";
import { Eye, EyeOff, LogIn, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ handleLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!username || !password) {
            toast.error('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users');
            if (!response.ok) throw new Error('Failed to fetch user data');

            const users = await response.json();

            const user = users.find(u => 
                (u.username === username.trim() || u.email === username.trim()) &&
                u.password === password
            );

            if (!user) {
                toast.error('Invalid username/email or password');
                setLoading(false);
                return;
            }

            if (user.isBlocked) {
                toast.error("Your account has been blocked! Contact support.");
                setLoading(false);
                return;
            }

            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                name: user.fullName,
                email: user.email,
                username: user.username,
                role: user.role,
                isBlocked: user.isBlocked
            }));

            if (handleLogin) handleLogin(user);

            toast.success('Login successful!');
            
            setTimeout(() => {
                user.role === "admin" ? navigate('/admin') : navigate('/');
            }, 1200);

        } catch (error) {
            console.error('Login error:', error);
            toast.error('Failed to connect to server. Please try again.');
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
          <h2 className="text-3xl text-center font-semibold mb-6 text-[#B37869]">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition"
              required
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-100 p-3 rounded-md border w-full focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition"
                required
              />
              <span
                className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-[#B37869]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </span>
            </div>
            
            <button 
              className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <LogIn size={20} />
              )}
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center mt-4 text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#B37869] font-medium hover:underline focus:outline-none">
                Sign Up
            </Link>
          </p>
        </div>
      </div>
    );
};

export default Login;
