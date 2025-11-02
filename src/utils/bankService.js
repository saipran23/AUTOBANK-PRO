const STORAGE_KEY = "autobank_data";
const CURRENT_USER_KEY = "autobank_current_user";

// Auto-set default user if none exists
const ensureCurrentUser = () => {
    let user = localStorage.getItem(CURRENT_USER_KEY);
    if (!user) {
        user = "Customer"; // Default user
        localStorage.setItem(CURRENT_USER_KEY, user);
    }
    return user;
};

// Get current logged-in user
const getCurrentUser = () => {
    return ensureCurrentUser();
};

// Set current user
export const setCurrentUser = (username) => {
    localStorage.setItem(CURRENT_USER_KEY, username);
};

// Get storage key for current user
const getStorageKey = () => {
    const user = getCurrentUser();
    return `${STORAGE_KEY}_${user}`;
};

// Initialize bank data for a new user
const initializeBankData = () => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const data = {
        accounts: [
            {
                id: "acc_001",
                name: "Primary Checking Account",
                accountNumber: `${Math.floor(Math.random() * 10000000000)}`,
                number: `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                type: "Checking",
                currentBalance: 1000,
                availableBalance: 1000,
                isPrimary: true,
                transactions: [
                    {
                        id: "TXN001",
                        date: new Date(now - 6 * oneDayMs).toLocaleString(),
                        description: "Welcome Bonus - Account Opening",
                        type: "credit",
                        amount: 1000,
                        balance: 1000,
                        status: "completed",
                    },
                ],
            },
        ],
        beneficiaries: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
    };

    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(data));
    return data;
};

// Get bank data for current user
export const getBankData = () => {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);

    if (stored) {
        try {
            const data = JSON.parse(stored);
            if (data.accounts && Array.isArray(data.accounts)) {
                return data;
            }
        } catch (e) {
            console.error("Error parsing bank data:", e);
        }
    }

    return initializeBankData();
};

// Save bank data for current user
const saveBankData = (data) => {
    data.lastUpdated = new Date().toISOString();
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(data));
};

export const getAccounts = () => {
    return getBankData().accounts;
};

export const getAccountById = (accountId) => {
    return getAccounts().find((acc) => acc.id === accountId);
};

export const getBeneficiaries = () => {
    return getBankData().beneficiaries || [];
};

export const getAllTransactions = () => {
    const accounts = getAccounts();
    return accounts.flatMap((acc) => acc.transactions || []);
};

// Get all available recipients (excluding current user)
export const getAllRecipients = () => {
    const recipients = [];
    const currentUser = getCurrentUser();

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${STORAGE_KEY}_`)) {
            const username = key.replace(`${STORAGE_KEY}_`, '');

            if (username === currentUser) continue;

            try {
                const userData = JSON.parse(localStorage.getItem(key));

                if (userData && userData.accounts) {
                    userData.accounts.forEach(acc => {
                        recipients.push({
                            username,
                            displayName: username,
                            accountId: acc.id,
                            accountName: acc.name,
                            accountNumber: acc.accountNumber,
                            accountType: acc.type,
                            label: `${username} - ${acc.name} (${acc.accountNumber || 'N/A'})`
                        });
                    });
                }
            } catch (e) {
                console.error("Error reading user data:", e);
            }
        }
    }

    return recipients;
};

// Quick Deposit
export const quickDeposit = (accountId, amount, description) => {
    const data = getBankData();
    const account = data.accounts.find((a) => a.id === accountId);

    if (!account) throw new Error("Account not found");
    if (amount <= 0) throw new Error("Amount must be positive");

    amount = parseFloat(amount);

    account.currentBalance += amount;
    account.availableBalance += amount;

    const txnId = `TXN${Date.now()}`;
    const timestamp = new Date().toLocaleString();

    account.transactions.unshift({
        id: txnId,
        date: timestamp,
        description: description || "Deposit",
        type: "credit",
        amount: amount,
        balance: account.currentBalance,
        status: "completed",
    });

    saveBankData(data);
    return { success: true, transactionId: txnId };
};

// Quick Withdraw
export const quickWithdraw = (accountId, amount, description) => {
    const data = getBankData();
    const account = data.accounts.find((a) => a.id === accountId);

    if (!account) throw new Error("Account not found");

    amount = parseFloat(amount);

    if (account.currentBalance < amount) throw new Error("Insufficient funds");
    if (amount <= 0) throw new Error("Amount must be positive");

    account.currentBalance -= amount;
    account.availableBalance -= amount;

    const txnId = `TXN${Date.now()}`;
    const timestamp = new Date().toLocaleString();

    account.transactions.unshift({
        id: txnId,
        date: timestamp,
        description: description || "Withdrawal",
        type: "debit",
        amount: -amount,
        balance: account.currentBalance,
        status: "completed",
    });

    saveBankData(data);
    return { success: true, transactionId: txnId };
};

