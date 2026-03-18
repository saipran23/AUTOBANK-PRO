import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Ensure we never redirect to dashboard on navigation
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const q = query(
                    collection(db, "customers"),
                    where("personalDetails.email", "==", user.email)
                );
                const qSnapshot = await getDocs(q);
                if (!qSnapshot.empty) {
                    const firebaseUser = qSnapshot.docs[0].data();
                    setUserData(firebaseUser);
                }
            } else {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const userName = userData?.personalDetails?.fullName || 'User';
    const userEmail = userData?.personalDetails?.email || 'user@example.com';
    const isActive = (path) => location.pathname === path;

    // This function always navigates to its path!
    const handleMenuItemClick = (path) => {
        setShowDropdown(false);
        // Never conditionally redirect to dashboard here
        navigate(path);
    };

    return (
        <header className="fixed top-0 left-0 w-full h-16 z-50 bg-white border-b-2 border-black shadow-[0_4px_0_#000]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-8">
                        <button onClick={() => navigate('/customer-dashboard')} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-[#FFD60A] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                                <span className="text-black font-black text-lg">A</span>
                            </div>
                            <span className="text-xl font-black text-black hidden sm:block">AutoBank Pro</span>
                        </button>
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-1">
                            <button
                                onClick={() => navigate('/customer-dashboard')}
                                className={`px-4 py-2 text-sm font-bold border-2 transition-all ${
                                    isActive('/customer-dashboard')
                                        ? 'bg-[#FFD60A] border-black shadow-[2px_2px_0px_#000]'
                                        : 'border-transparent hover:bg-[#FFD60A] hover:border-black hover:shadow-[2px_2px_0px_#000]'
                                }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    let firstAccount =
                                        userData?.accounts?.length > 0 ? userData.accounts[0].accountNumber : null;
                                    if (firstAccount) {
                                        navigate(`/account-details/${firstAccount}`);
                                    } else {
                                        navigate('/account-details');
                                    }
                                }}
                                className={`px-4 py-2 text-sm font-bold border-2 transition-all ${
                                    location.pathname.startsWith('/account-details')
                                        ? 'bg-[#FFD60A] border-black shadow-[2px_2px_0px_#000]'
                                        : 'border-transparent hover:bg-[#FFD60A] hover:border-black hover:shadow-[2px_2px_0px_#000]'
                                }`}
                            >
                                Accounts
                            </button>
                            <button
                                onClick={() => navigate('/transfer-money')}
                                className={`px-4 py-2 text-sm font-bold border-2 transition-all ${
                                    isActive('/transfer-money')
                                        ? 'bg-[#FFD60A] border-black shadow-[2px_2px_0px_#000]'
                                        : 'border-transparent hover:bg-[#FFD60A] hover:border-black hover:shadow-[2px_2px_0px_#000]'
                                }`}
                            >
                                Transfer
                            </button>
                            <button
                                onClick={() => navigate('/loan-application')}
                                className={`px-4 py-2 text-sm font-bold border-2 transition-all ${
                                    isActive('/loan-application')
                                        ? 'bg-[#FFD60A] border-black shadow-[2px_2px_0px_#000]'
                                        : 'border-transparent hover:bg-[#FFD60A] hover:border-black hover:shadow-[2px_2px_0px_#000]'
                                }`}
                            >
                                Loans
                            </button>
                            <button
                                onClick={() => navigate('/support')}
                                className={`px-4 py-2 text-sm font-bold border-2 transition-all ${
                                    isActive('/support')
                                        ? 'bg-[#FFD60A] border-black shadow-[2px_2px_0px_#000]'
                                        : 'border-transparent hover:bg-[#FFD60A] hover:border-black hover:shadow-[2px_2px_0px_#000]'
                                }`}
                            >
                                Support
                            </button>
                        </nav>
                    </div>
                    {/* Right Side - User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="p-2 text-black border-2 border-transparent hover:border-black hover:bg-[#FFD60A] hover:shadow-[2px_2px_0px_#000] transition-all relative hidden sm:block">
                            <Icon name="Bell" size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] border border-black rounded-none"></span>
                        </button>
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-black border-2 border-black hover:bg-[#FFD60A] transition-all"
                        >
                            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
                        </button>
                        {/* User Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-3 focus:outline-none hover:bg-[#FFD60A] border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_#000] px-3 py-2 transition-all"
                            >
                                <div className="w-10 h-10 bg-[#FFD60A] border-2 border-black flex items-center justify-center font-black text-black shadow-[2px_2px_0px_#000]">
                                    {getInitials(userName)}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-bold text-black">{userName}</p>
                                    <p className="text-xs text-gray-600">{userEmail}</p>
                                </div>
                                <Icon name="ChevronDown" size={16} className="text-black hidden sm:block" />
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-black shadow-[4px_4px_0px_#000] py-2"
                                     style={{ zIndex: 10000 }}
                                >
                                    <div className="px-4 py-3 border-b-2 border-black">
                                        <p className="text-sm font-bold text-black">{userName}</p>
                                        <p className="text-xs text-gray-600">{userEmail}</p>
                                    </div>
                                    <button
                                        onClick={() => handleMenuItemClick('/profile-settings')}
                                        className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-[#FFD60A] transition-colors flex items-center space-x-3"
                                    >
                                        <Icon name="User" size={16} />
                                        <span>Profile Settings</span>
                                    </button>
                                    <button
                                        onClick={() => handleMenuItemClick('/security')}
                                        className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-[#FFD60A] transition-colors flex items-center space-x-3"
                                    >
                                        <Icon name="Lock" size={16} />
                                        <span>Security</span>
                                    </button>
                                    <button
                                        onClick={() => handleMenuItemClick('/notifications')}
                                        className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-[#FFD60A] transition-colors flex items-center space-x-3"
                                    >
                                        <Icon name="Bell" size={16} />
                                        <span>Notifications</span>
                                    </button>
                                    <button
                                        onClick={() => handleMenuItemClick('/support')}
                                        className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-[#FFD60A] transition-colors flex items-center space-x-3"
                                    >
                                        <Icon name="HelpCircle" size={16} />
                                        <span>Help Center</span>
                                    </button>
                                    <div className="border-t-2 border-black mt-2 pt-2">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-2 text-left text-sm font-medium text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-black transition-colors flex items-center space-x-3"
                                        >
                                            <Icon name="LogOut" size={16} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                    <div className="px-4 py-2 border-t-2 border-black text-xs text-gray-500 font-medium">
                                        Schedule or pay bills
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t-2 border-black">
                        <nav className="flex flex-col space-y-2">
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
