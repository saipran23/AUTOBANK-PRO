import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [rememberMe, setRememberMe] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name] || errors.general) setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setErrors({ general: "Please enter both email and password." });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await login(formData.email.trim(), formData.password.trim());
            navigate("/customer-dashboard");
        } catch (error) {
            console.error("Firebase login error:", error.code, error.message);

            const newFailedAttempts = failedAttempts + 1;
            setFailedAttempts(newFailedAttempts);

            if (
                error.code === "auth/user-not-found" ||
                error.code === "auth/wrong-password"
            ) {
                setErrors({
                    general: `Incorrect email or password. (${newFailedAttempts}/5 attempts)`
                });
            } else if (error.code === "auth/invalid-email") {
                setErrors({ general: "Invalid email format." });
            } else if (error.code === "auth/too-many-requests") {
                setErrors({ general: "Too many login attempts. Please try again later." });
            } else {
                setErrors({ general: "Login failed. Please try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Error Alert */}
            {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-700 text-sm font-medium">{errors.general}</p>
                    </div>
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                    />
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
                        Remember me
                    </label>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-95"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                        </span>
                    ) : (
                        "Login"
                    )}
                </button>

                {/* Biometric Option */}
                <button
                    type="button"
                    onClick={() => window.location.href = "#biometric"}
                    disabled={isLoading}
                    className="w-full py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 transition"
                >
                    🔐 Biometric Login
                </button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 font-medium">or</span>
                </div>
            </div>

            {/* Secondary Links */}
            <div className="space-y-3 text-center">
                <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="block w-full text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
                >
                    Forgot Password?
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="block w-full text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
                >
                    Don't have an account? Sign Up
                </button>
                {/* ✅ FIXED: Using /employee/login path */}
                <button
                    type="button"
                    onClick={() => navigate("/employee/login")}
                    className="block w-full text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
                >
                    👨‍💼 Employee Login
                </button>
            </div>

            {/* Failed Attempts Warning */}
            {failedAttempts >= 3 && failedAttempts < 5 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-yellow-700 text-sm font-medium">
                            ⚠️ {5 - failedAttempts} login attempts remaining
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginForm;
