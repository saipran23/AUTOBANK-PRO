import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, deleteDoc, getDocs } from "firebase/firestore";
import { approveLoanApplication } from "../../utils/loanService";

// Unified getter for either direct or nested value
function getField(loan, key) {
    if (loan[key] !== undefined && loan[key] !== "") return loan[key];
    if (loan.formData?.[key] !== undefined && loan.formData[key] !== "") return loan.formData[key];
    if (loan.personalInfo?.[key] !== undefined && loan.personalInfo[key] !== "") return loan.personalInfo[key];
    if (loan.employmentInfo?.[key] !== undefined && loan.employmentInfo[key] !== "") return loan.employmentInfo[key];
    if (loan.financialInfo?.[key] !== undefined && loan.financialInfo[key] !== "") return loan.financialInfo[key];
    return "";
}

// Unified getter for customer name
function getCustomerName(loan) {
    const first = getField(loan, "firstName");
    const last = getField(loan, "lastName");
    if (first || last) return `${first} ${last}`.trim();
    return getField(loan, "customerName") || getField(loan, "name") || "—";
}

// ⭐ Unified getter for customer email
function getCustomerEmail(loan) {
    return (
        loan.email ||
        loan.formData?.email ||
        getField(loan, "email") ||
        ""
    );
}

function displayMoney(val) {
    if (!val || isNaN(val)) return "₹0";
    return `₹${parseFloat(val).toLocaleString("en-IN")}`;
}

function showField(key, label, value) {
    return (
        <div key={key} className="mb-3">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</div>
            <div className="text-sm font-medium text-gray-900 truncate mt-1">
                {value !== undefined && value !== "" ? value : <span className="text-gray-400 italic">N/A</span>}
            </div>
        </div>
    );
}

function showSection(title, fieldsArr) {
    return (
        <div className="mb-6 p-5 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white">
            <div className="mb-4 font-bold text-sm text-blue-900 uppercase tracking-wide flex items-center">
                <span className="w-1 h-4 bg-blue-600 rounded mr-2"></span>
                {title}
            </div>
            <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">{fieldsArr}</div>
        </div>
    );
}

function getStatusColor(status) {
    const s = (status || "").toLowerCase();
    if (s.includes("pending")) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (s.includes("approved")) return "bg-green-100 text-green-800 border-green-300";
    if (s.includes("denied")) return "bg-red-100 text-red-800 border-red-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
}

function isPendingLike(loan) {
    const status = (loan.status || getField(loan, "status") || "").toLowerCase();
    return status.includes("pending");
}

