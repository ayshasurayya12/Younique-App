import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [message, setMessage] = useState('');

    const hasRun = React.useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const verify = async () => {
            try {
                const res = await client.get(`auth/verify-email/${token}/`);
                setStatus('success');
                setMessage(res.data.message);
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100">
            <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md w-full border-t-4 border-[#B37869]">
                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B37869] mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Verifying your email...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-500 text-6xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-400 mt-3">Redirecting to login...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-500 text-6xl mb-4">✗</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                        <p className="text-gray-600">{message}</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="mt-4 px-6 py-2 bg-[#B37869] text-white rounded-lg hover:bg-[#a06757]">
                            Back to Sign Up
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;