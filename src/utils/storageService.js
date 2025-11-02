// src/utils/storageService.js

/**
 * ==========================================
 * STORAGE SERVICE (FIRESTORE-ONLY)
 * ==========================================
 * All logic formerly using mock data/localStorage is removed!
 * This version ONLY uses Firestore for all account/balance/transaction logic.
 */

import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Fetch user data from Firestore by userId (uid from Firebase Auth).
 */
export async function getUserData(userId) {
    try {
        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: userSnap.data() };
    } catch (error) {
        console.error("Error getting user data:", error);
        return { success: false, error: "Failed to fetch user data" };
    }
}

/**
 * Save modified user data into Firestore.
 * Use carefully: only pass the changed fields for partial update.
 */
export async function saveUserData(userId, updatedData) {
    try {
        const userRef = doc(db, "customers", userId);
        await updateDoc(userRef, updatedData);
        return { success: true };
    } catch (error) {
        console.error("Error saving user data:", error);
        return { success: false, error: "Failed to save user data" };
    }
}

/**
 * Firestore-powered internal or external money transfer.
 * Handles:
 * - Debiting source account
 * - Crediting destination (if internal)
 * - Appending transaction records atomically
 */
export async function handleTransferMoney({
                                              userId,
                                              sourceAccountId,
                                              destinationAccountId,
                                              amount,
                                              transferType = "internal",
                                              memo = "",
                                              recipientName = "",
                                              recipientAccount = "",
                                              recipientBank = "",
                                          }) {
    try {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return { success: false, error: "Invalid transfer amount" };
        }

        const userRef = doc(db, "customers", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return { success: false, error: "User not found" };
        }

        const userData = userSnap.data();
        const accounts = userData.accounts || [];
        const fromIdx = accounts.findIndex(a => String(a.id) === String(sourceAccountId));        if (fromIdx < 0) {
            return { success: false, error: "Source account not found" };
        }
        if (accounts[fromIdx].currentBalance < parsedAmount) {
            return { success: false, error: "Insufficient funds" };
        }

        // Deduct from source
        accounts[fromIdx].currentBalance -= parsedAmount;

        // Credit destination if internal
        if (transferType === "internal" && destinationAccountId) {
            const toIdx = accounts.findIndex(a => String(a.id) === String(destinationAccountId));            if (toIdx < 0) {
                return { success: false, error: "Destination account not found" };
            }
            accounts[toIdx].currentBalance += parsedAmount;
        }

        // Prepare transaction record
        const date = new Date().toISOString();
        const transactionId = `txn-${Date.now()}`;
        const transaction = {
            id: transactionId,
            type: transferType,
            from: sourceAccountId,
            to: transferType === "internal" ? destinationAccountId : recipientAccount,
            amount: parsedAmount,
            status: "completed",
            date,
            memo,
            recipientName,
            recipientBank,
        };

        // Attach transaction to source account
        accounts[fromIdx].transactions = accounts[fromIdx].transactions || [];
        accounts[fromIdx].transactions.unshift({ ...transaction, type: "debit" });

        // Attach transaction to destination for internal transfers
        if (transferType === "internal" && destinationAccountId) {
            const toIdx = accounts.findIndex((a) => a.id === destinationAccountId);
            accounts[toIdx].transactions = accounts[toIdx].transactions || [];
            accounts[toIdx].transactions.unshift({ ...transaction, type: "credit" });
        }

        // Commit atomic update
        await updateDoc(userRef, {
            accounts,
            lastUpdated: date,
        });

        return { success: true, transactionId };
    } catch (error) {
        console.error("Transfer error:", error);
        return { success: false, error: "Transfer failed" };
    }
}
