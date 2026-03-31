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
        <header className="fixed top-0 left-0 w-full h-16 z-50 bg-surface border-b border-card-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-8">
                        <button onClick={() => navigate('/customer-dashboard')} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-xl font-bold text-primary hidden sm:block">AutoBank Pro</span>
                        </button>
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-1">
                            <button
                                onClick={() => navigate('/customer-dashboard')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive('/customer-dashboard')
                                        ? 'bg-primary text-white'
                                        : 'text-text-secondary hover:bg-secondary hover:text-text'
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
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname.startsWith('/account-details')
                                        ? 'bg-primary text-white'
                                        : 'text-text-secondary hover:bg-secondary hover:text-text'
                                }`}
                            >
                                Accounts
                            </button>
                            <button
                                onClick={() => navigate('/transfer-money')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive('/transfer-money')
                                        ? 'bg-primary text-white'
                                        : 'text-text-secondary hover:bg-secondary hover:text-text'
                                }`}
                            >
                                Transfer
                            </button>
                            <button
                                onClick={() => navigate('/loan-application')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive('/loan-application')
                                        ? 'bg-primary text-white'
                                        : 'text-text-secondary hover:bg-secondary hover:text-text'
                                }`}
                            >
                                Loans
                            </button>
                            <button
                                onClick={() => navigate('/support')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive('/support')
                                        ? 'bg-primary text-white'
                                        : 'text-text-secondary hover:bg-secondary hover:text-text'
                                }`}
                            >
                                Support
                            </button>
                        </nav>
                    </div>
                    {/* Right Side - User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="p-2 text-text-secondary hover:text-text rounded-full hover:bg-secondary transition-colors relative hidden sm:block">
                            <Icon name="Bell" size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                        </button>
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-text-secondary hover:text-text rounded-md hover:bg-secondary"
                        >
                            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
                        </button>
                        {/* User Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-3 focus:outline-none hover:bg-secondary rounded-lg px-3 py-2 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                                    {getInitials(userName)}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-semibold text-text">{userName}</p>
                                    <p className="text-xs text-text-secondary">{userEmail}</p>
                                </div>
                                <Icon name="ChevronDown" size={16} className="text-text-secondary hidden sm:block" />
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-card-border py-2"
                                     style={{
                                         background: "rgba(255,255,255,0.85)",       // semi-transparent white background
                                         backdropFilter: "blur(12px)",                // glassmorphism blur effect
                                         WebkitBackdropFilter: "blur(12px)",
                                         zIndex: 10000,                               // high z-index to appear on top
                                         boxShadow: "0 8px 32px 0 rgba(0,0,0,0.1)",  // stronger shadow for depth
                                     }}
                                >
                                    <div className="px-4 py-3 border-b border-card-border">
                                        <p className="text-sm font-semibold text-text">{userName}</p>
                                        <p className="text-xs text-text-secondary">{userEmail}</p>
                                    </div>
                                    {/* Profile Settings */}
                                    <button
                                        onClick={() => handleMenuItemClick('/profile-settings')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center space-x-3"
                                    >
                                        <Icon name="User" size={16} />
                                        <span>Profile Settings</span>
                                    </button>
                                    {/* Security */}
                                    <button
                                        onClick={() => handleMenuItemClick('/security')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center space-x-3"
                                    >
                                        <Icon name="Lock" size={16} />
                                        <span>Security</span>
                                    </button>
                                    {/* Notifications */}
                                    <button
                                        onClick={() => handleMenuItemClick('/notifications')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center space-x-3"
                                    >
                                        <Icon name="Bell" size={16} />
                                        <span>Notifications</span>
                                    </button>
                                    {/* Help Center */}
                                    <button
                                        onClick={() => handleMenuItemClick('/support')}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center space-x-3"
                                    >
                                        <Icon name="HelpCircle" size={16} />
                                        <span>Help Center</span>
                                    </button>
                                    <div className="border-t border-card-border mt-2 pt-2">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 transition-colors flex items-center space-x-3"
                                        >
                                            <Icon name="LogOut" size={16} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                    <div className="px-4 py-2 border-t border-card-border text-xs text-text-secondary">
                                        Schedule or pay bills
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-card-border">
                        <nav className="flex flex-col space-y-2">
                            {/* Mobile nav items can go here */}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
