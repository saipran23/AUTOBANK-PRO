import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import TransferForm from './components/TransferForm';
import TransferConfirmation from './components/TransferConfirmation';
import TransferProgress from './components/TransferProgress';
import TransferSuccess from './components/TransferSuccess';
import { processMoneyTransfer } from '../../utils/transferService';
import { repayEMI } from '../../utils/loanService';
import { auth, db } from '../../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const TransferMoney = () => {
    const navigate = useNavigate();
    const [transactionType, setTransactionType] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        sourceAccount: '',
        destinationAccount: '',
        recipientAccount: '',
        recipientIFSC: '',
        recipientName: '',
        recipientBank: '',
        amount: '',
        memo: '',
        description: '',
        scheduledDate: ''
    });

    const [loanData, setLoanData] = useState({ loanId: '', emiAmount: '', loanType: '' });
    const [accounts, setAccounts] = useState([]);
    const [loans, setLoans] = useState([]);
    const [transactionId, setTransactionId] = useState(null);
    const [transferResult, setTransferResult] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [customerDocId, setCustomerDocId] = useState(null);
    const [transactionProcessed, setTransactionProcessed] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/login');
                return;
            }
            setUserEmail(user.email);

            try {
                // Fetch customer document using email
                const q = query(
                    collection(db, 'customers'),
                    where('personalDetails.email', '==', user.email)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const customerDoc = snapshot.docs[0];
                    const customerId = customerDoc.id;
                    setCustomerDocId(customerId);

                    const userData = customerDoc.data();
                    const fetchedAccounts = userData.accounts || [];
                    setAccounts(fetchedAccounts);
                    if (fetchedAccounts.length > 0) {
                        setFormData((prev) => ({
                            ...prev,
                            sourceAccount: fetchedAccounts[0].accountNumber,
                        }));
                    }

                    // Fetch loans from correct customer path
                    const loansRef = collection(db, "customers", customerId, "loans");
                    const unsubLoans = onSnapshot(loansRef, (querySnap) => {
                        const allLoans = querySnap.docs.map(doc => {
                            const loanDoc = doc.data();
                            return {
                                ...loanDoc,
                                loanId: doc.id
                            };
                        });
                        const activeLoans = allLoans.filter(l => l.status === "Active" || l.status === "active");
                        setLoans(activeLoans);
                    }, (err) => {
                        setLoans([]);
                    });

                    return () => unsubLoans();
                } else {
                    setError('No accounts found for this login.');
                    setAccounts([]);
                    setLoans([]);
                }
            } catch (err) {
                setError('Could not load accounts and loans. Please try again.');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleTypeSelect = (type) => {
        setTransactionType(type);
        setCurrentStep(2);
        setError(null);
        setTransactionProcessed(false);
    };

    const handleGoBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            setTransactionType(null);
            setCurrentStep(1);
        }
        setError(null);
    };

    const handleProceedToConfirmation = () => {
        if (isProcessing || transactionProcessed) {
            setError('Transaction is already being processed. Please wait.');
            return;
        }

        if (transactionType === 'transfer') {
            if (
                !formData.sourceAccount ||
                !formData.amount ||
                !formData.recipientAccount ||
                !formData.recipientIFSC
            ) {
                setError('Please fill all required fields before continuing.');
                return;
            }
        } else if (transactionType === 'repay') {
            if (!loans.length) {
                setError('No active loans available. Please apply for a loan first.');
                return;
            }
            if (!loanData.loanId) {
                setError('Please select a loan to repay.');
                return;
            }
            if (!formData.sourceAccount) {
                setError('Please select a source account.');
                return;
            }
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                setError('Please enter a valid amount.');
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            destinationAccount: formData.recipientAccount
        }));

        setCurrentStep(3);
        window.scrollTo(0, 0);
    };

    const handleEditTransaction = () => {
        setCurrentStep(2);
        setError(null);
    };

    const handleConfirmTransaction = async () => {
        if (isProcessing || transactionProcessed) {
            return;
        }

        setIsProcessing(true);
        setTransactionProcessed(true);
        setError(null);

        try {
            if (transactionType === 'transfer') {
                const finalFormData = {
                    ...formData,
                    destinationAccount: formData.recipientAccount
                };

                const result = await processMoneyTransfer({
                    senderAccountNumber: finalFormData.sourceAccount,
                    recipientAccountNumber: finalFormData.destinationAccount,
                    amount: parseFloat(finalFormData.amount),
                    transferType: 'internal',
                    description: finalFormData.memo || finalFormData.description || '',
                });

                if (result.success && result.data) {
                    setTransactionId(result.data.transactionId);
                    setTransferResult({
                        amount: parseFloat(finalFormData.amount),
                        recipientName: finalFormData.recipientName,
                        transactionId: result.data.transactionId,
                        utrNumber: result.data.utrNumber,
                        timestamp: result.data.timestamp,
                        senderNewBalance: result.data.senderNewBalance,
                        transferStatus: 'completed'
                    });
                    setCurrentStep(4);
                    setTimeout(() => setCurrentStep(5), 2000);
                } else {
                    throw new Error(result.error || 'Transfer failed');
                }
            } else if (transactionType === 'repay') {
                if (!userEmail) throw new Error("User email not found");
                if (!loanData || !loanData.loanId) throw new Error("No loan selected");

                const repayResult = await repayEMI(userEmail, loanData.loanId);

                if (repayResult.success) {
                    const paidAmount = parseFloat(formData.amount) || 0;
                    const timestamp = new Date().toLocaleString('en-IN');
                    const utrNumber = `EMI${Date.now().toString().slice(-8)}`;

                    setTransactionId(`EMI-${Date.now()}`);
                    setTransferResult({
                        amount: paidAmount,
                        recipientName: `${loanData.loanType || 'Loan'} Repayment`,
                        transactionId: `EMI-${Date.now()}`,
                        utrNumber,
                        timestamp,
                        transferStatus: 'completed',
                        loanId: loanData.loanId,
                        loanType: loanData.loanType
                    });
                    setCurrentStep(4);
                    setTimeout(() => setCurrentStep(5), 2000);
                } else {
                    throw new Error(repayResult.error || 'EMI repayment failed');
                }
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setTransactionProcessed(false);
            setCurrentStep(3);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinish = () => {
        setTransactionType(null);
        setCurrentStep(1);
        setFormData({
            sourceAccount: accounts.length > 0 ? accounts[0].accountNumber : '',
            destinationAccount: '',
            recipientAccount: '',
            recipientIFSC: '',
            recipientName: '',
            recipientBank: '',
            amount: '',
            memo: '',
            description: '',
            scheduledDate: ''
        });
        setLoanData({ loanId: '', emiAmount: '', loanType: '' });
        setTransactionId(null);
        setTransferResult({});
        setError(null);
        setTransactionProcessed(false);

        navigate('/account-details');
    };

    const handleLoanSelect = (e) => {
        const selectedLoanId = e.target.value;

        if (!selectedLoanId) {
            setLoanData({ loanId: '', emiAmount: '', loanType: '' });
            setFormData(prev => ({
                ...prev,
                amount: ''
            }));
            return;
        }

        const selectedLoan = loans.find((l) => l.loanId === selectedLoanId);

        let emiAmount = '';
        if (selectedLoan) {
            if (typeof selectedLoan.emi !== 'undefined' && selectedLoan.emi !== null) {
                emiAmount = selectedLoan.emi;
            } else if (selectedLoan.formData && selectedLoan.formData.emi) {
                emiAmount = selectedLoan.formData.emi;
            } // add more fallbacks if needed

            setLoanData({
                loanId: selectedLoanId,
                emiAmount,
                loanType: selectedLoan.loanType || 'Personal Loan'
            });

            // Auto-fill amount if EMI exists and >0 else allow blank
            setFormData(prev => ({
                ...prev,
                amount: emiAmount && parseFloat(emiAmount) > 0 ? emiAmount.toString() : ''
            }));
        } else {
            setLoanData({ loanId: '', emiAmount: '', loanType: '' });
            setFormData(prev => ({
                ...prev,
                amount: ''
            }));
        }
    };

    const steps = [
        { number: 1, title: 'Type', active: currentStep >= 1 },
        { number: 2, title: 'Details', active: currentStep >= 2 },
        { number: 3, title: 'Confirmation', active: currentStep >= 3 },
        { number: 4, title: 'Processing', active: currentStep >= 4 },
        { number: 5, title: 'Complete', active: currentStep >= 5 },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-16">
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <Breadcrumb />

                    <div className="mb-10">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center">
                                <Icon name="Send" size={32} color="white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold text-foreground">
                                    {transactionType === 'transfer'
                                        ? 'Transfer Money'
                                        : transactionType === 'repay'
                                            ? 'Repay Loan'
                                            : 'Transfer & Repayment'}
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    {transactionType === 'transfer'
                                        ? 'Send money securely between accounts'
                                        : transactionType === 'repay'
                                            ? 'Pay your loan EMI easily'
                                            : 'Transfer or repay your loans'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-10">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div
                                    className={`flex items-center space-x-4 ${
                                        step.active ? 'opacity-100' : 'opacity-50'
                                    }`}
                                >
                                    <div
                                        className={`w-14 h-14 text-xl rounded-full flex items-center justify-center font-extrabold ${
                                            step.active
                                                ? 'bg-primary text-white'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {step.number}
                                    </div>
                                    <span className="text-lg font-semibold">{step.title}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-5 rounded ${
                                            step.active ? 'bg-primary' : 'bg-muted'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-lg banking-shadow-md p-8 lg:p-12">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold mb-8">
                                    Select Transaction Type
                                </h2>
                                <div
                                    onClick={() => handleTypeSelect('transfer')}
                                    className="p-8 border-2 border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <div className="flex items-start space-x-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Icon name="Send" size={28} color="#2563eb" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">
                                                Transfer Money
                                            </h3>
                                            <p className="text-base text-muted-foreground mt-1">
                                                Send money to another account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    onClick={() => handleTypeSelect('repay')}
                                    className="p-8 border-2 border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <div className="flex items-start space-x-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Icon name="CheckCircle" size={28} color="#16a34a" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">
                                                Repay Loan
                                            </h3>
                                            <p className="text-base text-muted-foreground mt-1">
                                                Repay your EMI instantly.
                                            </p>
                                            <p className="text-sm text-green-600 mt-3">
                                                {loans.length > 0
                                                    ? `Active loans: ${loans.length}`
                                                    : 'No active loans at the moment'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && transactionType === 'transfer' && (
                            <TransferForm
                                formData={formData}
                                setFormData={setFormData}
                                accounts={accounts}
                                onNext={handleProceedToConfirmation}
                                onBack={handleGoBack}
                            />
                        )}

                        {currentStep === 2 && transactionType === 'repay' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Repay Loan EMI</h2>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Select Source Account
                                    </label>
                                    <select
                                        className="w-full p-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition"
                                        value={formData.sourceAccount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sourceAccount: e.target.value }))}
                                    >
                                        <option value="">Select Account</option>
                                        {accounts && accounts.length > 0 ? (
                                            accounts.map(acc => (
                                                <option key={acc.accountNumber} value={acc.accountNumber}>
                                                    {acc.accountType} - {acc.accountNumber} (Balance: ₹{(acc.currentBalance || 0).toLocaleString('en-IN')})
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No accounts available</option>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Select Loan to Repay
                                    </label>
                                    <select
                                        className="w-full p-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition"
                                        value={loanData.loanId || ''}
                                        onChange={handleLoanSelect}
                                    >
                                        <option value="">Select Loan</option>
                                        {loans && loans.length > 0 ? (
                                            loans.map(loan => {
                                                const loanEMI = parseFloat(loan.emi) || 0;
                                                const loanRemaining = parseFloat(loan.remainingAmount) || 0;
                                                return (
                                                    <option key={loan.loanId} value={loan.loanId}>
                                                        {loan.loanType} - EMI: ₹{loanEMI.toLocaleString('en-IN')} | Remaining: ₹{loanRemaining.toLocaleString('en-IN')}
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option disabled>No active loans found</option>
                                        )}
                                    </select>
                                </div>

                                {/* EMI Amount Display Box - Always shows the EMI value if available, gives guidance otherwise */}
                                {loanData.loanId && (
                                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                                        <p className="text-sm text-gray-600 font-semibold mb-2">EMI Amount from Database</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {loanData.emiAmount && parseFloat(loanData.emiAmount) > 0
                                                ? `₹${parseFloat(loanData.emiAmount).toLocaleString('en-IN')}`
                                                : `Enter your EMI or partial payment below`}
                                        </p>
                                    </div>
                                )}

                                {/* Amount Input Field - always enabled for user entry */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Amount to Pay
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="Enter amount"
                                        min="1"
                                    />
                                    {loanData.loanId && loanData.emiAmount && parseFloat(loanData.emiAmount) > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            ℹ️ This amount is auto-filled from your selected loan EMI. You may edit if making a partial payment.
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 text-lg px-7 py-3"
                                        onClick={handleProceedToConfirmation}
                                        disabled={isProcessing || !loanData.loanId}
                                    >
                                        Proceed to Confirm
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleGoBack}
                                        className="px-7 py-3 text-lg"
                                        disabled={isProcessing}
                                    >
                                        Back
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <TransferConfirmation
                                formData={formData}
                                accounts={accounts}
                                onConfirm={handleConfirmTransaction}
                                onEdit={handleEditTransaction}
                                onBack={handleGoBack}
                                isProcessing={isProcessing || transactionProcessed}
                            />
                        )}

                        {currentStep === 4 && <TransferProgress />}

                        {currentStep === 5 && (
                            <TransferSuccess
                                transferResult={transferResult}
                                transactionType={transactionType}
                                onFinish={handleFinish}
                            />
                        )}

                        {error && currentStep < 5 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-red-800 mb-4 text-lg">
                                <p className="font-semibold">⚠️ Error</p>
                                <p className="mt-2">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 bg-muted p-8 rounded-lg">
                        <div className="flex items-start space-x-5">
                            <Icon
                                name="HelpCircle"
                                size={28}
                                className="text-primary mt-1"
                            />
                            <div>
                                <h3 className="font-semibold text-foreground text-lg">
                                    {transactionType === 'transfer'
                                        ? 'Transfer Limits'
                                        : transactionType === 'repay'
                                            ? 'Loan Repayment'
                                            : 'Transaction Information'}
                                </h3>
                                <p className="text-base text-muted-foreground mt-1">
                                    {transactionType === 'transfer'
                                        ? 'Daily limit ₹5,00,000 | Per transaction ₹2,00,000 | Time: 2–4 hours.'
                                        : 'Amount deducted from your primary account instantly.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TransferMoney;
