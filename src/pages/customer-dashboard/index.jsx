import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [loans, setLoans] = useState([]);
    const [stats, setStats] = useState({
        totalSent: 0,
        totalReceived: 0,
        totalTransactions: 0,
        sentCount: 0,
        receivedCount: 0
    });
    const [last7DaysData, setLast7DaysData] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                const email = user.email;
                const uid = user.uid;

                // ========== Firestore Listener 1: Customer Data ==========
                const q = query(
                    collection(db, "customers"),
                    where("personalDetails.email", "==", email)
                );
                const unsubscribeSnapshot = onSnapshot(
                    q,
                    (qSnapshot) => {
                        if (qSnapshot.empty || !qSnapshot.docs.length) {
                            navigate('/login');
                            return;
                        }
                        const userDoc = qSnapshot.docs[0].data();
                        const userId = qSnapshot.docs[0].id;
                        setUserData(userDoc);

                        if (userDoc.accounts?.length > 0) {
                            const primaryAccount = userDoc.accounts[0];
                            setCurrentAccount(primaryAccount);
                            calculateStats(primaryAccount);
                            generateLast7DaysData(primaryAccount);
                        }
                        setLoadingDashboard(false);
                    },
                    (error) => {
                        console.error("Error fetching customer data:", error);
                        navigate('/login');
                    }
                );

                // ========== Firestore Listener 2: Loans Subcollection ==========
                const loansRef = collection(db, "customers", uid, "loans");
                const unsubscribeLoans = onSnapshot(
                    loansRef,
                    (querySnap) => {
                        const loansData = querySnap.docs.map(doc => ({
                            ...doc.data(),
                            loanId: doc.id
                        }));
                        setLoans(loansData);
                    },
                    (error) => {
                        console.error("Error fetching loans:", error);
                        setLoans([]);
                    }
                );

                return () => {
                    unsubscribeSnapshot();
                    unsubscribeLoans();
                };
            } catch (error) {
                console.error("Error setting up dashboard:", error);
                navigate('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const calculateStats = (account) => {
        const transactions = account.transactions || [];
        const debitTransactions = transactions.filter(txn => txn.type === 'debit');
        const creditTransactions = transactions.filter(txn => txn.type === 'credit');
        const totalSent = debitTransactions.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
        const totalReceived = creditTransactions.reduce((sum, txn) => sum + txn.amount, 0);
        setStats({
            totalSent,
            totalReceived,
            totalTransactions: transactions.length,
            sentCount: debitTransactions.length,
            receivedCount: creditTransactions.length
        });
    };

    const generateLast7DaysData = (account) => {
        const last7Days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toDateString();
            const daySent = (account.transactions || [])
                .filter(txn => {
                    const txnDate = new Date(txn.date).toDateString();
                    return txnDate === dateStr && txn.type === 'debit';
                })
                .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
            last7Days.push({ day: dayName, amount: daySent });
        }
        setLast7DaysData(last7Days);
    };

    const handleRepeatLastTransfer = () => {
        const lastTransfer = currentAccount?.transactions?.find(txn => txn.type === 'debit');
        if (lastTransfer && lastTransfer.recipientAccount) {
            navigate('/transfer-money', {
                state: {
                    recipientAccount: lastTransfer.recipientAccount,
                    recipientIFSC: lastTransfer.recipientIFSC,
                    amount: lastTransfer.amount
                }
            });
        } else {
            alert('No previous transfers found');
        }
    };

    const handleLoanClick = (loanId) => {
        try {
            navigate(`/loan-details/${loanId}`);
        } catch (error) {
            console.error("Error navigating to loan details:", error);
            alert('Loan details page not available yet');
        }
    };

    if (loadingDashboard || !userData || !currentAccount) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your account...</p>
                </div>
            </div>
        );
    }

    const maxAmount = Math.max(...last7DaysData.map(d => d.amount), 1);

    return (
        <div className="pt-16 min-h-screen bg-gray-50">
            <div className="sticky top-0 z-50 bg-white shadow-md">
                <Header />
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Dashboard', path: '/dashboard' }
                    ]}
                />
                <div className="mb-8 mt-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {userData.personalDetails?.fullName || userData.username}!
                    </h1>
                    <p className="text-gray-600 mt-2">Here's your account overview</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Total Sent</p>
                                <p className="text-3xl font-bold text-red-600">
                                    ₹{typeof stats.totalSent === "number" ? stats.totalSent.toLocaleString() : "—"}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">{stats.sentCount} transfers</p>
                            </div>
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Total Received</p>
                                <p className="text-3xl font-bold text-green-600">
                                    ₹{typeof stats.totalReceived === "number" ? stats.totalReceived.toLocaleString() : "—"}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">{stats.receivedCount} transfers</p>
                            </div>
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Total Transactions</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.totalTransactions}</p>
                                <p className="text-sm text-gray-500 mt-2">All time</p>
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Balance */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-2">Account Balance</p>
                            <p className="text-5xl font-bold text-gray-900 mb-4">
                                ₹{typeof currentAccount.currentBalance === "number" ? currentAccount.currentBalance.toLocaleString() : "—"}
                            </p>
                            <div className="flex gap-6 text-sm flex-wrap">
                                <div>
                                    <p className="text-gray-500">Account Number</p>
                                    <p className="font-semibold text-gray-900">{currentAccount.accountNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">IFSC Code</p>
                                    <p className="font-semibold text-gray-900">{currentAccount.ifscCode}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-sm">Available Balance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ₹{typeof currentAccount.availableBalance === "number" ? currentAccount.availableBalance.toLocaleString() : "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loans Section with Real-time Updates */}
                {loans && loans.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                Your Loans ({loans.length})
                            </h3>
                            <button
                                onClick={() => navigate('/loan-application')}
                                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                            >
                                Apply for New Loan →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {loans.map((loan, idx) => (
                                <div
                                    key={idx}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleLoanClick(loan.loanId)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h4 className="text-lg font-semibold text-gray-900">{loan.loanType}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    loan.status === 'active' || loan.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                        loan.status === 'approved' || loan.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                                            loan.status === 'pending' || loan.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {loan.status || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Loan Amount</p>
                                                    <p className="font-semibold text-gray-900">
                                                        ₹{typeof loan.loanAmount === "number" ? loan.loanAmount.toLocaleString() : "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">EMI</p>
                                                    <p className="font-semibold text-gray-900">
                                                        ₹{typeof loan.emi === "number" ? loan.emi.toLocaleString() : "—"}/mo
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Interest Rate</p>
                                                    <p className="font-semibold text-gray-900">{loan.interestRate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Remaining</p>
                                                    <p className="font-semibold text-gray-900">
                                                        ₹{typeof loan.remainingAmount === "number" ? loan.remainingAmount.toLocaleString() : "—"}
                                                    </p>
                                                </div>
                                            </div>
                                            {(loan.status === 'active' || loan.status === 'Active') && (
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                                                        <span>EMIs Paid: {loan.paidEMIs || 0}/{loan.tenure}</span>
                                                        <span>{((loan.paidEMIs || 0 / (loan.tenure || 1)) * 100).toFixed(0)}% Complete</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${((loan.paidEMIs || 0) / (loan.tenure || 1)) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    {loan.nextEMIDate && (
                                                        <p className="text-xs text-gray-600 mt-2">
                                                            Next EMI: {loan.nextEMIDate}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Loans Section */}
                {(!loans || loans.length === 0) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">No Loans Yet</h3>
                            <p className="text-blue-700 mb-4">Apply for a loan to see it here!</p>
                            <button
                                onClick={() => navigate('/loan-application')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Apply for Loan
                            </button>
                        </div>
                    </div>
                )}

                {/* Activity Chart */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Transfer Activity (Last 7 Days)</h3>
                    <div className="space-y-3">
                        {last7DaysData.map((day, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-16 text-sm font-medium text-gray-600">{day.day}</div>
                                <div className="flex-1">
                                    <div className="bg-gray-200 rounded-full h-8 overflow-hidden relative">
                                        <div
                                            className="bg-blue-500 h-full flex items-center justify-end px-3 text-white text-sm font-semibold transition-all duration-500"
                                            style={{
                                                width: `${day.amount > 0 ? (day.amount / maxAmount) * 100 : 2}%`,
                                                minWidth: day.amount > 0 ? '50px' : '0'
                                            }}
                                        >
                                            {day.amount > 0
                                                ? `₹${typeof day.amount === "number" ? day.amount.toLocaleString() : "—"}`
                                                : null}
                                        </div>
                                        {day.amount === 0 && (
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                No transfers
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/transfer-money')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-gray-900">Send Money</p>
                            <p className="text-sm text-gray-600 mt-1">Transfer funds</p>
                        </button>

                        <button
                            onClick={() => navigate('/transactions')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition group"
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition mb-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-gray-900">View Transactions</p>
                            <p className="text-sm text-gray-600 mt-1">Complete history</p>
                        </button>

                        <button
                            onClick={handleRepeatLastTransfer}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <p className="font-semibold text-gray-900">Repeat Transfer</p>
                            <p className="text-sm text-gray-600 mt-1">Quick resend</p>
                        </button>

                        <button
                            onClick={() => navigate('/loan-application')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition group"
                        >
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition mb-3">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-gray-900">Apply Loan</p>
                            <p className="text-sm text-gray-600 mt-1">Get instant loan</p>
                        </button>
                    </div>
                </div>

                {/* Recent Transactions with Real-time Updates */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                        {currentAccount?.transactions?.length > 10 && (
                            <button
                                onClick={() => navigate('/transactions')}
                                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                            >
                                View All →
                            </button>
                        )}
                    </div>
                    {!currentAccount?.transactions || currentAccount.transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No transactions yet</p>
                            <p className="text-gray-400 text-sm mt-2">Your transaction history will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {currentAccount.transactions.slice(0, 10).map((txn, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                            txn.type === 'debit' ? 'bg-red-500' : 'bg-green-500'
                                        }`}>
                                            {txn.type === 'debit' ? '↑' : '↓'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{txn.description}</p>
                                            <p className="text-sm text-gray-600">{txn.date}</p>
                                            {txn.memo && <p className="text-xs text-gray-500 mt-1">📝 {txn.memo}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${
                                            txn.type === 'debit' ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {txn.type === 'debit' ? '-' : '+'}
                                            ₹{typeof txn.amount === "number" ? Math.abs(txn.amount).toLocaleString() : "—"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Balance: ₹{typeof txn.balance === "number" ? txn.balance.toLocaleString() : "—"}
                                        </p>
                                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                            txn.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {txn.status === 'completed' ? '✓ Completed' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
