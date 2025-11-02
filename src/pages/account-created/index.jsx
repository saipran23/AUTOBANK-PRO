import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ---- ADD FIREBASE IMPORTS ----
import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function AccountCreated() {
    const navigate = useNavigate();
    const location = useLocation();
    const accountDetails = location.state?.accountDetails;

    // ---- WRITE TO FIRESTORE IF MISSING ----
    useEffect(() => {
        // Redirect if no account details
        if (!accountDetails) {
            navigate('/login');
            return;
        }

        // Attempt to save account to Firebase if not present
        const saveToDatabase = async () => {
            // Optionally: skip if already present
            const snapshot = await getDocs(collection(db, "customers"));
            const alreadyThere = snapshot.docs.some(doc =>
                doc.data().customerID === accountDetails.customerID
            );
            if (!alreadyThere) {
                await addDoc(collection(db, "customers"), {
                    ...accountDetails,
                    transactions: [],
                    loans: []
                });
            }
        };

        saveToDatabase();

    }, [accountDetails, navigate]);

    if (!accountDetails) {
        return null;
    }

    const account = accountDetails.accounts[0];

    const handleDownloadDetails = () => {
        const details = `
AUTOBANK PRO - ACCOUNT DETAILS
================================

Customer Information:
--------------------
Customer ID: ${accountDetails.customerID}
Full Name: ${accountDetails.personalDetails.fullName}
Email: ${accountDetails.personalDetails.email}
Mobile: ${accountDetails.personalDetails.phoneNumber}

Account Information:
-------------------
Account Number: ${account.accountNumber}
Account Type: ${account.type} Account
IFSC Code: ${account.ifscCode}
Branch Code: ${account.branchCode}
Branch Name: ${account.branchName}
Account Status: ${account.status}
Opening Date: ${new Date(account.openedDate).toLocaleDateString()}

Initial Deposit: ₹${account.currentBalance.toLocaleString()}

Address:
--------
${accountDetails.address.street}
${accountDetails.address.city}, ${accountDetails.address.state} - ${accountDetails.address.pincode}

Identity Details:
-----------------
PAN: ${accountDetails.identity.panNumber}
Aadhar: ${accountDetails.identity.aadharNumber}

---
Generated on: ${new Date().toLocaleString()}
        `;

        const blob = new Blob([details], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AutoBank_${accountDetails.customerID}_Details.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
                        <span className="text-6xl">✓</span>
                    </div>
                    <h1 className="text-4xl font-bold text-green-600 mb-2">Account Created Successfully!</h1>
                    <p className="text-xl text-gray-600">Welcome to AutoBank Pro, {accountDetails.personalDetails.fullName}!</p>
                </div>
                {/* Account Details Card */}
                <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Your Account Details</h2>
                        <p className="text-blue-100">Please save these details for future reference</p>
                    </div>
                    {/* Details Grid */}
                    <div className="p-6 space-y-6">
                        {/* Customer Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Customer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Customer ID</p>
                                    <p className="text-lg font-bold text-gray-900">{accountDetails.customerID}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{accountDetails.personalDetails.fullName}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="text-lg font-semibold text-gray-900">{accountDetails.personalDetails.email}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Mobile</p>
                                    <p className="text-lg font-semibold text-gray-900">{accountDetails.personalDetails.phoneNumber}</p>
                                </div>
                            </div>
                        </div>
                        {/* Account Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Account Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                                    <p className="text-sm text-blue-600 mb-1">Account Number</p>
                                    <p className="text-2xl font-bold text-blue-900">{account.accountNumber}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                                    <p className="text-sm text-blue-600 mb-1">IFSC Code</p>
                                    <p className="text-2xl font-bold text-blue-900">{account.ifscCode}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Account Type</p>
                                    <p className="text-lg font-semibold text-gray-900">{account.type} Account</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Branch Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{account.branchName}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Branch Code</p>
                                    <p className="text-lg font-semibold text-gray-900">{account.branchCode}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                                    <p className="text-sm text-green-600 mb-1">Initial Balance</p>
                                    <p className="text-2xl font-bold text-green-900">₹{account.currentBalance.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        {/* Address */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Registered Address</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-900">
                                    {accountDetails.address.street}<br/>
                                    {accountDetails.address.city}, {accountDetails.address.state} - {accountDetails.address.pincode}
                                </p>
                            </div>
                        </div>
                        {/* Identity Details */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Identity Verification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">PAN Number</p>
                                    <p className="text-lg font-semibold text-gray-900">{accountDetails.identity.panNumber}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Aadhar Number</p>
                                    <p className="text-lg font-semibold text-gray-900">{accountDetails.identity.aadharNumber.replace(/\d(?=\d{4})/g, 'X')}</p>
                                </div>
                            </div>
                        </div>
                        {/* Important Notice */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="flex items-start">
                                <span className="text-2xl mr-3">⚠️</span>
                                <div>
                                    <p className="font-semibold text-yellow-800">Important Notice:</p>
                                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                                        <li>Please save or download your account details for future reference</li>
                                        <li>Never share your account credentials with anyone</li>
                                        <li>Your debit card will be delivered within 7-10 business days</li>
                                        <li>Net banking and mobile banking will be activated within 24 hours</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleDownloadDetails}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                            >
                                <span className="mr-2">📥</span> Download Account Details
                            </button>
                            <button
                                onClick={() => navigate('/customer-dashboard')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                            >
                                <span className="mr-2">🏠</span> Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
                {/* Footer Message */}
                <div className="text-center mt-8 text-gray-600">
                    <p>Thank you for choosing AutoBank Pro!</p>
                    <p className="text-sm mt-2">For assistance, contact: [support@autobank.com](mailto:support@autobank.com) | 1800-XXX-XXXX</p>
                </div>
            </div>
        </div>
    );
}
