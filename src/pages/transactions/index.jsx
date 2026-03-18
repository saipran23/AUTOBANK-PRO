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
        return <div className="min-h-screen bg-[#FFFEF0] p-6">Loading transactions...</div>;
    }

    return (
        <div className="min-h-screen bg-[#FFFEF0]">
            <Header />
            <Breadcrumb />

            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-black text-black mb-6">Transaction History</h1>
                {error && (
                    <div className="bg-red-100 border-2 border-[#FF6B6B] text-red-700 px-4 py-3 rounded-none mb-4">
                        {error}
                    </div>
                )}
                {transactions.length === 0 ? (
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6 text-center text-gray-600">
                        No transactions found
                    </div>
                ) : (
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#FFFEF0] border-b-2 border-black">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-black text-black">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-black text-black">
                                    To Account
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-black text-black">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-black text-black">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-black text-black">
                                    Transaction ID
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="border-b border-black hover:bg-[#FFD60A] transition-all">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {txn.timestamp.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {txn.recipientAccountNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#FF6B6B] font-bold">
                                        ₹{txn.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                      <span className="border-2 border-black font-bold px-2 py-1 text-xs">
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