// Internal Transfer (between own accounts)
export const performTransfer = (sourceId, destinationId, amount, memo) => {
    const data = getBankData();
    const source = data.accounts.find((a) => a.id === sourceId);
    const dest = data.accounts.find((a) => a.id === destinationId);

    if (!source || !dest) throw new Error("Account not found");

    amount = parseFloat(amount);

    if (source.currentBalance < amount) throw new Error("Insufficient funds");

    source.currentBalance -= amount;
    dest.currentBalance += amount;

    const txnId = `TXN${Date.now()}`;
    const timestamp = new Date().toLocaleString();

    source.transactions.unshift({
        id: txnId,
        date: timestamp,
        description: `Transfer to ${dest.name}`,
        type: "debit",
        amount: -amount,
        balance: source.currentBalance,
        status: "completed",
        memo: memo,
    });

    dest.transactions.unshift({
        id: txnId,
        date: timestamp,
        description: `Transfer from ${source.name}`,
        type: "credit",
        amount: amount,
        balance: dest.currentBalance,
        status: "completed",
        memo: memo,
    });

    saveBankData(data);
    return { success: true, transactionId: txnId };
};

// P2P Transfer (to another user)
export const performP2PTransfer = (sourceAccountId, recipientUsername, recipientAccountId, amount, memo) => {
    const currentUser = getCurrentUser();

    amount = parseFloat(amount);

    // Validate amount
    if (!amount || amount <= 0) {
        throw new Error("Amount must be greater than 0");
    }

    if (amount > 100000) {
        throw new Error("Transfer limit exceeded. Maximum ₹1,00,000 per transaction");
    }

    // Get sender's data
    const senderData = getBankData();
    const sourceAccount = senderData.accounts.find(a => a.id === sourceAccountId);

    if (!sourceAccount) {
        throw new Error("Source account not found");
    }

    if (sourceAccount.currentBalance < amount) {
        throw new Error(`Insufficient funds. Available: ₹${sourceAccount.currentBalance.toFixed(2)}`);
    }

    // Prevent transfer to self
    if (recipientUsername === currentUser) {
        throw new Error("Cannot transfer to your own account. Use internal transfer instead.");
    }

    // Get recipient's data
    const recipientKey = `${STORAGE_KEY}_${recipientUsername}`;
    const recipientDataRaw = localStorage.getItem(recipientKey);

    if (!recipientDataRaw) {
        throw new Error("Recipient not found");
    }

    const recipientData = JSON.parse(recipientDataRaw);
    const recipientAccount = recipientData.accounts.find(a => a.id === recipientAccountId);

    if (!recipientAccount) {
        throw new Error("Recipient account not found");
    }

    // Perform transfer
    const txnId = `TXN${Date.now()}`;
    const utrNumber = `UTR${Date.now().toString().slice(-10)}`;
    const timestamp = new Date().toLocaleString();

    // Deduct from sender
    sourceAccount.currentBalance -= amount;
    sourceAccount.availableBalance -= amount;

    sourceAccount.transactions.unshift({
        id: txnId,
        utrNumber: utrNumber,
        date: timestamp,
        description: `Sent to ${recipientUsername}`,
        recipientName: recipientUsername,
        recipientAccount: recipientAccount.name,
        type: "debit",
        amount: -amount,
        balance: sourceAccount.currentBalance,
        status: "completed",
        memo: memo || "",
    });

    // Add to recipient
    recipientAccount.currentBalance += amount;
    recipientAccount.availableBalance += amount;

    recipientAccount.transactions.unshift({
        id: txnId,
        utrNumber: utrNumber,
        date: timestamp,
        description: `Received from ${currentUser}`,
        senderName: currentUser,
        senderAccount: sourceAccount.name,
        type: "credit",
        amount: amount,
        balance: recipientAccount.currentBalance,
        status: "completed",
        memo: memo || "",
    });

    // Save both users' data
    recipientData.lastUpdated = new Date().toISOString();
    senderData.lastUpdated = new Date().toISOString();

    const currentKey = getStorageKey();
    localStorage.setItem(currentKey, JSON.stringify(senderData));
    localStorage.setItem(recipientKey, JSON.stringify(recipientData));

    return {
        success: true,
        transactionId: txnId,
        utrNumber: utrNumber,
        timestamp: timestamp,
        from: currentUser,
        to: recipientUsername,
        amount: amount
    };
};

export const addBeneficiary = (beneficiaryData) => {
    const data = getBankData();

    const newBeneficiary = {
        id: `ben_${Date.now()}`,
        name: beneficiaryData.name,
        accountNumber: beneficiaryData.accountNumber,
        bankName: beneficiaryData.bankName,
        ifscCode: beneficiaryData.ifscCode,
        addedOn: new Date().toISOString(),
    };

    data.beneficiaries.push(newBeneficiary);
    saveBankData(data);

    return { success: true, beneficiary: newBeneficiary };
};
