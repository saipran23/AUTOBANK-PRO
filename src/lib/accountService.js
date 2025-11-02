import { db } from '../firebase';
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Append a transaction and update balances atomically.
 * @param {string} customerId - Firestore document ID for customer.
 * @param {number} accountIndex - index of account to update (usually 0).
 * @param {"debit" | "credit"} type - transaction type.
 * @param {number} amount - positive transaction amount.
 * @param {object} txnData - additional transaction fields (description, memo, etc).
 * @returns {Promise<{success: boolean; error?: string}>}
 */
export async function addAccountTransaction(customerId, accountIndex, type, amount, txnData = {}) {
    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "customers", customerId);
            const userSnap = await transaction.get(userRef);

            if (!userSnap.exists()) {
                throw new Error("Customer not found");
            }

            const user = userSnap.data();

            if (!Array.isArray(user.accounts) || !user.accounts[accountIndex]) {
                throw new Error("Invalid account index");
            }

            const account = { ...user.accounts[accountIndex] };

            if (type === "debit") {
                if (account.currentBalance < amount) {
                    throw new Error("Insufficient balance");
                }
                account.currentBalance -= amount;
                account.availableBalance -= amount;
            } else if (type === "credit") {
                account.currentBalance += amount;
                account.availableBalance += amount;
            } else {
                throw new Error("Invalid transaction type");
            }

            const now = new Date();

            account.transactions = [
                {
                    id: `TXN${now.getTime()}`,
                    date: now.toLocaleString('en-IN'),
                    type,
                    amount,
                    description: txnData.description || "",
                    status: txnData.status || "completed",
                    balance: account.currentBalance,
                    ...txnData,
                },
                ...(account.transactions || []),
            ];

            const updatedAccounts = [...user.accounts];
            updatedAccounts[accountIndex] = account;

            transaction.update(userRef, { accounts: updatedAccounts });
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
