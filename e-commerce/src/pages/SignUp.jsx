import React, { useState } from "react";
import { Eye, EyeOff, UserPlus, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const checkExistingUser = async () => {
    try {
      const response = await fetch('http://localhost:3000/users');
      if (!response.ok) throw new Error('Failed to fetch users');

      const users = await response.json();

      return users.find(
        (u) => u.username === username || u.email === email
      );
    } catch (error) {
      console.error('Error checking existing user:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const existingUser = await checkExistingUser();
    if (existingUser) {
      if (existingUser.username === username) {
        toast.error("Username already exists.");
      } else {
        toast.error("Email already registered.");
      }
      setLoading(false);
      return;
    }

    const newUserData = {
      fullName,
      email,
      phone: phone || null,
      username,
      password,
      role: "user",
      createdAt: new Date().toISOString(),
      cart: [],
      orders: [],
      savedAddresses: []
    };

    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserData),
      });

      if (response.ok) {
        const createdUser = await response.json();

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: createdUser.id,
            name: createdUser.fullName,
            email: createdUser.email,
            username: createdUser.username,
            role: createdUser.role,
            isBlocked: false
          })
        );

        toast.success("Registration successful!");

        setTimeout(() => navigate("/"), 1500);
      } else {
        toast.error("Registration failed. Try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Server error. Try again later.");
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
        <h2 className="text-3xl text-center font-semibold mb-6 text-[#B37869]">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition"
            required
          />

          <input
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition"
            required
          />

          <input
            type="tel"
            placeholder="Phone Number (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition"
          />

          <input
            type="text"
            placeholder="Create Username *"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-zinc-100 p-3 rounded-md border focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password *"
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

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password *"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="bg-zinc-100 p-3 rounded-md border w-full focus:border-[#B37869] focus:ring-1 focus:ring-[#B37869] outline-none transition"
            required
          />

          <button
            className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : <UserPlus size={20} />}
            {loading ? "" : "Sign Up"}
          </button>

        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#B37869] font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
