import { db } from '../firebase';
import {
    collection,
    addDoc,
    doc,
    getDoc,
    runTransaction,
    serverTimestamp,
    query,
    where,
    getDocs
} from 'firebase/firestore';

// ⭐ FIXED: Search by personalDetails.email (nested field in Firestore)
// NOTE: Must be called OUTSIDE runTransaction — getDocs is not transactional.
const findCustomerByEmail = async (email) => {
    try {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, where('personalDetails.email', '==', email));
        const snap = await getDocs(q);

        if (snap.empty) {
            throw new Error(`Customer not found with email: ${email}`);
        }

        return {
            docId: snap.docs[0].id,
            data: snap.docs[0].data()
        };
    } catch (err) {
        throw err;
    }
};

export const calculateEMI = (principal, annualRate, tenureMonths) => {
    if (!principal || !tenureMonths) return 0;
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return Math.round(principal / tenureMonths);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi);
};

export const generateLoanId = () => {
    return `LOAN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

export const getInterestRate = (loanType, creditScore) => {
    const baseRates = {
        'Personal Loan': 12,
        'Home Loan': 8.5,
        'Car Loan': 9.5,
        'Education Loan': 7.5,
        'Business Loan': 11,
    };
    let rate = baseRates[loanType] || 10;
    if (creditScore >= 750) rate -= 1;
    else if (creditScore < 650) rate += 2;
    return rate;
};

export const createLoanApplication = async (customerEmail, loanData) => {
    try {
        const loanAmount = parseFloat(loanData.loanAmount) || 0;
        const tenure = loanData.loanTerm || loanData.tenure || 12;

        if (loanAmount <= 0) {
            return { success: false, error: 'Loan amount must be greater than 0' };
        }

        const interestRate = getInterestRate(loanData.loanType, loanData.creditScore || 650);
        const emi = calculateEMI(loanAmount, interestRate, tenure);
        const totalRepayment = emi * tenure;
        const totalInterest = totalRepayment - loanAmount;

        const application = {
            ...loanData,
            email: customerEmail, // Store email as identifier
            loanAmount,
            loanTerm: tenure,
            interestRate,
            emi,
            totalRepayment,
            totalInterest,
            status: 'Pending Review',
            createdAt: serverTimestamp(),
            timeline: [
                {
                    status: 'applied',
                    date: new Date().toLocaleString('en-IN'),
                    description: 'Loan application submitted'
                }
            ]
        };

        const applicationsCol = collection(db, "loanApplications");
        const docRef = await addDoc(applicationsCol, application);

        return { success: true, appId: docRef.id };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const approveLoanApplication = async (appId, customerEmail) => {
    try {
        console.log("🔄 Starting approval for appId:", appId, "customerEmail:", customerEmail);

        if (!customerEmail) {
            return { success: false, error: 'Missing customer email' };
        }

        const appSnap = await getDoc(doc(db, "loanApplications", appId));
        if (!appSnap.exists()) {
            return { success: false, error: 'Application not found' };
        }

        const loanData = appSnap.data();

        let loanAmount = loanData.loanAmount ||
            (loanData.formData && loanData.formData.loanAmount) ||
            null;

        if (!loanAmount) {
            return { success: false, error: 'Loan amount is missing from application.' };
        }

        loanAmount = parseFloat(loanAmount);
        if (isNaN(loanAmount) || loanAmount <= 0) {
            return { success: false, error: 'Invalid loan amount in application' };
        }

        // Find customer BEFORE the transaction (getDocs cannot be used inside runTransaction)
        const customerInfo = await findCustomerByEmail(customerEmail);

        return await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, 'customers', customerInfo.docId);

            // Read the user document atomically within the transaction
            const userSnap = await transaction.get(userDocRef);
            if (!userSnap.exists()) {
                throw new Error('Customer document not found');
            }
            const user = userSnap.data();

            if (!user.accounts || !Array.isArray(user.accounts) || user.accounts.length === 0) {
                throw new Error('Customer has no valid accounts.');
            }

            // 2. Create loan document in customer's loans subcollection
            const loanId = generateLoanId();
            const loanDocRef = doc(collection(db, "customers", customerInfo.docId, "loans"), loanId);

            const loanRecord = {
                ...loanData,
                loanId,
                loanAmount: loanAmount,
                status: 'Active',
                approvedDate: serverTimestamp(),
                disbursedDate: serverTimestamp(),
                remainingAmount: loanAmount,
                paidEMIs: 0,
                nextEMIDate: null,
                timeline: [
                    ...(loanData.timeline || []),
                    {
                        status: 'approved',
                        date: new Date().toLocaleString('en-IN'),
                        description: 'Loan approved by bank'
                    },
                    {
                        status: 'disbursed',
                        date: new Date().toLocaleString('en-IN'),
                        description: `₹${loanAmount.toLocaleString('en-IN')} credited to your account`
                    }
                ]
            };

            transaction.set(loanDocRef, loanRecord);

            // UPDATE EXISTING CUSTOMER'S PRIMARY ACCOUNT BALANCE
            const account = { ...user.accounts[0] };

            const currentBalance = parseFloat(account.currentBalance) || 0;
            const availableBalance = parseFloat(account.availableBalance) || 0;

            account.currentBalance = currentBalance + loanAmount;
            account.availableBalance = availableBalance + loanAmount;

            // Add transaction record to account
            const transaction_record = {
                id: "TXN" + Date.now(),
                date: new Date().toLocaleString('en-IN'),
                description: `Loan Disbursement - ${loanData.loanType || 'Personal Loan'}`,
                type: 'credit',
                category: 'Loan',
                amount: loanAmount,
                balance: account.currentBalance,
                status: 'completed',
                memo: `Loan ID: ${loanId}`,
                method: 'Bank Transfer',
                referenceId: loanId
            };

            account.transactions = [
                transaction_record,
                ...(account.transactions || [])
            ];

            const updatedAccounts = [account, ...user.accounts.slice(1)];

            transaction.update(userDocRef, {
                accounts: updatedAccounts,
                lastUpdated: serverTimestamp()
            });

            // Update application status
            const appDocRef = doc(db, "loanApplications", appId);
            transaction.update(appDocRef, {
                status: 'Approved',
                approvalDate: serverTimestamp(),
                loanId: loanId,
                timeline: [
                    ...(loanData.timeline || []),
                    {
                        status: 'approved',
                        date: new Date().toLocaleString('en-IN'),
                        description: 'Loan approved and disbursed'
                    }
                ]
            });

            return {
                success: true,
                loanId,
                customerEmail,
                newBalance: account.currentBalance
            };
        });

    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const repayEMI = async (customerEmail, loanId) => {
    try {
        // Find customer BEFORE the transaction (getDocs cannot be used inside runTransaction)
        const customerInfo = await findCustomerByEmail(customerEmail);

        return await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'customers', customerInfo.docId);
            const loanRef = doc(db, 'customers', customerInfo.docId, "loans", loanId);

            // Read both documents atomically within the transaction
            const [userSnap, loanSnap] = await Promise.all([
                transaction.get(userRef),
                transaction.get(loanRef),
            ]);

            if (!userSnap.exists()) throw new Error('Customer document not found');
            if (!loanSnap.exists()) throw new Error('Loan not found');

            const userData = userSnap.data();
            const loan = loanSnap.data();

            // Guard: do not process payment on a closed loan
            if (loan.status === 'Closed' || loan.status === 'closed') {
                throw new Error('This loan is already fully repaid');
            }

            if (!userData.accounts || userData.accounts.length === 0) {
                throw new Error('Customer has no valid accounts');
            }

            const account = { ...userData.accounts[0] };
            const emiAmount = parseFloat(loan.emi) || 0;
            const currentBal = parseFloat(account.currentBalance) || 0;

            if (currentBal < emiAmount) {
                throw new Error('Insufficient balance for EMI payment');
            }

            account.currentBalance = currentBal - emiAmount;
            account.availableBalance = Math.max(0, (parseFloat(account.availableBalance) || 0) - emiAmount);

            const paidEMIs = (loan.paidEMIs || 0) + 1;
            const loanTerm = loan.loanTerm || 12;
            const remainingAmount = Math.max(0, (loan.remainingAmount || loan.loanAmount) - emiAmount);

            let status = loan.status;
            let nextEMIDate = null;

            if (paidEMIs >= loanTerm || remainingAmount <= 0) {
                status = 'Closed';
            } else {
                const nextEMI = new Date();
                nextEMI.setDate(nextEMI.getDate() + 30);
                nextEMIDate = nextEMI.toLocaleDateString('en-IN');
            }

            const emiTransaction = {
                id: 'TXN' + Date.now(),
                date: new Date().toLocaleString('en-IN'),
                description: `Loan EMI Payment - ${loan.loanType || 'Personal Loan'}`,
                type: 'debit',
                category: 'Loan Repayment',
                amount: emiAmount,
                balance: account.currentBalance,
                status: 'completed',
                memo: `Loan ID: ${loanId}, EMI ${paidEMIs}/${loanTerm}`,
                method: 'Auto Debit',
                referenceId: loanId
            };

            account.transactions = [
                emiTransaction,
                ...(account.transactions || [])
            ];

            const timeline = [
                ...(loan.timeline || []),
                {
                    status: 'emi_paid',
                    date: new Date().toLocaleString('en-IN'),
                    description: `EMI ${paidEMIs} of ${loanTerm} paid - ₹${emiAmount.toLocaleString('en-IN')}`
                }
            ];

            if (status === 'Closed') {
                timeline.push({
                    status: 'closed',
                    date: new Date().toLocaleString('en-IN'),
                    description: 'Loan fully repaid'
                });
            }

            transaction.update(userRef, {
                accounts: [account, ...userData.accounts.slice(1)],
                lastUpdated: serverTimestamp()
            });

            transaction.update(loanRef, {
                paidEMIs,
                remainingAmount,
                nextEMIDate,
                status,
                timeline,
                lastUpdated: serverTimestamp()
            });

            return { success: true };
        });
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const getCustomerLoans = async (customerEmail) => {
    try {
        const customerInfo = await findCustomerByEmail(customerEmail);
        return { success: true, data: customerInfo.data };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export default {
    calculateEMI,
    generateLoanId,
    getInterestRate,
    createLoanApplication,
    approveLoanApplication,
    repayEMI,
    getCustomerLoans,
    findCustomerByEmail
};
