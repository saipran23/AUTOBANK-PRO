import { db } from "../firebase";
import { doc, collection, getDocs, runTransaction } from "firebase/firestore";

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
        return { success: false, error: error.message || "Verification failed" };
    }
};

/**
 * Find the Firestore document reference for a given account number.
 * Returns { ref, docId } or null if not found.
 */
const findAccountDocRef = async (accountNumber) => {
    const snapshot = await getDocs(collection(db, "customers"));
    for (const docSnapshot of snapshot.docs) {
        const userData = docSnapshot.data();
        if (userData.accounts && Array.isArray(userData.accounts)) {
            const found = userData.accounts.find(
                acc => String(acc.accountNumber) === String(accountNumber)
            );
            if (found) {
                return { ref: docSnapshot.ref, docId: docSnapshot.id };
            }
        }
    }
    return null;
};

/**
 * Process money transfer between accounts using an atomic Firestore transaction.
 * Prevents partial updates, double-spending, and self-transfers.
 *
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
        fee = 0,
    } = transferData;

    try {
        const parsedAmount = parseFloat(amount);
        const parsedFee = parseFloat(fee) || 0;

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return { success: false, error: "Invalid transfer amount" };
        }

        if (String(senderAccountNumber) === String(recipientAccountNumber)) {
            return { success: false, error: "Cannot transfer to the same account" };
        }

        const totalDebit = parsedAmount + parsedFee;

        // Locate document references BEFORE the transaction (getDocs is not allowed inside runTransaction)
        const senderDocInfo = await findAccountDocRef(senderAccountNumber);
        if (!senderDocInfo) {
            return { success: false, error: "Sender account not found" };
        }

        let recipientDocInfo = null;
        if (transferType === "internal") {
            recipientDocInfo = await findAccountDocRef(recipientAccountNumber);
            if (!recipientDocInfo) {
                return { success: false, error: "Recipient account not found" };
            }
        }

        const transactionId = `TXN${Date.now()}`;
        const utrNumber = `UTR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const timestamp = new Date().toISOString();
        const dateStr = new Date().toLocaleDateString("en-IN");

        return await runTransaction(db, async (transaction) => {
            // Read both documents atomically within the transaction
            const senderSnap = await transaction.get(senderDocInfo.ref);
            if (!senderSnap.exists()) {
                throw new Error("Sender account not found");
            }
            const senderData = senderSnap.data();

            let recipientData = null;
            if (recipientDocInfo) {
                const recipientSnap = await transaction.get(recipientDocInfo.ref);
                if (!recipientSnap.exists()) {
                    throw new Error("Recipient account not found");
                }
                recipientData = recipientSnap.data();
            }

            // Re-validate balance inside the transaction (prevents race conditions)
            const senderAccount = senderData.accounts.find(
                acc => String(acc.accountNumber) === String(senderAccountNumber)
            );
            if (!senderAccount) {
                throw new Error("Sender account not found in document");
            }

            const currentBalance = senderAccount.currentBalance || 0;
            if (currentBalance < totalDebit) {
                throw new Error(
                    `Insufficient balance. Available: ₹${currentBalance.toLocaleString("en-IN")}`
                );
            }

            const newSenderBalance = currentBalance - totalDebit;

            // Build updated sender accounts array
            const updatedSenderAccounts = senderData.accounts.map(acc => {
                if (String(acc.accountNumber) === String(senderAccountNumber)) {
                    return {
                        ...acc,
                        currentBalance: newSenderBalance,
                        availableBalance: newSenderBalance,
                        transactions: [
                            {
                                id: transactionId,
                                type: "debit",
                                amount: parsedAmount,
                                fee: parsedFee,
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

            transaction.update(senderDocInfo.ref, {
                accounts: updatedSenderAccounts,
                lastUpdated: timestamp,
            });

            // Credit recipient for internal transfers
            let recipientNewBalance = 0;
            if (transferType === "internal" && recipientData && recipientDocInfo) {
                const recipientAccount = recipientData.accounts.find(
                    acc => String(acc.accountNumber) === String(recipientAccountNumber)
                );
                recipientNewBalance = (recipientAccount?.currentBalance || 0) + parsedAmount;

                const updatedRecipientAccounts = recipientData.accounts.map(acc => {
                    if (String(acc.accountNumber) === String(recipientAccountNumber)) {
                        return {
                            ...acc,
                            currentBalance: recipientNewBalance,
                            availableBalance: recipientNewBalance,
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

                transaction.update(recipientDocInfo.ref, {
                    accounts: updatedRecipientAccounts,
                    lastUpdated: timestamp,
                });
            }

            return {
                success: true,
                data: {
                    transactionId,
                    utrNumber,
                    timestamp,
                    amount: parsedAmount,
                    fee: parsedFee,
                    senderNewBalance: newSenderBalance,
                    recipientNewBalance,
                    description: description || "Transfer completed",
                },
            };
        });
    } catch (error) {
        return { success: false, error: error.message || "Transfer processing failed" };
    }
};

export default { verifyAccountDetails, processMoneyTransfer };
