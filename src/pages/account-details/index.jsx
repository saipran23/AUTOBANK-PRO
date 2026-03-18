import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

export default function AccountDetails() {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const [userData, setUserData] = useState(null);
    const [account, setAccount] = useState(null);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [summary, setSummary] = useState({ totalDebits: 0, totalCredits: 0 });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!accountId) return;
        let unsubscribe = null;
        let userEmail = auth.currentUser?.email;
        if (!userEmail) {
            setError("Not logged in. Please login again.");
            return;
        }
        // Realtime listener on user profile for live updates:
        const q = query(collection(db, "customers"), where("personalDetails.email", "==", userEmail));
        unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setError(`No user found for email "${userEmail}".`);
                return;
            }
            let found = null;
            let acc = null;
            let debugAccounts = [];
            snapshot.forEach(doc => {
                const userData = doc.data();
                (userData.accounts || []).forEach(acct => {
                    debugAccounts.push(acct.id + "/" + acct.accountNumber);
                    if (acct.id === accountId || acct.accountNumber === accountId) {
                        found = userData;
                        acc = acct;
                    }
                });
            });
            if (!acc) {
                setError(
                    `No account found matching accountId "${accountId}".\n` +
                    `These are all available account ids/numbers: \n${debugAccounts.join(", ")}`
                );
                return;
            }
            setUserData(found);
            setAccount(acc);
            setFilteredTransactions(acc.transactions || []);
            updateSummary(acc.transactions || []);
        }, (err) => setError("Failed to fetch account info: " + err.message));

        return () => {
            if (unsubscribe) unsubscribe();
        };
        // eslint-disable-next-line
    }, [accountId]);

    const updateSummary = (transactions) => {
        let totalDebits = 0, totalCredits = 0;
        (transactions || []).forEach(txn => {
            if (txn.type === 'credit') totalCredits += txn.amount;
            else totalDebits += txn.amount;
        });
        setSummary({ totalCredits, totalDebits });
    };

    const getRunningBalances = () => {
        let balance = typeof account?.currentBalance === "number" ? account.currentBalance : 0;
        return (filteredTransactions || []).map((txn) => {
            const running = balance;
            balance -= txn.type === "debit" ? txn.amount : -txn.amount;
            return running;
        });
    };

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#FFFEF0]">
                <div className="text-[#FF6B6B] font-bold mb-4">{error}</div>
                <Button onClick={() => navigate("/customer-dashboard")}>Back to Dashboard</Button>
            </div>
        );
    }
    if (!accountId) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#FFFEF0]">
                <div className="text-black font-bold mb-4">No account selected</div>
                <p className="text-gray-500 mb-4">Please select an account from the dashboard</p>
                <Button onClick={() => navigate("/customer-dashboard")}>Go to Dashboard</Button>
            </div>
        );
    }
    if (!userData || !account) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFEF0]">
                <div className="text-gray-500">Loading account details...</div>
            </div>
        );
    }

    const runningBalances = getRunningBalances();

    return (
        <div className="bg-[#FFFEF0] min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Breadcrumb paths={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Accounts", to: "/accounts" },
                    { label: account.accountType || "Account", to: `/accounts/${account.id}` }
                ]} />
                <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-10">
                    {/* Main column */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-7">
                        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-8 mb-4">
                            <h2 className="text-2xl font-black text-black mb-2">{account.accountType || "Savings Account"}</h2>
                            <div className="mb-1 text-gray-500">
                                <span className="font-semibold">Account No:</span> {account.accountNumber || "N/A"}
                            </div>
                            <div className="text-4xl font-black text-black mb-2">
                                ₹{typeof account.currentBalance === "number" ? account.currentBalance.toLocaleString('en-IN') : "—"}
                            </div>
                            <div className="text-gray-600 mb-2">
                                Available: ₹{typeof account.availableBalance === "number"
                                ? account.availableBalance.toLocaleString('en-IN')
                                : (typeof account.currentBalance === "number"
                                    ? account.currentBalance.toLocaleString('en-IN')
                                    : "—")}
                            </div>
                            <div className="text-xs text-gray-400 mb-3">
                                Last Updated: {new Date(account.lastUpdated || Date.now()).toLocaleString()}
                            </div>
                            {/* Quick Actions */}
                            <div className="flex gap-4 mb-1">
                                <Button onClick={() => navigate("/transfer-money", { state: { from: account.accountNumber } })}>Send Money</Button>
                                <Button onClick={() => navigate("/pay-bills", { state: { from: account.accountNumber } })}>Pay Bills</Button>
                                <Button onClick={() => window.print()}>Download Statement</Button>
                                <Button onClick={() => {}}>More Options</Button>
                            </div>
                        </div>
                        {/* Transaction History */}
                        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6">
                            <div className="text-lg font-black text-black mb-4">Transaction History</div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border-collapse">
                                    <thead>
                                    <tr className="bg-[#FFFEF0]">
                                        <th className="text-left px-4 py-2 font-black text-black border-b-2 border-black">Description</th>
                                        <th className="text-left px-4 py-2 font-black text-black border-b-2 border-black">Date</th>
                                        <th className="text-left px-4 py-2 font-black text-black border-b-2 border-black">Amount</th>
                                        <th className="text-left px-4 py-2 font-black text-black border-b-2 border-black">Balance</th>
                                        <th className="text-left px-4 py-2 font-black text-black border-b-2 border-black">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-400">
                                                <div className="text-4xl mb-2">💸</div>
                                                No transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map((txn, i) => (
                                            <tr key={i} className="border-b border-black hover:bg-[#FFD60A] transition-all">
                                                <td className="px-4 py-2">{txn.description} {txn.category}</td>
                                                <td className="px-4 py-2">{txn.date}</td>
                                                <td className={`px-4 py-2 font-bold ${txn.type === "credit" ? "text-[#00C9B1]" : "text-[#FF6B6B]"}`}>
                                                    {txn.type === "credit" ? "+" : "-"}₹{typeof txn.amount === "number" ? txn.amount.toLocaleString() : "—"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    ₹{typeof runningBalances[i] === "number" ? runningBalances[i].toLocaleString() : "—"}
                                                </td>
                                                <td className="px-4 py-2"><span className="border-2 border-black font-bold px-2 py-0.5 text-xs">{txn.status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* Sidebar */}
                    <aside className="w-full lg:w-1/3 flex flex-col gap-7">
                        <section className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6">
                            <div className="text-base font-black text-black mb-3">Quick Summary</div>
                            <div className="flex justify-between items-center text-lg mb-2">
                                <span>Total Credits</span>
                                <span className="font-bold text-[#00C9B1] text-xl">₹{typeof summary.totalCredits === "number" ? summary.totalCredits.toLocaleString() : "—"}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg mb-2">
                                <span>Total Debits</span>
                                <span className="font-bold text-[#FF6B6B] text-xl">₹{typeof summary.totalDebits === "number" ? summary.totalDebits.toLocaleString() : "—"}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg">
                                <span>Net Flow</span>
                                <span className={summary.totalCredits - summary.totalDebits >= 0
                                    ? "font-bold text-[#00C9B1] text-xl"
                                    : "font-bold text-[#FF6B6B] text-xl"}>
                                    ₹{typeof summary.totalCredits === "number" && typeof summary.totalDebits === "number"
                                    ? (summary.totalCredits - summary.totalDebits).toLocaleString()
                                    : "—"}
                                </span>
                            </div>
                        </section>
                        <section className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-6">
                            <div className="text-base font-black text-black mb-3">Linked Loans</div>
                            {userData?.loans && userData.loans.length > 0 ? (
                                userData.loans.map((loan, i) => (
                                    <div key={i} className="mb-3 border-2 border-black bg-[#FFFEF0] px-4 py-3">
                                        <div className="font-semibold">{loan.loanType} <span className={
                                            loan.status === "approved" ? "text-[#00C9B1] font-bold"
                                                : loan.status === "rejected" ? "text-[#FF6B6B] font-bold"
                                                    : "text-black font-bold"
                                        }>({loan.status})</span></div>
                                        <div className="text-xs text-gray-500">Loan ID: {loan.loanId || loan.id}</div>
                                        <div>Principal: ₹{typeof loan.loanAmount === "number" ? loan.loanAmount.toLocaleString() : "—"}</div>
                                        <div>EMI: ₹{typeof loan.emi === "number" ? loan.emi.toLocaleString() : "—"}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-blue-400">
                                    <div className="text-4xl mb-2">🛑</div>
                                    You don't have any loans linked to this account.
                                </div>
                            )}
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}
