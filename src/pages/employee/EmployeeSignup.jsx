import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Icon from "../../components/AppIcon";
import { useNavigate } from "react-router-dom";

const EmployeeSignup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        branch: "",
        role: "Loan Officer",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (
            !form.name.trim() ||
            !form.username.trim() ||
            !form.branch.trim() ||
            !form.email.match(/.+@.+\..+/) ||
            !form.password.trim()
        ) {
            setError("Please fill all required fields, and use a valid email.");
            return;
        }
        setLoading(true);
        try {
            // Step 1: Create user in Firebase Auth
            const userCred = await createUserWithEmailAndPassword(
                auth,
                form.email.trim(),
                form.password.trim()
            );

            // Step 2: Save the employee to Firestore
            await addDoc(collection(db, "employees"), {
                ...form,
                created: new Date().toISOString(),
                uid: userCred.user.uid
            });
            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => {
                // ⭐ FIXED: Correct route path
                navigate("/employee/login");
            }, 1750);
            setForm({ name: "", email: "", username: "", password: "", branch: "", role: "Loan Officer" });
        } catch (err) {
            setError("Failed to sign up employee: " + err.message);
        }
        setLoading(false);
    };

    const handleBackToLogin = () => {
        // ⭐ FIXED: Correct route path
        navigate("/employee/login");
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-blue-100 via-blue-50 to-indigo-200">
            {/* Left branding/info column */}
            <div className="hidden lg:flex flex-col justify-between min-h-screen w-1/2 px-24 py-16 relative">
                <div>
                    <div className="mb-10 flex gap-3 items-center">
                        <span className="inline-block p-4 bg-gradient-to-br from-blue-800 to-indigo-800 text-white rounded-full shadow-xl text-5xl">
                            <Icon name="UserPlus" size={44} color="#fff" />
                        </span>
                        <div>
                            <h1 className="text-[2.5rem] font-black text-blue-900 tracking-tight">AutoBank Pro</h1>
                            <p className="text-2xl font-bold text-indigo-700 mt-2">Employee Signup</p>
                        </div>
                    </div>
                    <ul className="mt-14 space-y-7 text-lg font-medium text-blue-900">
                        <li className="flex items-center"><span className="text-green-500 text-2xl mr-2">✔</span>Create secure branch accounts</li>
                        <li className="flex items-center"><span className="text-green-500 text-2xl mr-2">✔</span>Real-time admin access</li>
                        <li className="flex items-center"><span className="text-green-500 text-2xl mr-2">✔</span>Multi-layer fraud protection</li>
                        <li className="flex items-center"><span className="text-green-500 text-2xl mr-2">✔</span>SOC-2 & PCI DSS Certified</li>
                        <li className="flex items-center"><span className="text-green-500 text-2xl mr-2">✔</span>FDIC Insured Funds</li>
                    </ul>
                </div>
                <div className="mb-8 opacity-90">
                    <h3 className="font-bold text-blue-800 mb-3">Security Trust Badges</h3>
                    <div className="flex gap-4">
                        <span className="px-5 py-2 bg-white/80 border border-blue-200 shadow rounded-xl flex items-center gap-3 text-blue-900 text-base">
                            <span role="img" aria-label="">🔒</span> SSL / TLS
                        </span>
                        <span className="px-5 py-2 bg-white/80 border border-blue-200 shadow rounded-xl flex items-center gap-3 text-blue-900 text-base">
                            <span role="img" aria-label="">🛡️</span> Multi-factor
                        </span>
                        <span className="px-5 py-2 bg-white/80 border border-blue-200 shadow rounded-xl flex items-center gap-3 text-blue-900 text-base">
                            <span role="img" aria-label="">🏦</span> FDIC Insured
                        </span>
                        <span className="px-5 py-2 bg-white/80 border border-blue-200 shadow rounded-xl flex items-center gap-3 text-blue-900 text-base">
                            <span role="img" aria-label="">⚙️</span> PCI / SOC-2
                        </span>
                    </div>
                    <footer className="text-xs text-blue-400 mt-8">
                        © {new Date().getFullYear()} AutoBank Pro. All rights reserved.
                    </footer>
                </div>
            </div>

            {/* Signup Card - now larger */}
            <main className="w-full max-w-3xl px-8">
                <div className="backdrop-blur-md bg-white/85 border border-blue-100 shadow-2xl rounded-3xl px-20 py-16 mt-12 mb-12 animate-fadein">
                    <div className="flex flex-col items-center mb-12">
                        <span className="text-8xl mb-4 bg-gradient-to-br from-blue-600 to-indigo-500 p-7 shadow-lg rounded-full text-white">
                            <Icon name="UserPlus" size={52} color="#fff" />
                        </span>
                        <h1 className="text-4xl font-extrabold text-blue-900 mb-1 tracking-tight">Employee Signup</h1>
                        <p className="text-blue-600 text-lg font-medium text-center mb-2">Create your branch employee account</p>
                        <div className="flex w-full justify-end gap-3 mt-2">
                            <button
                                type="button"
                                className="text-blue-700 underline underline-offset-2 hover:text-blue-900 transition text-base font-semibold"
                                onClick={handleBackToLogin}
                                disabled={loading}
                            >
                                ← Back to Login
                            </button>
                            <button
                                type="button"
                                className="text-blue-700 underline underline-offset-2 hover:text-blue-900 transition text-base font-semibold"
                                onClick={handleBackToHome}
                                disabled={loading}
                            >
                                Home
                            </button>
                        </div>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-lg font-semibold text-blue-900 mb-2">Full Name</label>
                            <input
                                className="w-full border border-blue-300 bg-white/90 rounded-xl px-7 py-5 text-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="name"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-blue-900 mb-2">Email Address</label>
                            <input
                                className="w-full border border-blue-300 bg-white/90 rounded-xl px-7 py-5 text-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                type="email"
                                name="email"
                                placeholder="employee@autobank.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-blue-900 mb-2">Username</label>
                            <input
                                className="w-full border border-blue-300 bg-white/90 rounded-xl px-7 py-5 text-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-blue-900 mb-2">Password</label>
                            <input
                                className="w-full border border-blue-300 bg-white/90 rounded-xl px-7 py-5 text-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="new-password"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-blue-900 mb-2">Branch</label>
                            <input
                                className="w-full border border-blue-300 bg-white/90 rounded-xl px-7 py-5 text-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                type="text"
                                name="branch"
                                placeholder="Branch Name"
                                value={form.branch}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-blue-900 mb-2">Role</label>
                            <select
                                className="w-full border border-blue-300 bg-white/90 rounded-xl px-7 py-5 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option>Loan Officer</option>
                                <option>Manager</option>
                                <option>Clerk</option>
                            </select>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-center text-lg font-medium">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-center text-lg font-medium">
                                {success}
                            </div>
                        )}

                        <button
                            className={`w-full py-5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl font-bold text-2xl shadow-xl transition-all flex items-center justify-center ${
                                loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                            }`}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block animate-spin h-7 w-7 border-2 border-blue-100 border-b-blue-700 rounded-full mr-4"></span>
                                    Signing Up...
                                </>
                            ) : (
                                <>
                                    <Icon name="UserPlus" size={22} color="#fff" className="mr-4" />
                                    Sign Up
                                </>
                            )}
                        </button>
                    </form>
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
                            transform: translateY(72px);
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

export default EmployeeSignup;
