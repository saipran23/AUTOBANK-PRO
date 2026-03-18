import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const EmployeeLogin = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, role, loading: authLoading } = useAuth();

    // ⭐ FIXED: Empty email and password fields - no hardcoded data
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Auto-redirect if already authenticated as employee
    useEffect(() => {
        if (!authLoading && isAuthenticated && role === "employee") {
            console.log('✅ User is authenticated as employee, redirecting to dashboard');
            navigate("/employee/dashboard", { replace: true });
        }
    }, [isAuthenticated, role, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // ⭐ Validate inputs
            if (!email.trim()) {
                setError("Please enter your email address.");
                setLoading(false);
                return;
            }

            if (!password) {
                setError("Please enter your password.");
                setLoading(false);
                return;
            }

            console.log('🔐 Attempting login for:', email);
            await login(email.trim(), password);
            console.log('✅ Login successful, waiting for auth state update');
            // Don't navigate here - let useEffect above handle it
            // The onAuthStateChanged will trigger the redirect automatically
        } catch (err) {
            console.error('❌ Login error:', err);
            setError(`Login failed: ${err?.message || "Invalid email or password."}`);
            setLoading(false);
        }
    };

    const handleNavigateSignup = () => {
        console.log('🔗 Navigating to employee signup');
        navigate("/employee/signup");
    };

    const handleNavigateHome = () => {
        console.log('🏠 Navigating to home');
        navigate("/");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFEF0]">
            {/* Left badge/info column */}
            <div className="hidden lg:flex flex-col justify-between min-h-screen w-1/2 px-16 py-14 relative">
                <div>
                    <div className="mb-8">
                        <span className="inline-block p-3 bg-[#FFD60A] border-2 border-black shadow-[4px_4px_0px_#000] text-4xl">
                            🏦
                        </span>
                        <div className="mt-6">
                            <h1 className="text-[2.5rem] font-black text-black">AutoBank Pro</h1>
                            <p className="text-xl font-bold text-gray-700 mt-2">Employee Portal</p>
                        </div>
                    </div>
                    <ul className="mt-14 space-y-6 text-base font-bold text-black">
                        <li className="flex items-center">
                            <span className="text-green-500 text-xl mr-2">✔</span>24/7 Secure Access
                        </li>
                        <li className="flex items-center">
                            <span className="text-green-500 text-xl mr-2">✔</span>Real-time Loan Review
                        </li>
                        <li className="flex items-center">
                            <span className="text-green-500 text-xl mr-2">✔</span>Multi-layer Fraud Protection
                        </li>
                        <li className="flex items-center">
                            <span className="text-green-500 text-xl mr-2">✔</span>Session Timeout & Recovery
                        </li>
                        <li className="flex items-center">
                            <span className="text-green-500 text-xl mr-2">✔</span>SOC-2 & PCI DSS Certified
                        </li>
                        <li className="flex items-center">
                            <span className="text-green-500 text-xl mr-2">✔</span>FDIC Insured Funds
                        </li>
                    </ul>
                </div>
                <div className="mb-2 opacity-90">
                    <h3 className="font-bold text-black mb-3">Security Trust Badges</h3>
                    <div className="flex gap-4">
                        <span className="px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 text-black font-bold">
                            <span role="img" aria-label="security">🔒</span> SSL / TLS
                        </span>
                        <span className="px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 text-black font-bold">
                            <span role="img" aria-label="protection">🛡️</span> Multi-factor
                        </span>
                        <span className="px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 text-black font-bold">
                            <span role="img" aria-label="insurance">🏦</span> FDIC Insured
                        </span>
                        <span className="px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 text-black font-bold">
                            <span role="img" aria-label="compliance">⚙️</span> PCI / SOC-2
                        </span>
                    </div>
                    <footer className="text-xs text-gray-500 mt-8">
                        © {new Date().getFullYear()} AutoBank Pro. All rights reserved.
                    </footer>
                </div>
            </div>

            {/* Login Card */}
            <main className="w-full max-w-2xl px-8">
                <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] px-16 py-14 mt-8 mb-8 animate-fadein">
                    <div className="w-full flex flex-col items-center mb-8">
                        <span className="text-7xl mb-6 bg-[#FFD60A] border-2 border-black shadow-[4px_4px_0px_#000] p-6">
                            🔐
                        </span>
                        <h2 className="text-3xl font-black text-black mb-2">Employee Login</h2>
                        <p className="text-gray-700 text-lg font-medium">Bank-grade access to secure tools</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
                        {/* Email Field */}
                        <div>
                            <label className="block text-lg font-bold text-black mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="employee@autobank.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 border-2 border-black text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:shadow-[3px_3px_0px_#FFD60A] transition font-medium text-lg"
                                autoComplete="username"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-lg font-bold text-black mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Your secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 border-2 border-black text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:shadow-[3px_3px_0px_#FFD60A] transition font-medium text-lg"
                                autoComplete="current-password"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-base pt-1">
                            <label className="flex items-center text-gray-700 font-medium cursor-not-allowed">
                                <input
                                    type="checkbox"
                                    className="mr-2 accent-blue-500"
                                    disabled
                                />
                                Keep me signed in
                            </label>
                            <button
                                type="button"
                                className="text-gray-500 font-semibold cursor-not-allowed"
                                tabIndex={-1}
                                disabled
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] text-black font-bold p-4 text-center text-lg">
                                {error}
                            </div>
                        )}

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className={`w-full bg-[#FFD60A] text-black border-2 border-black font-black text-2xl shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all py-4 flex items-center justify-center ${
                                loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                            }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block animate-spin h-6 w-6 border-2 border-gray-200 border-b-black rounded-full mr-3"></span>
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center text-base text-black font-medium">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={handleNavigateSignup}
                            className="text-black font-bold hover:underline cursor-pointer transition-colors"
                            disabled={loading}
                        >
                            Register here
                        </button>
                    </div>

                    {/* Back to Home Link */}
                    <div className="text-center mt-4 text-base">
                        <button
                            type="button"
                            onClick={handleNavigateHome}
                            className="text-black font-bold hover:underline cursor-pointer transition-colors"
                            disabled={loading}
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </main>

            <style>
                {`
                    .animate-fadein {
                        animation: fadein 1s cubic-bezier(.39,.575,.56,1) 1 both;
                    }
                    @keyframes fadein {
                        0% { 
                            opacity: 0; 
                            transform: translateY(64px);
                        }
                        100% { 
                            opacity: 1; 
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default EmployeeLogin;
