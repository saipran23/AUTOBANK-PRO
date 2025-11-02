
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase'; // ✅ CORRECTED PATH (3 levels up)
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const TransferSuccess = ({ transferResult = {}, onNavigate }) => {
    const navigate = useNavigate();

    // Original data from transfer result
    const amount = transferResult.amount ?? 0;
    const recipientName = transferResult.recipientName || '—';
    const transactionId = transferResult.transactionId || '—';
    const utrNumber = transferResult.utrNumber || '—';
    const timestamp = transferResult.timestamp || new Date().toLocaleString();
    const senderNewBalance = transferResult.senderNewBalance ?? 0;

    // ✅ NEW: State for real-time balance from Firestore
    const [updatedBalance, setUpdatedBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(true);

    // ════════════════════════════════════════════════════════════════════════════════
    // ✅ NEW: useEffect WITH REAL-TIME onSnapshot LISTENER FOR BALANCE
    // ════════════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        console.log("💰 TransferSuccess: Setting up real-time balance listener...");

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.log("❌ TransferSuccess: No user authenticated");
                setLoadingBalance(false);
                return;
            }

            try {
                // Query current user from Firestore
                const q = query(
                    collection(db, 'customers'),
                    where('personalDetails.email', '==', user.email)
                );

                console.log("✓ TransferSuccess: Subscribing to real-time balance updates...");

                // ✅ Use onSnapshot to get latest balance
                const unsubscribeSnapshot = onSnapshot(
                    q,
                    (snapshot) => {
                        // This callback fires when user data changes
                        // Ensures we always display the latest balance from Firestore

                        console.log("✓ TransferSuccess: Balance update received from Firestore");

                        if (!snapshot.empty) {
                            const userData = snapshot.docs[0].data();

                            // Get primary account or first account
                            if (userData.accounts && userData.accounts.length > 0) {
                                const account = userData.accounts.find((acc) => acc.isPrimary) || userData.accounts[0];

                                // ✅ Update state with latest balance from Firestore
                                setUpdatedBalance(account.currentBalance);
                                console.log("💰 TransferSuccess: New balance received:", account.currentBalance);
                            }
                        }

                        setLoadingBalance(false);
                    },
                    (error) => {
                        console.error('❌ TransferSuccess: Real-time listener error:', error);
                        setLoadingBalance(false);
                    }
                );

                // ✅ CLEANUP: Return unsubscribe function
                return () => {
                    console.log("🧹 TransferSuccess: Cleaning up balance listener");
                    unsubscribeSnapshot();
                };
            } catch (error) {
                console.error('❌ TransferSuccess: Error loading updated balance:', error);
                setLoadingBalance(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // ✅ Display balance: Use latest from Firestore if available, otherwise use transfer result
    const displayBalance = updatedBalance !== null ? updatedBalance : senderNewBalance;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <div className="max-w-md mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8 pt-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Your money has been transferred successfully
                    </h1>
                    <p className="text-gray-600">The recipient will receive the funds shortly</p>
                </div>

                {/* Amount Display Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <p className="text-center text-gray-600 mb-3">Amount Transferred</p>
                    <p className="text-center text-5xl font-bold text-green-600 mb-2">
                        ₹{amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-center text-gray-600">to {recipientName}</p>
                </div>

                {/* Transaction Details Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>

                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-semibold text-gray-900 text-sm">{transactionId}</span>
                        </div>

                        {utrNumber && utrNumber !== '—' && (
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">UTR Number:</span>
                                <span className="font-semibold text-gray-900 text-sm">{utrNumber}</span>
                            </div>
                        )}

                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Date & Time:</span>
                            <span className="font-semibold text-gray-900 text-sm">{timestamp}</span>
                        </div>

                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Status:</span>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                ✓ Completed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Updated Balance Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your New Account Balance</h3>

                    {loadingBalance ? (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                            <p className="text-blue-700 text-sm">Updating balance from server...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-5xl font-bold text-blue-600 text-center mb-3">
                                ₹{displayBalance.toLocaleString('en-IN')}
                            </p>
                            <p className="text-center text-sm text-gray-600">
                                ✓ Your balance has been updated across all accounts and dashboards
                            </p>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/account-details')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Go to Dashboard
                    </button>

                    <button
                        onClick={() => navigate('/accounts')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        View All Accounts
                    </button>
                    <button
                        onClick={() => navigate('/transfer-money')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Send Another Transfer
                    </button>
                </div>

                {/* Info Message */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-sm text-yellow-700">
                        <strong>✓ Real-Time Updates:</strong> Your dashboard and all account pages are automatically updated. No refresh needed!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TransferSuccess;