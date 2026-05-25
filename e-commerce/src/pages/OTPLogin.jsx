import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Phone, Shield } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';
import client from '../api/client';

const OTPLogin = ({ handleLogin }) => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [phoneError, setPhoneError] = useState('');
    const recaptchaRef = useRef(null);
    const otpRefs = useRef([]);

    // redirect if already logged in
    useEffect(() => {
        if (localStorage.getItem('access_token')) navigate('/');
    }, []);

    // countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const setupRecaptcha = () => {
        if (!recaptchaRef.current) {
            recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {},
            });
        }
        return recaptchaRef.current;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();

        // validate phone
        const cleaned = phone.replace(/\s/g, '');
        if (!cleaned) {
            setPhoneError('Phone number is required');
            return;
        }
        if (!/^\d{10}$/.test(cleaned)) {
            setPhoneError('Enter a valid 10-digit phone number');
            return;
        }

        setPhoneError('');
        setLoading(true);

        try {
            const appVerifier = setupRecaptcha();
            const fullPhone = `+91${cleaned}`; // India code
            const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
            setConfirmationResult(result);
            setStep('otp');
            setCountdown(30);
            toast.success(`OTP sent to ${fullPhone}`);
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/too-many-requests') {
                toast.error('Too many attempts. Try again later.');
            } else {
                toast.error('Failed to send OTP. Try again.');
            }
            // reset recaptcha on error
            recaptchaRef.current = null;
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // only digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // only last digit
        setOtp(newOtp);

        // auto focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // go back on backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }

        setLoading(true);

        try {
            // verify with Firebase
            const result = await confirmationResult.confirm(otpString);
            const idToken = await result.user.getIdToken();

            // send to Django backend
            const response = await client.post('/auth/otp-login/', { idToken });
            const data = response.data;

            // store tokens
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
            // Notify NotificationContext to fetch & connect WS (storage event only fires in other tabs)
            window.dispatchEvent(new CustomEvent('auth:login', { detail: { token: data.access } }));

            if (data.is_new_user) {
                toast.success('Account created! Welcome 🎉');
            } else {
                toast.success('Login successful!');
            }

            setTimeout(() => navigate('/'), 1200);

        } catch (error) {
            if (error.code === 'auth/invalid-verification-code') {
                toast.error('Wrong OTP. Please try again.');
            } else if (error.code === 'auth/code-expired') {
                toast.error('OTP expired. Please resend.');
            } else {
                const msg = error.response?.data?.error || 'Verification failed';
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        recaptchaRef.current = null;
        setOtp(['', '', '', '', '', '']);
        await handleSendOTP({ preventDefault: () => {} });
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-zinc-100 p-4 relative">

            {/* invisible recaptcha container */}
            <div id="recaptcha-container"></div>

            <Link
                to="/"
                className="absolute top-4 left-4 flex items-center gap-2 text-[#B37869] hover:text-[#a06757] transition-colors"
            >
                <Home size={24} />
                <span className="font-medium">Back to Home</span>
            </Link>

            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border-t-4 border-[#B37869]">

                {step === 'phone' ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#F2E8E6] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone size={32} className="text-[#B37869]" />
                            </div>
                            <h2 className="text-3xl font-semibold text-[#B37869]">Login with OTP</h2>
                            <p className="text-gray-500 mt-2 text-sm">
                                We'll send a 6-digit OTP to your phone
                            </p>
                        </div>

                        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="flex">
                                    <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 flex items-center text-gray-600 font-medium">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        placeholder="10-digit number"
                                        value={phone}
                                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            if (phoneError) setPhoneError('');
                                        }}
                                        maxLength={10}
                                        className={`flex-1 p-3 border rounded-r-md outline-none transition focus:ring-1 ${
                                            phoneError
                                                ? 'border-red-400 focus:ring-red-300'
                                                : 'border-gray-300 focus:border-[#B37869] focus:ring-[#B37869]'
                                        }`}
                                    />
                                </div>
                                {phoneError && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{phoneError}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#F2E8E6] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield size={32} className="text-[#B37869]" />
                            </div>
                            <h2 className="text-3xl font-semibold text-[#B37869]">Enter OTP</h2>
                            <p className="text-gray-500 mt-2 text-sm">
                                Sent to <span className="font-medium">+91 {phone}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">

                            {/* 6-digit OTP boxes */}
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => otpRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg outline-none transition focus:border-[#B37869] focus:ring-2 focus:ring-[#F2E8E6]"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#B37869] text-white py-3 rounded-md hover:bg-[#a06757] transition font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            {/* resend */}
                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        Resend OTP in <span className="font-bold text-[#B37869]">{countdown}s</span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className="text-[#B37869] font-medium hover:underline text-sm"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('phone');
                                    setOtp(['', '', '', '', '', '']);
                                    recaptchaRef.current = null;
                                }}
                                className="text-gray-500 text-sm hover:text-gray-700 text-center"
                            >
                                ← Change phone number
                            </button>
                        </form>
                    </>
                )}

                <div className="mt-6 pt-4 border-t text-center space-y-2">
                    <Link to="/login" className="block text-[#B37869] font-medium hover:underline text-sm">
                        Login with Password instead
                    </Link>
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-[#B37869] font-medium hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPLogin;