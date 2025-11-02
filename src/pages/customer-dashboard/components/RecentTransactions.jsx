import React from "react";

export default function RecentTransactions({ transactions }) {
    if (!transactions || transactions.length === 0)
        return <div className="text-center text-gray-500 p-4">No recent transactions</div>;

    return (
        <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
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
                    <tr key={t.id} className="border-t">
                        <td>{t.date}</td>
                        <td>{t.description}</td>
                        <td className={`text-right ${t.type === "debit" ? "text-red-600" : "text-green-600"}`}>
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
