import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { repayEMI } from '../../utils/loanService';

const LoanDetails = () => {
    const navigate = useNavigate();
    const { loanId } = useParams();
    const [userData, setUserData] = useState(null);
    const [loan, setLoan] = useState(null);
    const [isRepaying, setIsRepaying] = useState(false);

    useEffect(() => {
        const username = localStorage.getItem('autobank_current_user');
        if (!username) {
            navigate('/login');
            return;
        }

        const data = JSON.parse(localStorage.getItem(`autobank_data_${username}`));
        if (!data) {
            navigate('/login');
            return;
        }

        setUserData(data);

        const foundLoan = data.loans?.find(l => l.loanId === loanId);
        if (!foundLoan) {
            alert('Loan not found');
            navigate('/dashboard');
            return;
        }

        setLoan(foundLoan);
    }, [navigate, loanId]);

    const handleRepayEMI = () => {
        if (!window.confirm(`Pay EMI of ₹${loan.emi.toLocaleString()}?`)) return;

        setIsRepaying(true);
        const username = localStorage.getItem('autobank_current_user');
        const result = repayEMI(username, loanId);

        if (result.success) {
            alert('EMI paid successfully!');
            const updatedData = JSON.parse(localStorage.getItem(`autobank_data_${username}`));
            const updatedLoan = updatedData.loans.find(l => l.loanId === loanId);
            setLoan(updatedLoan);
            setUserData(updatedData);
        } else {
            alert(result.error || 'Payment failed');
        }

        setIsRepaying(false);
    };

    if (!loan) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="sticky top-0 z-50 bg-white shadow-md">
                <Header />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Dashboard', path: '/dashboard' },
                        { label: 'Loan Details', path: `/loan-details/${loanId}` }
                    ]}
                />

                <div className="mt-8">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-8 mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <h1 className="text-3xl font-bold">{loan.loanType}</h1>
                                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                                        loan.status === 'Active' ? 'bg-green-500' :
                                            loan.status === 'Approved' ? 'bg-blue-400' :
                                                loan.status === 'Closed' ? 'bg-gray-400' :
                                                    'bg-yellow-400'
                                    }`}>
                                        {loan.status}
                                    </span>
                                </div>
                                <p className="text-blue-100">Loan ID: {loan.loanId}</p>
                            </div>

                            <div className="text-right">
                                <p className="text-blue-100 text-sm">Total Loan Amount</p>
                                <p className="text-4xl font-bold">₹{loan.loanAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm mb-1">Monthly EMI</p>
                            <p className="text-3xl font-bold text-gray-900">₹{loan.emi.toLocaleString()}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm mb-1">Interest Rate</p>
                            <p className="text-3xl font-bold text-gray-900">{loan.interestRate}%</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm mb-1">Tenure</p>
                            <p className="text-3xl font-bold text-gray-900">{loan.tenure} mo</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm mb-1">Remaining</p>
                            <p className="text-3xl font-bold text-orange-600">₹{loan.remainingAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    {loan.status === 'Active' && (
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Repayment Progress</h3>

                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>EMIs Paid: {loan.paidEMIs} of {loan.tenure}</span>
                                    <span>{((loan.paidEMIs / loan.tenure) * 100).toFixed(1)}% Complete</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className="bg-green-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                        style={{ width: `${(loan.paidEMIs / loan.tenure) * 100}%` }}
                                    >
                                        {loan.paidEMIs > 0 && (
                                            <span className="text-xs font-semibold text-white">
                                                {loan.paidEMIs}/{loan.tenure}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {loan.nextEMIDate && (
                                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-600">Next EMI Due</p>
                                        <p className="font-semibold text-gray-900">{loan.nextEMIDate}</p>
                                    </div>
                                    <button
                                        onClick={handleRepayEMI}
                                        disabled={isRepaying}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
                                    >
                                        {isRepaying ? 'Processing...' : `Pay ₹${loan.emi.toLocaleString()}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Loan Timeline</h3>

                        <div className="space-y-6">
                            {loan.timeline.map((event, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            event.status === 'Applied' ? 'bg-blue-100' :
                                                event.status === 'Approved' ? 'bg-green-100' :
                                                    event.status === 'Disbursed' ? 'bg-purple-100' :
                                                        event.status === 'EMI Paid' ? 'bg-orange-100' :
                                                            event.status === 'Closed' ? 'bg-gray-100' :
                                                                'bg-yellow-100'
                                        }`}>
                                            {event.status === 'Applied' && '📝'}
                                            {event.status === 'Approved' && '✅'}
                                            {event.status === 'Disbursed' && '💰'}
                                            {event.status === 'EMI Paid' && '💳'}
                                            {event.status === 'Closed' && '🎉'}
                                        </div>
                                        {idx < loan.timeline.length - 1 && (
                                            <div className="w-0.5 h-16 bg-gray-200"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 pb-8">
                                        <p className="font-semibold text-gray-900">{event.status}</p>
                                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanDetails;