const LoanReview = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [approving, setApproving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [filter, setFilter] = useState("all"); // all, pending, approved

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "loanApplications"),
            (snapshot) => {
                const updatedLoans = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data()
                }));
                setLoans(updatedLoans);
                setLoading(false);

                if (selectedLoan && !updatedLoans.find(l => l.id === selectedLoan.id)) {
                    setSelectedLoan(null);
                }
            },
            (err) => {
                setError("Real-time connection failed: " + err.message);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [selectedLoan]);

    const filteredLoans = loans.filter(l => {
        const status = (l.status || getField(l, "status") || "").toLowerCase();
        if (filter === "pending") return status.includes("pending");
        if (filter === "approved") return status.includes("approved");
        return true;
    });

    const getStatus = (l) => (l.status || getField(l, "status") || "").toLowerCase();
    const totalActive = loans.filter(l => getStatus(l).includes("approved") || getStatus(l).includes("active")).length;
    const toVerify = loans.filter(l => !getStatus(l) || getStatus(l).includes("pending")).length;
    const completed = loans.filter(l => getStatus(l).includes("closed")).length;

    // ⭐ Approve uses customer email only
    async function handleApprove(loan) {
        setApproving(true);
        setError("");
        setSuccess("");

        try {
            const email = getCustomerEmail(loan);
            if (!email) {
                setError("❌ Missing customer email in application. Contact support.");
                setApproving(false);
                return;
            }

            const result = await approveLoanApplication(loan.id, email);

            if (result.success) {
                setSuccess("✅ Loan approved & disbursed! New balance: ₹" + (result.newBalance || 0).toLocaleString('en-IN'));
                setSelectedLoan(null);

                setTimeout(async () => {
                    const snap = await getDocs(collection(db, "loanApplications"));
                    setLoans(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                }, 1000);
            } else {
                setError("❌ " + result.error);
            }
        } catch(err) {
            setError("❌ " + err.message);
        }

        setApproving(false);
        setTimeout(() => setSuccess(""), 5000);
    }

    async function handleReject(id) {
        if (!window.confirm("Permanently reject this loan application?")) return;
        setApproving(true);

        try {
            await deleteDoc(doc(db, "loanApplications", id));
            setSuccess("✅ Loan application rejected & removed.");
            setSelectedLoan(null);

            setTimeout(async () => {
                const snap = await getDocs(collection(db, "loanApplications"));
                setLoans(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            }, 500);
        } catch(err) {
            setError("❌ Rejection failed: " + err.message);
        }

        setApproving(false);
        setTimeout(() => setSuccess(""), 5000);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
            {error && (
                <div className="max-w-5xl mx-auto p-4 mt-6 rounded-lg bg-red-50 border-l-4 border-red-400 text-red-700 shadow-sm font-semibold flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError("")} className="text-2xl hover:text-red-900">×</button>
                </div>
            )}
            {success && (
                <div className="max-w-5xl mx-auto p-4 mt-6 rounded-lg bg-green-50 border-l-4 border-green-400 text-green-800 shadow-sm font-semibold flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">✓</span>
                        <span>{success}</span>
                    </div>
                    <button onClick={() => setSuccess("")} className="text-2xl hover:text-green-900">×</button>
                </div>
            )}

            <section className="max-w-5xl mx-auto mt-8 mb-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Loan Management</h1>
                    <p className="text-gray-600 text-lg">Review and approve loan applications</p>
                </div>
            </section>

            <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow-lg rounded-xl border-l-4 border-blue-500 p-7 hover:shadow-xl transition">
                    <div className="text-xs text-blue-900 mb-2 tracking-widest font-bold">ACTIVE LOANS</div>
                    <div className="text-5xl font-bold text-blue-600">{totalActive}</div>
                    <p className="text-xs text-gray-500 mt-2">Approved & Active</p>
                </div>
                <div className="bg-white shadow-lg rounded-xl border-l-4 border-yellow-400 p-7 hover:shadow-xl transition">
                    <div className="text-xs text-yellow-900 mb-2 tracking-widest font-bold">PENDING REVIEW</div>
                    <div className="text-5xl font-bold text-yellow-600">{toVerify}</div>
                    <p className="text-xs text-gray-500 mt-2">Awaiting Approval</p>
                </div>
                <div className="bg-white shadow-lg rounded-xl border-l-4 border-green-500 p-7 hover:shadow-xl transition">
                    <div className="text-xs text-green-900 mb-2 tracking-widest font-bold">CLOSED LOANS</div>
                    <div className="text-5xl font-bold text-green-600">{completed}</div>
                    <p className="text-xs text-gray-500 mt-2">Fully Repaid</p>
                </div>
            </section>

            <section className="max-w-5xl mx-auto mb-6">
                <div className="flex gap-3 bg-white rounded-lg p-2 shadow-sm">
                    {[
                        { value: "all", label: "All Applications", icon: "📋" },
                        { value: "pending", label: "Pending", icon: "⏳" },
                        { value: "approved", label: "Approved", icon: "✓" }
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
                                filter === tab.value
                                    ? "bg-blue-600 text-white shadow"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <span className="mr-1">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-7 border-b border-gray-200">
                    <h2 className="font-bold text-2xl text-gray-900 flex items-center">
                        <span className="w-1 h-7 bg-blue-600 rounded mr-3"></span>
                        Loan Applications ({filteredLoans.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center p-16">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                        <p className="mt-4 text-blue-600 font-semibold text-lg">Loading applications...</p>
                    </div>
                ) : filteredLoans.length === 0 ? (
                    <div className="text-center text-gray-500 py-16">
                        <p className="text-2xl mb-2">📭</p>
                        <p className="text-lg font-medium">No applications found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Loan ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredLoans.map((loan) => (
                                <tr
                                    key={loan.id}
                                    className="border-b border-gray-100 hover:bg-blue-50 transition duration-200 cursor-pointer"
                                    onClick={() => setSelectedLoan(loan)}
                                >
                                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{loan.id.substring(0, 10)}...</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">{getCustomerName(loan)}</td>
                                    <td className="px-6 py-4 font-bold text-blue-700">
                                        {displayMoney(getField(loan, "loanAmount"))}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {getField(loan, "loanType") || "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(getField(loan, "status"))}`}>
                                            {getField(loan, "status") || "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedLoan(loan);
                                            }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Modal */}
            {selectedLoan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 py-8">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative overflow-y-auto max-h-[95vh]">
                        <button
                            onClick={() => setSelectedLoan(null)}
                            className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-gray-600 transition font-light"
                        >
                            ✕
                        </button>

                        <div className="text-4xl font-bold text-gray-900 mb-8 flex items-center">
                            <span className="w-2 h-10 bg-blue-600 rounded mr-4"></span>
                            Loan Application Details
                        </div>

                        {showSection("Loan Summary", [
                            showField("loan_id", "Loan ID", selectedLoan.id),
                            showField("status", "Current Status", getField(selectedLoan, "status")),
                            showField("loan_amount", "Loan Amount", displayMoney(getField(selectedLoan, "loanAmount"))),
                            showField("loan_type", "Loan Type", getField(selectedLoan, "loanType")),
                            showField("loan_purpose", "Purpose", getField(selectedLoan, "loanPurpose")),
                            showField("loan_term", "Tenure (months)", getField(selectedLoan, "loanTerm")),
                            showField("interest_rate", "Interest Rate", getField(selectedLoan, "interestRate") ? `${getField(selectedLoan, "interestRate")}%` : "—"),
                            showField("emi", "Monthly EMI", displayMoney(getField(selectedLoan, "emi"))),
                        ])}

                        {showSection("Customer Details", [
                            showField("name", "Full Name", getCustomerName(selectedLoan)),
                            showField("email", "Email Address", getCustomerEmail(selectedLoan)),
                            showField("phone", "Phone Number", getField(selectedLoan, "phone")),
                            showField("dob", "Date of Birth", getField(selectedLoan, "dateOfBirth")),
                            showField("address", "Address", getField(selectedLoan, "address")),
                            showField("city_state", "City / State", getField(selectedLoan, "city") + " / " + getField(selectedLoan, "state")),
                        ])}

                        {showSection("Employment & Financial", [
                            showField("employer", "Employer", getField(selectedLoan, "employerName")),
                            showField("gross_income", "Gross Income", displayMoney(getField(selectedLoan, "grossIncome"))),
                            showField("bank", "Primary Bank", getField(selectedLoan, "primaryBank")),
                            showField("checking", "Checking Balance", displayMoney(getField(selectedLoan, "checkingBalance"))),
                        ])}

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col md:flex-row justify-end gap-4 mt-10 pt-8 border-t-2 border-gray-200">
                            <button
                                className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-bold tracking-wide transition"
                                onClick={() => setSelectedLoan(null)}
                                disabled={approving}
                            >
                                Close
                            </button>
                            {isPendingLike(selectedLoan) && (
                                <>
                                    <button
                                        className="px-8 py-3 bg-red-500 hover:bg-red-700 text-white rounded-lg font-bold tracking-wide disabled:opacity-50 transition"
                                        onClick={() => handleReject(selectedLoan.id)}
                                        disabled={approving}
                                    >
                                        {approving ? "Processing..." : "❌ Reject"}
                                    </button>
                                    <button
                                        className="px-8 py-3 bg-green-600 hover:bg-green-800 text-white rounded-lg font-bold tracking-wide disabled:opacity-50 transition shadow-lg"
                                        onClick={() => handleApprove(selectedLoan)}
                                        disabled={approving}
                                    >
                                        {approving ? "Processing..." : "✓ Approve & Disburse"}
                                    </button>
                                </>
                            )}
                            {!isPendingLike(selectedLoan) && (
                                <span className="py-3 px-8 rounded-lg bg-green-100 text-green-900 font-bold text-sm border-2 border-green-300">
                                    ✓ Already {getField(selectedLoan, "status")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanReview;
