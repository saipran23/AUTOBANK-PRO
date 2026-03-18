import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from '../../context/UserContext.jsx';

const LoanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();  // assumes UserContext provides user with uid
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchLoan = async () => {
            // Fetch loan from customer's loans subcollection
            try {
                const docRef = doc(db, "customers", user.uid, "loans", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setLoan({ id: docSnap.id, ...docSnap.data() });
                } else {
                    // fallback: check loanApplications collection for pending
                    const appRef = doc(db, "loanApplications", id);
                    const appSnap = await getDoc(appRef);
                    if (appSnap.exists()) {
                        setLoan({ id: appSnap.id, ...appSnap.data() });
                    } else {
                        setLoan(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching loan data:", error);
                setLoan(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLoan();
    }, [id, user]);

    if (loading) return <div className="min-h-screen bg-[#FFFEF0] flex items-center justify-center p-6 text-center font-bold">Loading...</div>;
    if (!loan) return <div className="min-h-screen bg-[#FFFEF0] flex items-center justify-center p-6 text-center text-[#FF6B6B] font-bold">Loan not found</div>;

    return (
        <div className="min-h-screen bg-[#FFFEF0] p-6">
        <div className="max-w-3xl mx-auto bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-8">
            <button
                className="mb-4 px-4 py-2 bg-white border-2 border-black font-bold shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                onClick={() => navigate("/loans")}
            >
                ← Back to Loans
            </button>
            <h1 className="text-2xl font-black text-black mb-6">Loan Details</h1>
            <div className="border-b-2 border-black pb-4 mb-4">
                <strong>Loan Type: </strong> {loan.loanType || loan.loanDetails?.loanType || "N/A"}
            </div>
            <div className="border-b-2 border-black pb-4 mb-4">
                <strong>Status: </strong> <span className="border-2 border-black font-bold px-2 py-0.5">{loan.status || "N/A"}</span>
            </div>
            <div className="border-b-2 border-black pb-4 mb-4">
                <strong>Amount: </strong> <span className="font-black text-black text-2xl">₹{loan.loanAmount?.toLocaleString() || loan.principalAmount?.toLocaleString() || 0}</span>
            </div>
            <div className="border-b-2 border-black pb-4 mb-4">
                <strong>EMI: </strong> ₹{loan.emi || loan.monthlyPayment || "N/A"}
            </div>
            <div className="border-b-2 border-black pb-4 mb-4">
                <strong>Term: </strong> {loan.tenure || loan.totalTerm || "N/A"} months
            </div>
            <div className="border-b-2 border-black pb-4 mb-4">
                <strong>Interest Rate: </strong> {loan.interestRate || loan.approvedRate || "N/A"}%
            </div>
            <div className="mb-4">
                <strong>Timeline:</strong>
                <ul className="list-disc pl-5 mt-2 max-h-48 overflow-auto text-sm text-gray-600">
                    {(loan.timeline || []).map((event, idx) => (
                        <li key={idx}>
                            <span className="font-semibold">{event.status}</span>: {event.description} on {event.date && event.date.seconds
                            ? new Date(event.date.seconds * 1000).toLocaleDateString()
                            : event.date}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        </div>
    );
};

export default LoanDetails;
