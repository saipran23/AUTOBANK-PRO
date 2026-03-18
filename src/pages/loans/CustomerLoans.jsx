import React, { useEffect, useState, useContext } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext.jsx";
// Use with useContext(UserContext)
import { useUser } from "../../context/UserContext.jsx";
// Use as: const { user, setUser } = useUser();

const LoanStatusColors = {
    ongoing: "bg-[#00C9B1]",
    pending: "bg-[#FFD60A]",
    completed: "bg-[#00C9B1]",
};

const Section = ({ title, loans, color, onSelect }) => (
    <div className="mb-10">
        <h2 className="text-xl font-black text-black mb-4">{title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.length === 0 && (
                <div className="col-span-full text-center text-gray-500">
                    No loans in this section.
                </div>
            )}
            {loans.map(loan => (
                <div
                    key={loan.id}
                    className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none p-5 cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                    onClick={() => onSelect && onSelect(loan.id)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{loan.loanType || loan.loanDetails?.loanType}</span>
                        <span className={`px-3 py-1 text-xs rounded-none border-2 border-black font-bold ${color}`}>
              {title}
            </span>
                    </div>
                    <div className="mb-2">
                        <span className="text-gray-600">Principal:&nbsp;</span>
                        <span>₹{(loan.loanAmount || loan.principalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="mb-2">
                        <span className="text-gray-600">EMI:&nbsp;</span>
                        <span>₹{loan.emi || loan.monthlyPayment}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Term:&nbsp;</span>
                        <span>{loan.tenure || loan.totalTerm} months</span>
                    </div>
                    <div className="mt-4 text-right">
                        <span className="text-xs text-gray-500">ID: {loan.id}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const CustomerLoans = () => {
    const { user } = useContext(UserContext);
    const [pending, setPending] = useState([]);
    const [ongoing, setOngoing] = useState([]);
    const [completed, setCompleted] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.uid) return;
        const fetchLoans = async () => {
            const pendingQuery = query(
                collection(db, "loanApplications"),
                where("userId", "==", user.uid)
            );
            const pendingSnap = await getDocs(pendingQuery);
            const pendingLoans = pendingSnap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(d => d.status?.toLowerCase() !== "approved" && d.status?.toLowerCase() !== "rejected");

            setPending(pendingLoans);

            const loansQuery = collection(db, "customers", user.uid, "loans");
            const loansSnap = await getDocs(loansQuery);

            const activeLoans = [];
            const finishedLoans = [];
            loansSnap.forEach(docSnap => {
                const loan = { id: docSnap.id, ...docSnap.data() };
                if (["closed", "completed", "paid"].includes((loan.status || "").toLowerCase())) {
                    finishedLoans.push(loan);
                } else {
                    activeLoans.push(loan);
                }
            });
            setOngoing(activeLoans);
            setCompleted(finishedLoans);
        };
        fetchLoans();
    }, [user?.uid]);

    const handleSelectLoan = loanId => {
        navigate(`/loans/${loanId}`);
    };

    return (
        <div className="min-h-screen bg-[#FFFEF0]">
        <div className="max-w-5xl mx-auto w-full mt-8 mb-16 px-4">
            <h1 className="text-3xl font-black text-black mb-8">My Loans</h1>
            <Section
                title="Ongoing Loans"
                loans={ongoing}
                color={LoanStatusColors.ongoing}
                onSelect={handleSelectLoan}
            />
            <Section
                title="Need Verification"
                loans={pending}
                color={LoanStatusColors.pending}
                onSelect={handleSelectLoan}
            />
            <Section
                title="Completed Loans"
                loans={completed}
                color={LoanStatusColors.completed}
                onSelect={handleSelectLoan}
            />
        </div>
        </div>
    );
};

export default CustomerLoans;
