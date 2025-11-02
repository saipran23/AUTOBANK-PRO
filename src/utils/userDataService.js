import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Get current username (fallbacks supported)
 */
export const getCurrentUsername = () => {
    const user = auth.currentUser;
    if (!user) return null;
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split("@")[0];
    return user.uid || "Guest";
};

/**
 * Get user data document from Firestore
 */
export const getUserDataById = async (userId) => {
    try {
        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return { success: false, error: "User not found" };
        }
        return { success: true, data: userSnap.data() };
    } catch (error) {
        console.error("Get user data error:", error);
        return { success: false, error: "Failed to get user data" };
    }
};

export const updatePersonalDetails = async (userId, updates) => {
    try {
        const userRef = doc(db, "customers", userId);
        await updateDoc(userRef, {
            personalDetails: updates,
            lastUpdated: new Date().toISOString(),
        });
        return { success: true, message: "Personal details updated successfully" };
    } catch (error) {
        console.error("Update personal details error:", error);
        return { success: false, error: "Failed to update personal details" };
    }
};

export const updateAddress = async (userId, updates) => {
    try {
        const userRef = doc(db, "customers", userId);
        await updateDoc(userRef, {
            address: updates,
            lastUpdated: new Date().toISOString(),
        });
        return { success: true, message: "Address updated successfully" };
    } catch (error) {
        console.error("Update address error:", error);
        return { success: false, error: "Failed to update address" };
    }
};

export const updateIdentity = async (userId, updates) => {
    try {
        const userRef = doc(db, "customers", userId);
        await updateDoc(userRef, {
            identity: updates,
            lastUpdated: new Date().toISOString(),
        });
        return { success: true, message: "Identity updated successfully" };
    } catch (error) {
        console.error("Update identity error:", error);
        return { success: false, error: "Failed to update identity" };
    }
};

export const updatePassword = () => {
    return { success: false, error: "Password updates must use Firebase Auth" };
};

export const getAllAccounts = async (userId) => {
    try {
        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return { success: false, error: "User not found" };
        }
        const userData = userSnap.data();
        return { success: true, accounts: userData.accounts || [] };
    } catch (error) {
        console.error("Get all accounts error:", error);
        return { success: false, error: "Failed to fetch accounts" };
    }
};

export const getPrimaryAccount = async (userId) => {
    try {
        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return { success: false, error: "User not found" };
        }
        const userData = userSnap.data();
        const primaryAccount = (userData.accounts || []).find(
            acc => acc.isPrimary
        );
        if (!primaryAccount)
            return { success: false, error: "No primary account found" };
        return { success: true, account: primaryAccount };
    } catch (error) {
        console.error("Get primary account error:", error);
        return { success: false, error: "Failed to fetch primary account" };
    }
};

export const getTransactionHistory = async (userId, accountId, limit = 20) => {
    try {
        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return { success: false, error: "User not found" };
        }
        const userData = userSnap.data();
        // Updated: String match for IDs or accountNumbers
        const account = (userData.accounts || []).find(
            acc => String(acc.id) === String(accountId) ||
                String(acc.accountNumber) === String(accountId)
        );
        if (!account) {
            return { success: false, error: "Account not found" };
        }
        let transactions = account.transactions || [];
        transactions = transactions.slice(0, limit);
        return { success: true, transactions, count: transactions.length };
    } catch (error) {
        console.error("Get transaction history error:", error);
        return { success: false, error: "Failed to retrieve transactions" };
    }
};

export const addBeneficiary = async (userId, beneficiaryData) => {
    try {
        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return { success: false, error: "User not found" };

        const userData = userSnap.data();
        // Updated: String comparison for beneficiary account number
        const existing = (userData.beneficiaries || []).find(
            b => String(b.accountNumber) === String(beneficiaryData.accountNumber)
        );
        if (existing) return { success: false, error: "Beneficiary already exists" };

        const newList = [
            ...(userData.beneficiaries || []),
            {
                ...beneficiaryData,
                id: `BEN${Date.now()}`,
                addedOn: new Date().toISOString(),
            },
        ];

        await updateDoc(userRef, { beneficiaries: newList });
        return { success: true, message: "Beneficiary added successfully" };
    } catch (error) {
        console.error("Add beneficiary error:", error);
        return { success: false, error: "Failed to add beneficiary" };
    }
};


export const removeBeneficiary = async (userId, beneficiaryId) => {
    try {
        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return { success: false, error: "User not found" };

        const userData = userSnap.data();
        const newList = (userData.beneficiaries || []).filter(
            (b) => b.id !== beneficiaryId
        );

        await updateDoc(userRef, { beneficiaries: newList });
        return { success: true, message: "Beneficiary removed successfully" };
    } catch (error) {
        console.error("Remove beneficiary error:", error);
        return { success: false, error: "Failed to remove beneficiary" };
    }
};

export const getBeneficiaries = async (userId) => {
    try {
        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return { success: false, error: "User not found" };
        const userData = userSnap.data();

        return { success: true, beneficiaries: userData.beneficiaries || [] };
    } catch (error) {
        console.error("Get beneficiaries error:", error);
        return { success: false, error: "Failed to get beneficiaries" };
    }
};
