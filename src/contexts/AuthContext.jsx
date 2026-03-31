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

    // Helper function for fetching profile
    const fetchProfile = async (firebaseUser) => {
        if (!firebaseUser?.email) {
            setUserData(null);
            setRole(null);
            localStorage.removeItem('autobank_current_user');
            return;
        }

        try {
            // Search customer profile first
            let q = query(
                collection(db, "customers"),
                where("personalDetails.email", "==", firebaseUser.email)
            );
            let snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const customerData = snapshot.docs[0].data();
                setUserData(customerData);
                setRole("customer");
                localStorage.setItem('autobank_current_user', firebaseUser.email);
                localStorage.setItem(
                    `autobank_data_${firebaseUser.email}`,
                    JSON.stringify(customerData)
                );
                return;
            }

            // Search employee profile
            q = query(
                collection(db, "employees"),
                where("email", "==", firebaseUser.email)
            );
            snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const employeeData = snapshot.docs[0].data();
                setUserData(employeeData);
                setRole("employee");
                localStorage.setItem('autobank_current_user', firebaseUser.email);
                localStorage.setItem(
                    `autobank_data_${firebaseUser.email}`,
                    JSON.stringify(employeeData)
                );
                return;
            }

            // No profile found in either collection
            setUserData(null);
            setRole(null);
            localStorage.removeItem('autobank_current_user');
        } catch (error) {
            setUserData(null);
            setRole(null);
            localStorage.removeItem('autobank_current_user');
        }
    };

    // Setup auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    setLoading(true);
                    await fetchProfile(firebaseUser);
                } else {
                    setUser(null);
                    setUserData(null);
                    setRole(null);
                    localStorage.removeItem('autobank_current_user');
                }
            } catch (error) {
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
            const trimmedEmail = email.trim().toLowerCase();
            const trimmedPassword = password.trim();

            const result = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
            await fetchProfile(result.user);
            return result;
        } catch (error) {
            const errorMessages = {
                'auth/user-not-found': 'Email address not found. Please check the email and try again, or sign up first.',
                'auth/invalid-password': 'Incorrect password. Please try again.',
                'auth/invalid-credential': 'Invalid email or password. Please verify both are correct.',
                'auth/invalid-email': 'Invalid email address format.',
                'auth/too-many-requests': 'Too many login attempts. Please try again later.',
                'auth/weak-password': 'Password should be at least 6 characters.',
                'auth/email-already-in-use': 'Email is already in use.',
                'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
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
            await signOut(auth);
            setUser(null);
            setUserData(null);
            setRole(null);
            localStorage.removeItem('autobank_current_user');
            sessionStorage.removeItem('user');
        } catch (error) {
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
