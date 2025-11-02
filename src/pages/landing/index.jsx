import React from "react";
import { useNavigate } from "react-router-dom";

const LandingDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-[#0b1220] text-white">

            {/* Header */}
            <header className="flex justify-between items-center px-8 py-5 border-b border-[#1f2840] bg-[#0b1220] shadow-md">
                <h1 className="text-xl font-bold tracking-wide text-white">SecureBank</h1>
                <nav className="flex space-x-6">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-sm font-medium hover:text-blue-400 transition"
                    >
                        Customer Login
                    </button>
                    <button
                        onClick={() => navigate("/employee-login")}
                        className="text-sm font-medium hover:text-blue-400 transition"
                    >
                        Employee Login
                    </button>
                    <button
                        onClick={() => navigate("/signup")}
                        className="border border-blue-500 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                    >
                        Open an Account
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center flex-grow text-center px-6 py-20 bg-gradient-to-b from-[#0b1220] to-[#141c30]">
                <h2 className="text-5xl font-extrabold mb-6 leading-tight text-white">
                    Banking Made Simple,<br /> Secure, and Smart.
                </h2>
                <p className="text-lg text-gray-400 mb-10 max-w-2xl">
                    Experience the future of personal finance with SecureBank.
                    All your accounts, transfers, and loans in one place —
                    protected by industry-leading security.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate("/signup")}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md text-sm font-semibold transition-all"
                    >
                        Open an Account →
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-3 bg-transparent border border-gray-600 hover:border-blue-500 hover:text-blue-400 rounded-lg text-sm font-semibold transition-all"
                    >
                        Customer Login
                    </button>
                </div>
            </main>

            {/* Features Section */}
            <section className="bg-[#0f182b] py-16">
                <h3 className="text-2xl font-bold text-center text-white mb-12">A Better Way to Bank</h3>
                <p className="text-center text-gray-400 mb-12 max-w-3xl mx-auto">
                    We've built a modern banking platform from the ground up to give you
                    control over your financial life.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
                    <div className="bg-[#141c30] p-6 rounded-lg text-center border border-gray-700 hover:border-blue-500 transition-all">
                        <div className="text-3xl mb-4">🛡️</div>
                        <h4 className="font-semibold text-white text-lg mb-2">Ironclad Security</h4>
                        <p className="text-gray-400 text-sm">
                            Multi-layered security including 2FA and end-to-end encryption to keep your funds safe.
                        </p>
                    </div>

                    <div className="bg-[#141c30] p-6 rounded-lg text-center border border-gray-700 hover:border-blue-500 transition-all">
                        <div className="text-3xl mb-4">📊</div>
                        <h4 className="font-semibold text-white text-lg mb-2">Smart Analytics</h4>
                        <p className="text-gray-400 text-sm">
                            Visualize your spending habits with our intuitive charts and plan your finances better.
                        </p>
                    </div>

                    <div className="bg-[#141c30] p-6 rounded-lg text-center border border-gray-700 hover:border-blue-500 transition-all">
                        <div className="text-3xl mb-4">💬</div>
                        <h4 className="font-semibold text-white text-lg mb-2">24/7 Support</h4>
                        <p className="text-gray-400 text-sm">
                            Our dedicated support team is always available to help you with any queries or issues.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 border-t border-[#1f2840] text-center text-gray-500 text-sm bg-[#0b1220]">
                © {new Date().getFullYear()} SecureBank. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingDashboard;
