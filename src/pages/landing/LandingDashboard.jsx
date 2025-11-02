import React from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

const LandingDashboard = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>AutoBank Pro - Secure Digital Banking Platform</title>
                <meta name="description" content="AutoBank Pro: The next generation digital banking platform for individuals and enterprises." />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0b1220] via-[#172240] to-[#141c30] text-white">
                {/* Header */}
                <header className="flex justify-between items-center px-10 py-6 shadow-md bg-[#10192b] border-b border-[#1f2840]">
                    <h1 className="text-2xl font-bold tracking-wide text-blue-400 drop-shadow">AutoBank Pro</h1>
                    <nav className="flex space-x-6">
                        {/* Customer Login */}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-sm font-medium hover:text-blue-500 transition"
                        >
                            Customer Login
                        </button>

                        {/* ✅ FIXED: Employee Login - Changed from /employee-login to /employee/login */}
                        <button
                            onClick={() => navigate("/employee/login")}
                            className="text-sm font-medium hover:text-blue-400 transition"
                        >
                            👨‍💼 Employee Login
                        </button>

                        {/* Sign Up */}
                        <button
                            onClick={() => navigate("/signup")}
                            className="border border-blue-400 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 text-sm font-bold rounded-lg transition-all shadow"
                        >
                            Open an Account
                        </button>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center flex-grow text-center px-6 py-24">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-7 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-200 drop-shadow-lg">
                        Banking Made Simple,<br />
                        Secure, and Smart.
                    </h2>
                    <p className="text-lg text-blue-100/90 mb-10 max-w-3xl tracking-wide leading-relaxed">
                        AutoBank Pro is the next generation digital banking platform for individuals and enterprises.<br />
                        Manage accounts, transfers, employees, loans, and analytics—protected by enterprise-grade security.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
                        <button
                            onClick={() => navigate("/signup")}
                            className="px-7 py-3 bg-blue-600 hover:bg-blue-800 text-white rounded-lg shadow font-semibold text-base transition-all"
                        >
                            Open an Account
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-7 py-3 border border-blue-400 hover:border-blue-600 hover:text-blue-200 bg-[#182041] rounded-lg text-base font-semibold transition-all"
                        >
                            Customer Login
                        </button>
                    </div>
                </main>

                {/* Information Section */}
                <section className="bg-[#171f36] py-14 px-8 text-center">
                    <h3 className="text-3xl font-bold text-blue-400 mb-7">
                        Why Choose AutoBank Pro?
                    </h3>
                    <p className="text-md text-blue-100 max-w-3xl mx-auto mb-10">
                        With a focus on reliability, data security, and business productivity, AutoBank Pro is built for today's digital world.<br />
                        Banks, employees, and users get trusted technology, real-time analytics, and seamless support.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Security Feature */}
                        <div className="bg-[#202c48] p-7 rounded-xl shadow-lg text-center border border-gray-700 hover:border-blue-600 transition">
                            <div className="text-4xl mb-3">🔐</div>
                            <h4 className="font-semibold text-lg text-white mb-1">Ironclad Security</h4>
                            <p className="text-blue-200 text-sm">
                                Multi-layered authentication and encryption, with continuous monitoring for absolute peace of mind.
                            </p>
                        </div>

                        {/* Analytics Feature */}
                        <div className="bg-[#202c48] p-7 rounded-xl shadow-lg text-center border border-gray-700 hover:border-blue-600 transition">
                            <div className="text-4xl mb-3">📊</div>
                            <h4 className="font-semibold text-lg text-white mb-1">Insightful Analytics</h4>
                            <p className="text-blue-200 text-sm">
                                Visualize all your finance flows, employee workloads, and key business metrics in one place.
                            </p>
                        </div>

                        {/* Support Feature */}
                        <div className="bg-[#202c48] p-7 rounded-xl shadow-lg text-center border border-gray-700 hover:border-blue-600 transition">
                            <div className="text-4xl mb-3">💬</div>
                            <h4 className="font-semibold text-lg text-white mb-1">24/7 Human + AI Support</h4>
                            <p className="text-blue-200 text-sm">
                                Get instant answers and professional help any time with our global support team and in-app chat.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Additional Features Section */}
                <section className="py-16 px-8">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-3xl font-bold text-center text-blue-400 mb-12">
                            Everything You Need for Modern Banking
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Feature 1 */}
                            <div className="flex gap-4">
                                <div className="text-3xl flex-shrink-0">⚡</div>
                                <div>
                                    <h4 className="text-xl font-semibold text-white mb-2">Lightning-Fast Transfers</h4>
                                    <p className="text-blue-200">
                                        Send money to any account in seconds with our optimized payment processing system.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex gap-4">
                                <div className="text-3xl flex-shrink-0">📱</div>
                                <div>
                                    <h4 className="text-xl font-semibold text-white mb-2">Mobile First Design</h4>
                                    <p className="text-blue-200">
                                        Access your accounts anytime, anywhere with our responsive mobile application.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex gap-4">
                                <div className="text-3xl flex-shrink-0">💰</div>
                                <div>
                                    <h4 className="text-xl font-semibold text-white mb-2">Smart Loan Management</h4>
                                    <p className="text-blue-200">
                                        Apply for and manage loans with transparent terms and instant decisions.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex gap-4">
                                <div className="text-3xl flex-shrink-0">👥</div>
                                <div>
                                    <h4 className="text-xl font-semibold text-white mb-2">Team Collaboration</h4>
                                    <p className="text-blue-200">
                                        Manage employee roles and permissions with granular access controls.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 px-8 text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Transform Your Banking Experience?
                    </h3>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers and experience the future of digital banking today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate("/signup")}
                            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-lg"
                        >
                            Get Started Now
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all"
                        >
                            Sign In
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 border-t border-[#1f2840] text-center text-blue-200 text-sm bg-[#0b1220]">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            {/* Brand Info */}
                            <div className="text-left">
                                <h4 className="text-white font-bold mb-2">AutoBank Pro</h4>
                                <p className="text-blue-300 text-xs">
                                    The next generation digital banking platform for modern users.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div className="text-left">
                                <h4 className="text-white font-bold mb-3">Quick Links</h4>
                                <ul className="space-y-1 text-xs">
                                    <li><button onClick={() => navigate("/login")} className="text-blue-300 hover:text-blue-100 transition">Customer Login</button></li>
                                    <li><button onClick={() => navigate("/employee/login")} className="text-blue-300 hover:text-blue-100 transition">Employee Login</button></li>
                                    <li><button onClick={() => navigate("/signup")} className="text-blue-300 hover:text-blue-100 transition">Create Account</button></li>
                                </ul>
                            </div>

                            {/* Legal Links */}
                            <div className="text-left">
                                <h4 className="text-white font-bold mb-3">Legal</h4>
                                <ul className="space-y-1 text-xs">
                                    <li><a href="#" className="text-blue-300 hover:text-blue-100 transition">Privacy Policy</a></li>
                                    <li><a href="#" className="text-blue-300 hover:text-blue-100 transition">Terms of Service</a></li>
                                    <li><a href="#" className="text-blue-300 hover:text-blue-100 transition">Security</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-[#1f2840] pt-6">
                            <p>© {new Date().getFullYear()} AutoBank Pro. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingDashboard;
