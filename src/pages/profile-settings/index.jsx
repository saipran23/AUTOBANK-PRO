import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';

export default function ProfileSettings() {
    const navigate = useNavigate();
    const { user, userData, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const handleSignOut = async () => {
        try {
            await logout();
            navigate('/login');
        } catch(e) {
            // fallback (unlikely to be needed)
            localStorage.removeItem('autobank_current_user');
            sessionStorage.removeItem('user');
            navigate('/login');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FFFEF0]">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // If no data loaded (possible if user is new, deleted, or DB is empty)
    if (!userData) {
        return (
            <div className="min-h-screen bg-[#FFFEF0]">
                <Header />
                <main className="pt-16">
                    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className="text-xl font-black text-gray-900 mb-2">No user data found</p>
                            <p className="text-gray-600 mb-6">
                                We couldn't load your profile information. Please log in again.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 bg-[#FFD60A] border-2 border-black font-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Safe destructuring with defaults
    const personalDetails = userData?.personalDetails || {};
    const address = userData?.address || {};
    const identity = userData?.identity || {};
    const accounts = userData?.accounts || [];
    const account = accounts.length > 0 ? accounts[0] : null;

    // Validate essential data
    const hasEssentialData = personalDetails.fullName && account;

    if (!hasEssentialData) {
        return (
            <div className="min-h-screen bg-[#FFFEF0]">
                <Header />
                <main className="pt-16">
                    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className="text-xl font-black text-gray-900 mb-2">Incomplete Profile Data</p>
                            <p className="text-gray-600 mb-6">
                                Your profile is missing essential information. Please contact support or log in again.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => navigate('/customer-dashboard')}
                                    className="px-6 py-2 bg-[#FFD60A] border-2 border-black font-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="px-6 py-2 bg-[#FF6B6B] border-2 border-black font-black text-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFEF0]">
            <Header />
            <main className="pt-16">
                <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <aside className="lg:w-1/4 flex-shrink-0">
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6 flex flex-col items-center">
                                <div className="w-16 h-16 bg-[#FFD60A] border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center text-2xl font-black text-black mb-2">
                                    {personalDetails.fullName
                                        ? personalDetails.fullName.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)
                                        : 'U'}
                                </div>
                                <div className="font-semibold text-lg text-center">{personalDetails.fullName || 'User'}</div>
                                <div className="text-xs text-gray-600 break-all text-center">{personalDetails.email || 'N/A'}</div>
                                <button
                                    onClick={handleSignOut}
                                    className="mt-5 w-full flex items-center justify-center px-4 py-2 bg-[#FF6B6B] border-2 border-black font-black text-black text-sm shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                                >
                                    <Icon name="LogOut" size={16} className="mr-2" />
                                    Sign Out
                                </button>
                                <button
                                    onClick={() => navigate('/customer-dashboard')}
                                    className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-[#FFD60A] border-2 border-black font-black text-black text-sm shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                                >
                                    <Icon name="ChevronLeft" size={16} className="mr-2" />
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </aside>
                    {/* Main Content */}
                    <section className="flex-1 space-y-10">
                        <header className="mb-6">
                            <h1 className="text-4xl font-black text-black">Profile Settings</h1>
                            <p className="text-lg text-gray-600">You can view your bank profile and details below</p>
                        </header>
                        <div className="grid md:grid-cols-2 gap-7">
                            {/* Personal Information */}
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6">
                                <div className="flex items-center mb-4 gap-3">
                                    <Icon name="User" size={20} className="text-primary" />
                                    <h2 className="font-black text-black text-lg">Personal Information</h2>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-gray-500">Full Name&nbsp;:</span>{' '}
                                        <span className="font-medium">{personalDetails.fullName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Customer ID&nbsp;:</span>{' '}
                                        <span className="font-medium">{userData.customerID || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date of Birth&nbsp;:</span>{' '}
                                        <span className="font-medium">
                                            {personalDetails.dateOfBirth
                                                ? new Date(personalDetails.dateOfBirth).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gender&nbsp;:</span>{' '}
                                        <span className="font-medium">{personalDetails.gender || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6">
                                <div className="flex items-center mb-4 gap-3">
                                    <Icon name="Mail" size={20} className="text-primary" />
                                    <h2 className="font-black text-black text-lg">Contact</h2>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-gray-500">Email&nbsp;:</span>{' '}
                                        <span className="font-medium">{personalDetails.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Mobile&nbsp;:</span>{' '}
                                        <span className="font-medium">{personalDetails.phoneNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6">
                                <div className="flex items-center mb-4 gap-3">
                                    <Icon name="MapPin" size={20} className="text-primary" />
                                    <h2 className="font-black text-black text-lg">Address</h2>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-gray-800">{address.street || 'N/A'}</div>
                                    <div className="text-gray-600">
                                        {address.city ? `${address.city}, ${address.state || ''}` : 'N/A'}
                                    </div>
                                    <div className="text-gray-600">Pincode: {address.pincode || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Identity Verification */}
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6">
                                <div className="flex items-center mb-4 gap-3">
                                    <Icon name="Shield" size={20} className="text-primary" />
                                    <h2 className="font-black text-black text-lg">Identity Verification</h2>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-gray-500">PAN No&nbsp;:</span>{' '}
                                        <span className="font-medium">{identity.panNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Aadhar No&nbsp;:</span>{' '}
                                        <span className="font-medium">
                                            {identity.aadharNumber
                                                ? identity.aadharNumber.replace(/\d(?=\d{4})/g, 'X')
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Account Overview */}
                        {account && Object.keys(account).length > 0 ? (
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-8">
                                <div className="flex items-center mb-4 gap-3">
                                    <Icon name="CreditCard" size={24} className="text-primary" />
                                    <h2 className="font-black text-black text-lg">Active Account Details</h2>
                                </div>
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg border px-5 py-4 shadow flex flex-col">
                                        <span className="text-xs text-gray-500 mb-1">Account Number</span>
                                        <span className="text-xl font-bold">{account.accountNumber || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none px-5 py-4 flex flex-col">
                                        <span className="text-xs text-gray-500 mb-1">IFSC Code</span>
                                        <span className="text-lg font-semibold">{account.ifscCode || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none px-5 py-4 flex flex-col">
                                        <span className="text-xs text-gray-500 mb-1">Type</span>
                                        <span className="font-medium">{account.type ? `${account.type} Account` : 'N/A'}</span>
                                    </div>
                                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none px-5 py-4 flex flex-col">
                                        <span className="text-xs text-gray-500 mb-1">Branch</span>
                                        <span className="font-medium">{account.branchName || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none px-5 py-4 flex flex-col">
                                        <span className="text-xs text-gray-500 mb-1">Status</span>
                                        <span className="font-medium text-[#00C9B1]">{account.status || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none px-5 py-4 flex flex-col">
                                        <span className="text-xs text-gray-500 mb-1">Current Balance</span>
                                        <span className="text-2xl font-black text-black">
                                            ₹{account.currentBalance ? account.currentBalance.toLocaleString('en-IN') : '0'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#FFD60A]/10 border-2 border-[#FFD60A] rounded-none p-6 text-center">
                                <p className="text-yellow-800">⚠️ No account information available</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
