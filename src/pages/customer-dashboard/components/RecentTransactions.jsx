import React from "react";

export default function RecentTransactions({ transactions }) {
    if (!transactions || transactions.length === 0)
        return <div className="text-center text-gray-600 font-medium p-4">No recent transactions</div>;

    return (
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_#000]">
            <h2 className="text-lg font-black text-black mb-3">Recent Transactions</h2>
            <table className="w-full text-sm">
                <thead>
                <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Description</th>
                    <th className="text-right">Amount (₹)</th>
                </tr>
                </thead>
                <tbody>
                {transactions.slice(0, 8).map((t) => (
                    <tr key={t.id} className="border-t-2 border-black hover:bg-[#FFD60A]">
                        <td>{t.date}</td>
                        <td>{t.description}</td>
                        <td className={`text-right ${t.type === "debit" ? "text-[#FF6B6B] font-bold" : "text-[#00C9B1] font-bold"}`}>
                            {t.type === "debit" ? "-" : "+"}
                            {t.amount.toFixed(2)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
