
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { processMoneyTransfer } from '../../../utils/transferService';
import Button from '../../../components/ui/Button';

const TransferConfirmation = ({
                                  formData,
                                  accounts,
                                  onConfirm,
                                  onBack,
                                  onCancel,
                              }) => {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Find account by ID or number
    const getAccountInfo = (accountNumber) =>
        accounts.find(
            (acc) =>
                String(acc.accountNumber) === String(accountNumber) ||
                String(acc.id) === String(accountNumber)
        ) || {};

    const sourceAccount = getAccountInfo(formData.sourceAccount);
    const isSelfTransfer = accounts.some(
        acc => String(acc.accountNumber) === String(formData.destinationAccount)
    );

    const destinationAccount = isSelfTransfer
        ? getAccountInfo(formData.destinationAccount)
        : {
            accountNumber: formData.destinationAccount,
            name: formData.recipientName,
            bank: formData.recipientBank,
            type: formData.accountType || "Recipient Account"
        };


    // If transfer type missing, keep as internal
    const fees = formData.transferType === 'external' ? 2.5 : 0;
    const totalAmount = parseFloat(formData.amount) + fees;

    // ════════════════════════════════════════════════════════════════════════════════
    // ✅ UPDATED: handleConfirm FUNCTION WITH VALIDATION + REAL-TIME FIRESTORE SYNC
    // ════════════════════════════════════════════════════════════════════════════════

    const handleConfirm = async () => {
        console.log("🔄 TransferConfirmation: Starting transfer confirmation...");
        setIsProcessing(true);
        setError(null);

        try {
            // ✅ VALIDATION 1: Check all required form data exists
            if (!formData.sourceAccount || !formData.destinationAccount || !formData.amount) {
                console.error("❌ Missing required fields in formData");
                console.log("   sourceAccount:", formData.sourceAccount);
                console.log("   destinationAccount:", formData.destinationAccount);
                console.log("   amount:", formData.amount);

                setError("❌ Missing required transfer information. Please check all fields and try again.");
                setIsProcessing(false);
                return;
            }

            // ✅ VALIDATION 2: Check if accounts exist in the accounts array
            if (!sourceAccount.accountNumber || !formData.destinationAccount) {
                console.error("❌ Accounts not found in accounts array");
                console.log("   sourceAccount found:", !!sourceAccount.accountNumber);
                console.log("   destinationAccount found:", !!destinationAccount.accountNumber);
                console.log("   Available accounts:", accounts.map(a => a.accountNumber));

                setError("❌ Account details not found. Please verify account numbers and try again.");
                setIsProcessing(false);
                return;
            }

            // Get account details
            console.log("📋 TransferConfirmation: Preparing transfer data...");
            console.log("   From Account:", sourceAccount.accountNumber);
            console.log("   To Account:", destinationAccount.accountNumber);
            console.log("   Amount: ₹" + parseFloat(formData.amount).toLocaleString('en-IN'));

            // ✅ Call updated processMoneyTransfer function (from STEP 1)
            // This function:
            // 1. Finds both accounts in Firestore
            // 2. Validates balance
            // 3. Creates atomic batch update
            // 4. Updates BOTH accounts in Firestore
            // 5. Returns transaction details

            console.log("⏳ TransferConfirmation: Calling processMoneyTransfer()...");

            const result = await processMoneyTransfer({
                senderAccountNumber: sourceAccount.accountNumber,
                recipientAccountNumber: destinationAccount.accountNumber,
                amount: parseFloat(formData.amount),
                transferType: formData.transferType || 'internal',
                description: formData.description || '',
            });

            console.log("📊 TransferConfirmation: Transfer result received:", result);

            if (result.success && result.data) {
                // ✅ Transfer successful
                // Firestore has been updated with atomic batch
                // Real-time listeners (Dashboard from STEP 2) will automatically fire

                console.log("✅ TransferConfirmation: Transfer successful!");
                console.log("   Transaction ID:", result.data.transactionId);
                console.log("   UTR Number:", result.data.utrNumber);
                console.log("   New Sender Balance:", result.data.senderNewBalance);
                console.log("   New Recipient Balance:", result.data.recipientNewBalance);

                // Call parent callback with complete transaction details
                onConfirm({
                    amount: parseFloat(formData.amount),
                    from: sourceAccount.accountNumber,
                    to: destinationAccount.accountNumber,
                    toAccountName: destinationAccount.name,
                    recipientName: destinationAccount.name || 'Recipient',
                    transactionId: result.data.transactionId,
                    utrNumber: result.data.utrNumber,
                    timestamp: result.data.timestamp,
                    senderNewBalance: result.data.senderNewBalance,
                    recipientNewBalance: result.data.recipientNewBalance,
                    transferStatus: 'completed',
                });

                console.log("✅ TransferConfirmation: Callback executed, navigating to success...");
            } else {
                // ❌ Transfer failed
                console.error("❌ TransferConfirmation: Transfer failed");
                console.error("   Error:", result.error);
                setError(result.error || 'Transfer failed. Please try again.');
            }
        } catch (err) {
            console.error("❌ TransferConfirmation: Unexpected error:", err);
            setError(
                err.message || 'An unexpected error occurred during transfer.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Transfer</h2>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Transfer Details */}
            <div className="space-y-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Details</h3>

                    <div className="space-y-4">
                        {/* From Account */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                From Account
                            </label>
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <p className="font-semibold text-gray-900">
                                    {sourceAccount.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {sourceAccount.accountNumber}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Available: ₹
                                    {sourceAccount.currentBalance?.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        {/* To Account */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                To Account
                            </label>
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <p className="font-semibold text-gray-900">
                                    {destinationAccount.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {destinationAccount.accountNumber}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    {destinationAccount.type} Account
                                </p>
                            </div>
                        </div>

                        {/* Amount Breakdown */}
                        <div className="bg-white p-4 rounded border border-gray-200">
                            <div className="flex justify-between mb-3">
                                <span className="text-gray-600">Transfer Amount:</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{parseFloat(formData.amount).toLocaleString('en-IN')}
                                </span>
                            </div>
                            {fees > 0 && (
                                <>
                                    <div className="flex justify-between mb-3 pb-3 border-b">
                                        <span className="text-gray-600">Transfer Fee:</span>
                                        <span className="font-semibold text-gray-900">
                                            ₹{fees.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">
                                            Total Debit:
                                        </span>
                                        <span className="font-bold text-lg text-gray-900">
                                            ₹{totalAmount.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Memo/Purpose */}
                        {formData.description && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Memo/Purpose
                                </label>
                                <div className="bg-white p-4 rounded border border-gray-200">
                                    <p className="text-gray-900">{formData.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                        <strong>✓ Secure Transfer:</strong> Your transfer will be processed securely.
                        Both accounts will update in real-time.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
                <Button
                    variant="secondary"
                    onClick={onBack}
                    disabled={isProcessing}
                >
                    Back
                </Button>
                <Button
                    variant="danger"
                    onClick={onCancel}
                    disabled={isProcessing}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    loading={isProcessing}
                >
                    {isProcessing ? 'Processing Transfer...' : 'Confirm & Transfer'}
                </Button>
            </div>
        </div>
    );
};

export default TransferConfirmation;