import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

// Step 1. Create context
const AuthContext = createContext();

// Step 2. Custom hook to use this context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

// Step 3. Provider component (customers + employees)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [role, setRole] = useState(null); // 'customer' or 'employee'
    const [loading, setLoading] = useState(true);

    // Helper function for fetching profile (defined outside useEffect)
    const fetchProfile = async (firebaseUser) => {
        if (!firebaseUser?.email) {
            console.warn('⚠️ No Firebase user email provided');
            setUserData(null);
            setRole(null);
            localStorage.removeItem('autobank_current_user');
            return;
        }

        try {
            console.log('🔍 Fetching profile for:', firebaseUser.email);

            // Search customer profile first
            let q = query(
                collection(db, "customers"),
                where("personalDetails.email", "==", firebaseUser.email)
            );
            let snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const customerData = snapshot.docs[0].data();
                console.log('✅ Customer profile found in Firestore');
                setUserData(customerData);
                setRole("customer");

                // Save to localStorage
                localStorage.setItem('autobank_current_user', firebaseUser.email);
                localStorage.setItem(
                    `autobank_data_${firebaseUser.email}`,
                    JSON.stringify(customerData)
                );
                console.log('✅ Customer profile cached to localStorage');
                return;
            }

            console.log('ℹ️ Customer not found, searching employees collection...');

            // Search employee profile
            q = query(
                collection(db, "employees"),
                where("email", "==", firebaseUser.email)
            );
            snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const employeeData = snapshot.docs[0].data();
                console.log('✅ Employee profile found in Firestore');
                setUserData(employeeData);
                setRole("employee");

                // Save to localStorage
                localStorage.setItem('autobank_current_user', firebaseUser.email);
                localStorage.setItem(
                    `autobank_data_${firebaseUser.email}`,
                    JSON.stringify(employeeData)
                );
                console.log('✅ Employee profile cached to localStorage');
                return;
            }

            // No profile found in either collection
            console.warn('⚠️ No user profile found in Firestore for:', firebaseUser.email);
            console.warn('ℹ️ User is authenticated but has no profile. This may be a new user.');
            setUserData(null);
            setRole(null);
            localStorage.removeItem('autobank_current_user');
        } catch (error) {
            console.error('❌ Error fetching profile:', error);
            setUserData(null);
            setRole(null);
            localStorage.removeItem('autobank_current_user');
        }
    };

    // Setup auth state listener
    useEffect(() => {
        console.log('📡 Setting up Firebase auth state listener');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    console.log('👤 User authenticated:', firebaseUser.email);
                    setUser(firebaseUser);
                    setLoading(true);
                    await fetchProfile(firebaseUser);
                } else {
                    console.log('🚪 No user authenticated');
                    setUser(null);
                    setUserData(null);
                    setRole(null);
                    localStorage.removeItem('autobank_current_user');
                }
            } catch (error) {
                console.error('❌ Error in onAuthStateChanged:', error);
                setUser(null);
                setUserData(null);
                setRole(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            console.log('🔐 Attempting login for:', email);

            // Trim whitespace
            const trimmedEmail = email.trim().toLowerCase();
            const trimmedPassword = password.trim();

            console.log('📧 Email:', trimmedEmail);
            console.log('🔑 Password length:', trimmedPassword.length);

            // Attempt Firebase login
            console.log('🔄 Calling Firebase signInWithEmailAndPassword...');
            const result = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);

            console.log('✅ Firebase authentication successful');
            console.log('👤 Firebase user:', result.user.email);

            // Fetch and cache profile after successful login
            console.log('🔍 Fetching user profile from Firestore...');
            await fetchProfile(result.user);

            console.log('✅ Login process completed successfully');
            return result;
        } catch (error) {
            console.error('❌ Login error code:', error.code);
            console.error('❌ Login error message:', error.message);
            console.error('❌ Full error:', error);

            // Provide user-friendly error messages
            const errorMessages = {
                'auth/user-not-found': 'Email address not found in Firebase. Please check the email and try again, or sign up first.',
                'auth/invalid-password': 'Incorrect password. Please try again.',
                'auth/invalid-credential': 'Invalid email or password combination. Please verify both are correct.',
                'auth/invalid-email': 'Invalid email address format.',
                'auth/too-many-requests': 'Too many login attempts. Please try again later.',
                'auth/weak-password': 'Password should be at least 6 characters.',
                'auth/email-already-in-use': 'Email is already in use.',
                'auth/operation-not-allowed': 'Email/password accounts are not enabled in Firebase.',
                'auth/account-exists-with-different-credential': 'Account exists with different sign-in method.',
            };

            const userFriendlyMessage = errorMessages[error.code] || error.message || 'Login failed. Please try again.';
            const customError = new Error(userFriendlyMessage);
            customError.code = error.code;
            throw customError;
        }
    };

    const logout = async () => {
        try {
            console.log('🚪 Logging out user...');
            await signOut(auth);
            setUser(null);
            setUserData(null);
            setRole(null);
            localStorage.removeItem('autobank_current_user');
            sessionStorage.removeItem('user');
            console.log('✅ Logged out successfully');
        } catch (error) {
            console.error('❌ Logout error:', error);
            throw error;
        }
    };

    const value = {
        user,
        userData,
        role,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
