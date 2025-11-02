import React, { useState } from 'react';
import { verifyAccountDetails } from '../../../utils/transferService';

const TransferForm = ({ formData, setFormData, accounts, onNext }) => {
    const [errors, setErrors] = useState({});
    const [verifying, setVerifying] = useState(false);
    const [accountVerified, setAccountVerified] = useState(false);
    const [recipientInfo, setRecipientInfo] = useState(null);

    // When any field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            // On recipientAccount field, mirror to destinationAccount for downstream use
            const updated = { ...prev, [name]: value };
            if (name === 'recipientAccount') {
                updated.destinationAccount = value;  // sync for confirmation usage!
                setAccountVerified(false);
                setRecipientInfo(null);
            }
            if (errors[name]) setErrors({ ...errors, [name]: '' });
            if (name === 'recipientIFSC') {
                setAccountVerified(false);
                setRecipientInfo(null);
            }
            return updated;
        });
    };

    // Async recipient verification, calls Firestore validation
    const handleVerifyAccount = async () => {
        if (!formData.recipientAccount || formData.recipientAccount.length !== 13) {
            setErrors({ ...errors, recipientAccount: 'Enter valid 13-digit account number' });
            return;
        }
        if (!formData.recipientIFSC || formData.recipientIFSC.length !== 11) {
            setErrors({ ...errors, recipientIFSC: 'Enter valid 11-character IFSC code' });
            return;
        }
        setVerifying(true);
        try {
            const result = await verifyAccountDetails(
                formData.recipientAccount,
                formData.recipientIFSC
            );
            if (result.success) {
                setAccountVerified(true);
                setRecipientInfo(result);
                setFormData(prev => ({
                    ...prev,
                    recipientName: result.recipientName,
                    recipientBank: result.recipientBank,
                    destinationAccount: formData.recipientAccount // always mirror for confirmation!
                }));
                setErrors({});
            } else {
                setAccountVerified(false);
                setRecipientInfo(null);
                setErrors({ recipientAccount: result.error });
            }
        } catch (err) {
            setAccountVerified(false);
            setRecipientInfo(null);
            setErrors({ recipientAccount: "Verification failed, try again." });
        }
        setVerifying(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.sourceAccount) {
            newErrors.sourceAccount = 'Please select source account';
        }
        if (!accountVerified) {
            newErrors.recipientAccount = 'Please verify recipient account first';
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Enter valid amount';
        }
        // Use accountNumber (not id) for all lookups!
        const sourceAccount = accounts.find(acc => String(acc.accountNumber) === String(formData.sourceAccount));
        if (formData.amount && sourceAccount && parseFloat(formData.amount) > sourceAccount.currentBalance) {
            newErrors.amount = `Insufficient balance. Available: ₹${sourceAccount.currentBalance.toLocaleString()}`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Ensure destinationAccount is set
            setFormData(prev => ({
                ...prev,
                destinationAccount: formData.recipientAccount
            }));
            onNext();
        }
    };

    // Use accountNumber for the dropdown and all lookups!
    const sourceAccount = accounts.find(acc => acc.accountNumber === formData.sourceAccount);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Account */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Account
                </label>
                <select
                    name="sourceAccount"
                    value={formData.sourceAccount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="">Select an account</option>
                    {accounts.map(account => (
                        <option key={account.accountNumber} value={account.accountNumber}>
                            {account.name} - {account.accountNumber} (₹{account.currentBalance.toLocaleString()})
                        </option>
                    ))}
                </select>
                {errors.sourceAccount && (
                    <p className="mt-1 text-sm text-red-600">{errors.sourceAccount}</p>
                )}
            </div>
            {sourceAccount && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        Available Balance: <span className="font-bold">₹{sourceAccount.currentBalance.toLocaleString()}</span>
                    </p>
                </div>
            )}

            {/* Recipient Account Number */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Account Number (13 digits)
                </label>
                <input
                    type="text"
                    name="recipientAccount"
                    value={formData.recipientAccount}
                    onChange={handleInputChange}
                    maxLength={13}
                    placeholder="Enter 13-digit account number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.recipientAccount && (
                    <p className="mt-1 text-sm text-red-600">{errors.recipientAccount}</p>
                )}
            </div>

            {/* Recipient IFSC Code */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    IFSC Code (11 characters)
                </label>
                <input
                    type="text"
                    name="recipientIFSC"
                    value={formData.recipientIFSC}
                    onChange={handleInputChange}
                    maxLength={11}
                    placeholder="Enter IFSC code (e.g., AUTB0001234)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                />
                {errors.recipientIFSC && (
                    <p className="mt-1 text-sm text-red-600">{errors.recipientIFSC}</p>
                )}
            </div>

            {/* Verify Account Button */}
            <button
                type="button"
                onClick={handleVerifyAccount}
                disabled={verifying || !formData.recipientAccount || !formData.recipientIFSC}
                className="w-full py-2 px-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {verifying ? 'Verifying...' : accountVerified ? '✓ Account Verified' : 'Verify Recipient Account'}
            </button>
            {accountVerified && recipientInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-800 mb-2">✓ Account Verified Successfully</p>
                    <div className="space-y-1 text-sm text-green-700">
                        <p><strong>Account Holder:</strong> {recipientInfo.recipientName}</p>
                        <p><strong>Bank:</strong> {recipientInfo.recipientBank}</p>
                    </div>
                </div>
            )}

            {/* Amount */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                </label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
            </div>

            {/* Memo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memo / Note (Optional)
                </label>
                <input
                    type="text"
                    name="memo"
                    value={formData.memo}
                    onChange={handleInputChange}
                    placeholder="Add a note for this transfer"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-md"
            >
                Continue to Review
            </button>
        </form>
    );
};

export default TransferForm;
