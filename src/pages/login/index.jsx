import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';  // Add this import
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './components/LoginForm';
import TrustSignals from './components/TrustSignals';
import BiometricAuth from './components/BiometricAuth';

const Login = () => {
    const [showBiometric, setShowBiometric] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const { user, role, loading } = useAuth();

    useEffect(() => {
        if (!loading && user && role === 'customer') {
            // Set localStorage keys for user session
            localStorage.setItem('autobank_current_user', user.email);
            // TODO: Set user profile data if you have it, e.g.:
            // localStorage.setItem(`autobank_data_${user.email}`, JSON.stringify(userData));
            navigate('/customer-dashboard');
        }
    }, [user, role, loading, navigate]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile && localStorage.getItem('preferBiometric') === 'true') {
            setShowBiometric(true);
        }
    }, [isMobile]);

    const handleBiometricSuccess = () => navigate('/customer-dashboard');
    const handleSkipBiometric = () => setShowBiometric(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
                <div className="text-center">
                    <svg className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Sign In - AutoBank Pro | Secure Banking Login</title>
                <meta name="description" content="Sign in to your AutoBank Pro account with secure multi-factor authentication." />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
                {/* Top Navigation Bar with Back Button */}
                <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo/Brand */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold text-gray-900 truncate">AutoBank Pro</h2>
                                    <p className="text-xs text-gray-500 truncate">Secure Banking</p>
                                </div>
                            </div>

                            {/* Back Button */}
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium whitespace-nowrap ml-auto flex-shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="hidden sm:inline">Back to Home</span>
                                <span className="sm:hidden">Back</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>

                <div className="relative z-10 flex min-h-[calc(100vh-73px)]">
                    {/* Left Side - Marketing Content (Desktop Only) */}
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-blue-600 to-blue-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20" />

                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1624343285636-aba82fd5a124?w=800&q=80')`
                            }}
                        />

                        {/* Content Overlay */}
                        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
                            <div className="max-w-lg">
                                <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
                                    Banking Made Simple & Secure
                                </h1>
                                <p className="text-xl xl:text-2xl mb-8 text-blue-100 leading-relaxed drop-shadow">
                                    Experience the future of digital banking with AutoBank Pro's comprehensive financial management platform.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                                        <span className="text-lg drop-shadow">24/7 Secure Access</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                                        <span className="text-lg drop-shadow">Advanced Fraud Protection</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                                        <span className="text-lg drop-shadow">Instant Transactions</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                                        <span className="text-lg drop-shadow">FDIC Insured up to $250,000</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-3xl" />
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="flex-1 lg:w-1/2 xl:w-2/5 flex flex-col bg-white lg:bg-gray-50">
                        {/* Form Container */}
                        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                            <div className="w-full max-w-md">
                                {showBiometric ? (
                                    <BiometricAuth
                                        onSuccess={handleBiometricSuccess}
                                        onSkip={handleSkipBiometric}
                                    />
                                ) : (
                                    <LoginForm />
                                )}
                            </div>
                        </div>

                        {/* Trust Signals Section */}
                        <div className="p-6 lg:p-12 border-t border-gray-200 bg-slate-50 lg:bg-white">
                            <TrustSignals />
                        </div>
                    </div>
                </div>

                {/* Mobile Header Banner */}
                <div className="lg:hidden fixed top-16 left-0 right-0 h-40 bg-gradient-to-br from-blue-600 to-blue-900 overflow-hidden -z-10">
                    <div className="absolute inset-0 bg-black/20" />
                    <div
                        className="w-full h-full bg-cover bg-center opacity-30"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1663000805908-1106cf7ad001?w=400&q=80')`
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white px-6">
                            <h1 className="text-2xl font-bold mb-2 drop-shadow">AutoBank Pro</h1>
                            <p className="text-blue-100 drop-shadow">Secure Digital Banking</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-10 bg-white border-t border-gray-200 py-6 mt-8">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <p className="text-sm text-gray-600">
                            © {new Date()?.getFullYear()} AutoBank Pro. All rights reserved.
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                            <button className="hover:text-gray-700 transition-colors">Privacy Policy</button>
                            <span>•</span>
                            <button className="hover:text-gray-700 transition-colors">Terms of Service</button>
                            <span>•</span>
                            <button className="hover:text-gray-700 transition-colors">Security</button>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Login;
