import { db } from "../firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";

/**
 * Verify recipient account details from Firestore
 * @param {string} accountNumber - 13-digit account number
 * @param {string} ifscCode - 11-character IFSC code
 * @returns {Promise} Verification result with recipient details
 */
export const verifyAccountDetails = async (accountNumber, ifscCode) => {
    try {
        if (!accountNumber || accountNumber.length !== 13) {
            return { success: false, error: "Invalid account number (must be 13 digits)" };
        }

        if (!ifscCode || ifscCode.length !== 11) {
            return { success: false, error: "Invalid IFSC code (must be 11 characters)" };
        }

        // Query Firestore to find account
        const customersRef = collection(db, "customers");
        const snapshot = await getDocs(customersRef);

        let foundAccount = null;

        for (const docSnapshot of snapshot.docs) {
            const userData = docSnapshot.data();
            if (userData.accounts && Array.isArray(userData.accounts)) {
                const account = userData.accounts.find(
                    acc => String(acc.accountNumber) === String(accountNumber)
                );
                if (account) {
                    foundAccount = { ...account, userId: docSnapshot.id };
                    break;
                }
            }
        }

        if (!foundAccount) {
            return { success: false, error: "Account not found" };
        }

        // Verify IFSC matches
        if (foundAccount.ifscCode !== ifscCode) {
            return { success: false, error: "IFSC code does not match" };
        }

        return {
            success: true,
            recipientName: foundAccount.name || "Unknown",
            recipientBank: foundAccount.bank || "Bank Name",
            accountNumber: foundAccount.accountNumber,
            ifscCode: foundAccount.ifscCode,
            accountType: foundAccount.type || "Savings",
        };
    } catch (error) {
        console.error("Account verification error:", error);
        return { success: false, error: error.message || "Verification failed" };
    }
};

/**
 * Process money transfer between accounts (internal only)
 * @param {object} transferData - Transfer details
 * @returns {Promise} Transaction result
 */
export const processMoneyTransfer = async (transferData) => {
    const {
        senderAccountNumber,
        recipientAccountNumber,
        amount,
        transferType = "internal",
        description = "",
    } = transferData;

    try {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return { success: false, error: "Invalid transfer amount" };
        }

        // Find sender and recipient in Firestore
        const customersRef = collection(db, "customers");
        const snapshot = await getDocs(customersRef);

        let senderData = null;
        let recipientData = null;
        let senderUserRef = null;
        let recipientUserRef = null;

        for (const docSnapshot of snapshot.docs) {
            const userData = docSnapshot.data();
            if (userData.accounts && Array.isArray(userData.accounts)) {
                const senderAccount = userData.accounts.find(
                    acc => String(acc.accountNumber) === String(senderAccountNumber)
                );
                if (senderAccount) {
                    senderData = userData;
                    senderUserRef = docSnapshot.ref;
                }

                const recipientAccount = userData.accounts.find(
                    acc => String(acc.accountNumber) === String(recipientAccountNumber)
                );
                if (recipientAccount) {
                    recipientData = userData;
                    recipientUserRef = docSnapshot.ref;
                }
            }
        }

        if (!senderData || !senderUserRef) {
            return { success: false, error: "Sender account not found" };
        }

        if (transferType === "internal" && (!recipientData || !recipientUserRef)) {
            return { success: false, error: "Recipient account not found" };
        }

        // Validate balance
        const senderAccount = senderData.accounts.find(
            acc => String(acc.accountNumber) === String(senderAccountNumber)
        );

        const currentBalance = senderAccount.currentBalance || 0;
        if (currentBalance < parsedAmount) {
            return { success: false, error: `Insufficient balance. Available: ₹${currentBalance}` };
        }

        // Create transaction ID and UTR
        const transactionId = `TXN${Date.now()}`;
        const utrNumber = `UTR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const timestamp = new Date().toISOString();
        const dateStr = new Date().toLocaleDateString("en-IN");

        // Update sender account
        const updatedSenderAccounts = senderData.accounts.map(acc => {
            if (String(acc.accountNumber) === String(senderAccountNumber)) {
                const newBalance = acc.currentBalance - parsedAmount;
                return {
                    ...acc,
                    currentBalance: newBalance,
                    availableBalance: newBalance,
                    transactions: [
                        {
                            id: transactionId,
                            type: "debit",
                            amount: parsedAmount,
                            description: description || `Transfer to ${recipientAccountNumber}`,
                            date: dateStr,
                            timestamp,
                            status: "completed",
                            toAccount: recipientAccountNumber,
                            utrNumber,
                        },
                        ...(acc.transactions || []),
                    ],
                };
            }
            return acc;
        });

        await updateDoc(senderUserRef, {
            accounts: updatedSenderAccounts,
            lastUpdated: timestamp,
        });

        // Update recipient account for internal transfer
        if (transferType === "internal" && recipientUserRef) {
            const updatedRecipientAccounts = recipientData.accounts.map(acc => {
                if (String(acc.accountNumber) === String(recipientAccountNumber)) {
                    const newBalance = acc.currentBalance + parsedAmount;
                    return {
                        ...acc,
                        currentBalance: newBalance,
                        availableBalance: newBalance,
                        transactions: [
                            {
                                id: transactionId,
                                type: "credit",
                                amount: parsedAmount,
                                description: description || `Received from ${senderAccountNumber}`,
                                date: dateStr,
                                timestamp,
                                status: "completed",
                                fromAccount: senderAccountNumber,
                                utrNumber,
                            },
                            ...(acc.transactions || []),
                        ],
                    };
                }
                return acc;
            });

            await updateDoc(recipientUserRef, {
                accounts: updatedRecipientAccounts,
                lastUpdated: timestamp,
            });
        }

        const recipientAccount = transferType === "internal"
            ? recipientData.accounts.find(acc => String(acc.accountNumber) === String(recipientAccountNumber))
            : null;

        return {
            success: true,
            data: {
                transactionId,
                utrNumber,
                timestamp,
                amount: parsedAmount,
                senderNewBalance: senderAccount.currentBalance - parsedAmount,
                recipientNewBalance: recipientAccount
                    ? recipientAccount.currentBalance + parsedAmount
                    : 0,
                recipientName: recipientAccount?.name || "Unknown",
                description: description || "Transfer completed",
            },
        };
    } catch (error) {
        console.error("Transfer processing error:", error);
        return { success: false, error: error.message || "Transfer processing failed" };
    }
};

export default { verifyAccountDetails, processMoneyTransfer };
