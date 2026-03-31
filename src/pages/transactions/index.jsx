import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const q = query(
                    collection(db, 'transactions'),
                    where('senderUid', '==', user.uid),
                    orderBy('timestamp', 'desc')
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate?.() || new Date(),
                }));

                setTransactions(data);
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setError('Failed to load transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return <div className="p-6">Loading transactions...</div>;
    }

    return (
        <div>
            <Header />
            <Breadcrumb />

            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {transactions.length === 0 ? (
                    <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-600">
                        No transactions found
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                    To Account
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                    Transaction ID
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {txn.timestamp.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {txn.recipientAccountNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        ₹{txn.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {txn.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-600">
                                        {txn.id}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TransactionsPage;
