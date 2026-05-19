import React, { useState } from "react";
import { Eye, EyeOff, UserPlus, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
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

    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
        confirmPass: "",
        phone: "",
    });

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "fullName":
                if (!value.trim()) error = "Full name is required";
                else if (value.trim().length < 2) error = "Name must be at least 2 characters";
                break;
            case "email":
                if (!value.trim()) error = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    error = "Enter a valid email address";
                break;
            case "username":
                if (!value.trim()) error = "Username is required";
                else if (value.trim().length < 3) error = "Username must be at least 3 characters";
                else if (/\s/.test(value)) error = "Username cannot contain spaces";
                break;
            case "password":
                if (!value) error = "Password is required";
                else if (value.length < 6) error = "Password must be at least 6 characters";
                break;
            case "confirmPass":
                if (!value) error = "Please confirm your password";
                else if (value !== password) error = "Passwords do not match";
                break;
            case "phone":
                if (value && !/^\d{10}$/.test(value))
                    error = "Phone must be 10 digits";
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleChange = (name, value) => {
        switch (name) {
            case "fullName": setFullName(value); break;
            case "email": setEmail(value); break;
            case "username": setUsername(value); break;
            case "password": setPassword(value); break;
            case "confirmPass": setConfirmPass(value); break;
            case "phone": setPhone(value); break;
        }
        validateField(name, value);

        if (name === "password" && confirmPass) {
            setErrors(prev => ({
                ...prev,
                confirmPass: value !== confirmPass ? "Passwords do not match" : ""
            }));
        }
    };

    const validateAll = () => {
        const fields = { fullName, email, username, password, confirmPass, phone };
        let hasError = false;
        Object.entries(fields).forEach(([name, value]) => {
            const error = validateField(name, value);
            if (error) hasError = true;
        });
        return !hasError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;
        setLoading(true);

        try {
            const response = await client.post('auth/register/', {
                username,
                email,
                password,
                password2: confirmPass,
                first_name: fullName,
                phone: phone || null,
            });

            toast.success(response.data.message || 'Please check your email to verify your account.');
            setTimeout(() => navigate("/login"), 2500);

        } catch (error) {
            const backendErrors = error.response?.data;
            if (backendErrors && typeof backendErrors === 'object') {
                const newErrors = { ...errors };
                const fieldMap = {
                    username: 'username',
                    email: 'email',
                    password: 'password',
                    first_name: 'fullName',
                    phone: 'phone',
                };
                Object.entries(backendErrors).forEach(([key, value]) => {
                    const msg = Array.isArray(value) ? value[0] : value;
                    if (key === 'non_field_errors') {
                        toast.error(msg);
                    } else if (fieldMap[key]) {
                        newErrors[fieldMap[key]] = msg;
                    } else {
                        toast.error(msg);
                    }
                });
                setErrors(newErrors);
            } else {
                toast.error("Registration failed. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const FieldError = ({ name }) =>
        errors[name] ? (
            <p className="text-red-500 text-xs mt-1 ml-1">{errors[name]}</p>
        ) : null;

    const inputClass = (name) =>
        `bg-zinc-100 p-3 rounded-md border w-full outline-none transition focus:ring-1 ${
            errors[name]
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:border-[#B37869] focus:ring-[#B37869]"
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
                <h2 className="text-3xl text-center font-semibold mb-6 text-[#B37869]">
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    <div>
                        <input
                            type="text"
                            placeholder="Full Name *"
                            value={fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                            className={inputClass("fullName")}
                        />
                        <FieldError name="fullName" />
                    </div>

                    <div>
                        <input
                            type="email"
                            placeholder="Email Address *"
                            value={email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={inputClass("email")}
                        />
                        <FieldError name="email" />
                    </div>

                    <div>
                        <input
                            type="tel"
                            placeholder="Phone Number (optional)"
                            value={phone}
                            onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className={inputClass("phone")}
                        />
                        <FieldError name="phone" />
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Create Username *"
                            value={username}
                            onChange={(e) => handleChange("username", e.target.value)}
                            className={inputClass("username")}
                        />
                        <FieldError name="username" />
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create Password *"
                                value={password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className={inputClass("password")}
                            />
                            <span
                                className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-[#B37869]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </span>
                        </div>
                        <FieldError name="password" />
                    </div>

                    <div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password *"
                            value={confirmPass}
                            onChange={(e) => handleChange("confirmPass", e.target.value)}
                            className={inputClass("confirmPass")}
                        />
                        <FieldError name="confirmPass" />
                    </div>

                    <button
                        className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : <><UserPlus size={20} /> Sign Up</>}
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#B37869] font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;