import React from "react";
import { useNavigate } from "react-router-dom";

const LandingDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFEF0] text-black">

            {/* Header */}
            <header className="flex justify-between items-center px-8 py-4 bg-white border-b-2 border-black shadow-[0_4px_0_#000] sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#FFD60A] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                        <span className="font-black text-black text-lg">A</span>
                    </div>
                    <h1 className="text-xl font-black text-black">AutoBank Pro</h1>
                </div>
                <nav className="flex space-x-3">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-sm font-bold px-4 py-2 border-2 border-black hover:bg-[#FFD60A] hover:shadow-[2px_2px_0px_#000] transition-all"
                    >
                        Customer Login
                    </button>
                    <button
                        onClick={() => navigate("/employee-login")}
                        className="text-sm font-bold px-4 py-2 border-2 border-black hover:bg-[#FFD60A] hover:shadow-[2px_2px_0px_#000] transition-all"
                    >
                        Employee Login
                    </button>
                    <button
                        onClick={() => navigate("/signup")}
                        className="text-sm font-bold px-4 py-2 bg-[#FFD60A] border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                    >
                        Open an Account
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center flex-grow text-center px-6 py-24 bg-[#FFFEF0]">
                <div className="inline-block bg-[#FFD60A] border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-widest mb-6 shadow-[2px_2px_0px_#000]">
                    Modern Banking Platform
                </div>
                <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-tight text-black max-w-4xl">
                    Banking Made{" "}
                    <span className="bg-[#FFD60A] px-2 border-2 border-black">Simple,</span>
                    <br />Secure, and Smart.
                </h2>
                <p className="text-lg text-gray-700 mb-10 max-w-2xl font-medium">
                    Experience the future of personal finance with AutoBank Pro.
                    All your accounts, transfers, and loans in one place —
                    protected by industry-leading security.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate("/signup")}
                        className="px-8 py-4 bg-[#FFD60A] border-2 border-black font-black text-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                    >
                        Open an Account →
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-8 py-4 bg-white border-2 border-black font-black text-black shadow-[4px_4px_0px_#000] hover:bg-[#FFD60A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                    >
                        Customer Login
                    </button>
                </div>
            </main>

            {/* Features Section */}
            <section className="bg-white border-t-2 border-black py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <h3 className="text-3xl font-black text-center text-black mb-4">A Better Way to Bank</h3>
                    <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto font-medium">
                        We've built a modern banking platform from the ground up to give you
                        control over your financial life.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-[#FFFEF0] p-6 border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all">
                            <div className="text-3xl mb-4">🛡️</div>
                            <h4 className="font-black text-black text-lg mb-2">Ironclad Security</h4>
                            <p className="text-gray-600 text-sm font-medium">
                                Multi-layered security including 2FA and end-to-end encryption to keep your funds safe.
                            </p>
                        </div>

                        <div className="bg-[#FFD60A] p-6 border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all">
                            <div className="text-3xl mb-4">📊</div>
                            <h4 className="font-black text-black text-lg mb-2">Smart Analytics</h4>
                            <p className="text-gray-700 text-sm font-medium">
                                Visualize your spending habits with our intuitive charts and plan your finances better.
                            </p>
                        </div>

                        <div className="bg-[#FFFEF0] p-6 border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all">
                            <div className="text-3xl mb-4">💬</div>
                            <h4 className="font-black text-black text-lg mb-2">24/7 Support</h4>
                            <p className="text-gray-600 text-sm font-medium">
                                Our dedicated support team is always available to help you with any queries or issues.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t-2 border-black text-center bg-black text-white">
                <p className="text-sm font-bold">© {new Date().getFullYear()} AutoBank Pro. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingDashboard;
