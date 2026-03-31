
import React from 'react';
import Button from '../../../components/ui/Button';

const TransferConfirmation = ({
    formData,
    accounts,
    onConfirm,
    onBack,
    onCancel,
    isProcessing,
}) => {
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

    const fees = formData.transferType === 'external' ? 2.5 : 0;
    const totalAmount = parseFloat(formData.amount) + fees;

    // Delegate all processing to the parent; this component is display-only.
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Transfer</h2>

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
                {onCancel && (
                    <Button
                        variant="danger"
                        onClick={onCancel}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                )}
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