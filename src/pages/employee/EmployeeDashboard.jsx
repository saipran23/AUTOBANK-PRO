import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import LoanReview from "./LoanReview";

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { logout, user, loading: authLoading } = useAuth();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("accounts");
    const [accountSearch, setAccountSearch] = useState("");
    const [unreadChats, setUnreadChats] = useState(0);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            console.log('❌ Not authenticated, redirecting to login');
            navigate("/employee/login", { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Fetch customers from Firestore
    async function fetchCustomerData() {
        setLoading(true);
        try {
            const snapshot = await getDocs(collection(db, "customers"));
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCustomers(data);
            console.log("✅ Customers fetched:", data.length);
        } catch (error) {
            console.error("❌ Error fetching customers:", error);
        }
        setLoading(false);
    }

    // Fetch unread chats count
    async function fetchUnreadChats() {
        try {
            const chatsSnapshot = await getDocs(collection(db, "supportChats"));
            const unread = chatsSnapshot.docs.filter(
                (doc) => doc.data().status === "waiting-assignment"
            ).length;
            setUnreadChats(unread);
        } catch (error) {
            console.error("❌ Error fetching unread chats:", error);
        }
    }

    useEffect(() => {
        if (!authLoading && user) {
            fetchCustomerData();
            fetchUnreadChats();

            // Refresh unread chats every 10 seconds
            const interval = setInterval(fetchUnreadChats, 10000);
            return () => clearInterval(interval);
        }
    }, [user, authLoading]);

    const handleLogout = async () => {
        try {
            console.log('🚪 Logging out employee...');
            await logout();
            console.log('✅ Logout successful');
            navigate("/employee/login", { replace: true });
        } catch (error) {
            console.error('❌ Logout error:', error);
            alert('Error logging out. Please try again.');
        }
    };

    const totalUsers = customers.length;
    const totalAccounts = customers.reduce(
        (sum, c) => sum + (c.accounts?.length || 0),
        0
    );
    const totalBalance = customers.reduce(
        (sum, c) =>
            sum +
            (c.accounts?.reduce((acc, a) => acc + (a.currentBalance || 0), 0) || 0),
        0
    );
    const transactions = customers.flatMap((c) =>
        c.accounts
            ? c.accounts.flatMap((acc) =>
                (acc.transactions || []).map((t) => ({
                    ...t,
                    fromAccount: t.fromAccount || acc.accountNumber || acc.number || "",
                    toAccount: t.toAccount || "",
                    customer: c,
                    account: acc,
                }))
            )
            : []
    );
    const totalTransactions = transactions.length;

    const formatDate = (isoString) =>
        isoString ? new Date(isoString).toLocaleDateString("en-IN") : "-";
    const formatTime = (isoString) =>
        isoString ? new Date(isoString).toLocaleTimeString("en-IN") : "-";

    // ACCOUNTS TAB SECTION
    const AccountsTab = () => {
        const [activeAccount, setActiveAccount] = useState(null);
        const [showEdit, setShowEdit] = useState(false);
        const [editName, setEditName] = useState("");
        const [editPhone, setEditPhone] = useState("");
        const [editPhotoUrl, setEditPhotoUrl] = useState("");
        const [editEmail, setEditEmail] = useState("");
        const [editDob, setEditDob] = useState("");
        const [editGender, setEditGender] = useState("");
        const [editAadhar, setEditAadhar] = useState("");
        const [editPan, setEditPan] = useState("");
        const [editAddress, setEditAddress] = useState("");

        useEffect(() => {
            if (activeAccount && activeAccount.customer) {
                setEditName(activeAccount.customer.personalDetails?.fullName || "");
                setEditPhone(activeAccount.customer.personalDetails?.phoneNumber || "");
                setEditPhotoUrl(activeAccount.customer.photoUrl || "");
                setEditEmail(activeAccount.customer.personalDetails?.email || "");
                setEditDob(activeAccount.customer.personalDetails?.dateOfBirth || "");
                setEditGender(activeAccount.customer.personalDetails?.gender || "");
                setEditAadhar(activeAccount.customer.identity?.aadharNumber || "");
                setEditPan(activeAccount.customer.identity?.panNumber || "");
                setEditAddress(
                    [
                        activeAccount.customer.address?.street,
                        activeAccount.customer.address?.city,
                        activeAccount.customer.address?.state,
                        activeAccount.customer.address?.pincode,
                    ]
                        .filter(Boolean)
                        .join(", ")
                );
            }
        }, [activeAccount, showEdit]);

        function handlePhotoChange(e) {
            const file = e.target.files;
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setEditPhotoUrl(reader.result);
                reader.readAsDataURL(file);
            }
        }

        async function handleUpdateSubmit(e) {
            e.preventDefault();
            if (!activeAccount) return;
            try {
                const customerDoc = doc(db, "customers", activeAccount.customer.id);
                const addressParts = editAddress.split(",").map((s) => s.trim());
                await updateDoc(customerDoc, {
                    "personalDetails.fullName": editName,
                    "personalDetails.phoneNumber": editPhone,
                    "personalDetails.email": editEmail,
                    "personalDetails.dateOfBirth": editDob,
                    "personalDetails.gender": editGender,
                    "identity.aadharNumber": editAadhar,
                    "identity.panNumber": editPan,
                    "address.street": addressParts || "",
                    "address.city": addressParts || "",
                    "address.state": addressParts || "",
                    "address.pincode": addressParts || "",
                    "photoUrl": editPhotoUrl,
                });
                console.log("✅ Customer updated successfully");
                setShowEdit(false);
                await fetchCustomerData();
            } catch (error) {
                console.error("❌ Error updating customer:", error);
                alert("Error updating customer. Please try again.");
            }
        }

        const allAccounts = customers.flatMap((c) =>
            (c.accounts || []).map((a) => ({
                ...a,
                customer: c,
            }))
        ) || [];

        const filteredAccounts = allAccounts.filter((a) => {
            const name = (
                a.customer.personalDetails?.fullName ||
                a.customer.name ||
                ""
            ).toLowerCase();
            const accNum = (a.accountNumber || a.number || "").toString();
            const custId = (
                a.customer.customerID ||
                a.customer.id ||
                ""
            ).toString().toLowerCase();
            return (
                name.includes(accountSearch.toLowerCase()) ||
                accNum.includes(accountSearch) ||
                custId.includes(accountSearch.toLowerCase())
            );
        });

        return (
            <div className="p-6 bg-white rounded-xl shadow w-full mt-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-blue-800">
                            Account Management
                        </h2>
                        <p className="text-gray-500">All bank accounts in the system</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Search accounts..."
                        className="px-4 py-2 border rounded-lg focus:outline-none w-64 shadow-sm"
                        value={accountSearch}
                        onChange={(e) => setAccountSearch(e.target.value)}
                    />
                </div>
                {filteredAccounts.length === 0 && (
                    <div className="mt-6 p-6 text-center text-gray-400 font-semibold">
                        No accounts found for your search.
                    </div>
                )}
                {filteredAccounts.length > 0 && !activeAccount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAccounts.map((a, idx) => (
                            <div
                                key={
                                    (a.accountNumber || a.number || idx) + "-" + idx
                                }
                                className="border-2 border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-blue-600 hover:shadow-lg transition duration-300 bg-gradient-to-br from-white to-blue-50"
                                onClick={() => setActiveAccount(a)}
                                style={{ minHeight: 190 }}
                            >
                                <div className="font-bold text-lg mb-2 text-gray-900">
                                    {a.customer.personalDetails?.fullName ||
                                        a.customer.name ||
                                        "Unknown"}
                                </div>
                                <div className="text-xs text-gray-700 mb-1">
                                    <b>Customer ID:</b> {a.customer.customerID || a.customer.id}
                                </div>
                                <div className="text-xs text-gray-700 mb-1">
                                    <b>A/C No:</b> {a.accountNumber || a.number || "-"}
                                </div>
                                <div className="text-xs text-gray-700 mb-1">
                                    <b>Account Type:</b> {a.name || a.type}
                                </div>
                                <div className="text-xs text-gray-700 mb-2">
                                    <b>Status:</b>{" "}
                                    <span className="text-green-600 font-semibold">
                                        {a.status}
                                    </span>
                                </div>
                                <hr className="my-2" />
                                <div className="text-base font-bold text-blue-600">
                                    Balance: ₹
                                    {a.currentBalance?.toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }) || "0.00"}
                                </div>
                                <div className="text-xs text-gray-400 mt-2 text-right italic">
                                    Click to view details
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeAccount && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-8 z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-xl">
                            <button
                                className="mb-3 text-blue-700 hover:underline text-xs font-semibold"
                                onClick={() => {
                                    setActiveAccount(null);
                                    setShowEdit(false);
                                }}
                            >
                                ← Back to all accounts
                            </button>
                            {showEdit ? (
                                <form
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    onSubmit={handleUpdateSubmit}
                                >
                                    <div>
                                        <label className="block font-semibold mb-1">Name:</label>
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Phone:</label>
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Email:</label>
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">DOB:</label>
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            value={editDob}
                                            onChange={(e) => setEditDob(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Gender:</label>
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            value={editGender}
                                            onChange={(e) => setEditGender(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Aadhar#:</label>
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            value={editAadhar}
                                            onChange={(e) => setEditAadhar(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">PAN#:</label>
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            value={editPan}
                                            onChange={(e) => setEditPan(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Address:</label>
                                        <input
                                            className="border rounded px-2 py-1 w-full"
                                            value={editAddress}
                                            onChange={(e) => setEditAddress(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1">Photo:</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                        {editPhotoUrl && (
                                            <img
                                                src={editPhotoUrl}
                                                alt="Account"
                                                className="mt-2 w-28 h-28 object-cover rounded"
                                            />
                                        )}
                                    </div>
                                    <div className="md:col-span-2 flex gap-4 mt-4">
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white rounded px-6 py-2 font-bold hover:bg-blue-700 transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-gray-400 text-white rounded px-6 py-2 font-bold hover:bg-gray-500 transition"
                                            onClick={() => setShowEdit(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {editPhotoUrl && (
                                        <img
                                            src={editPhotoUrl}
                                            alt="Profile"
                                            className="mb-5 w-32 h-32 object-cover rounded-full border-4 border-blue-200 mx-auto"
                                        />
                                    )}
                                    <div className="font-bold text-2xl mb-2 text-blue-950 text-center">
                                        {activeAccount.customer.personalDetails?.fullName ||
                                            activeAccount.customer.name ||
                                            "Unknown"}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-6">
                                        <div>
                                            <b>Customer ID:</b> {activeAccount.customer.customerID || activeAccount.customer.id}
                                        </div>
                                        <div>
                                            <b>Email:</b> {activeAccount.customer.personalDetails?.email}
                                        </div>
                                        <div>
                                            <b>Phone:</b> {activeAccount.customer.personalDetails?.phoneNumber}
                                        </div>
                                        <div>
                                            <b>DOB:</b> {activeAccount.customer.personalDetails?.dateOfBirth}
                                        </div>
                                        <div>
                                            <b>Aadhar#:</b> {activeAccount.customer.identity?.aadharNumber}
                                        </div>
                                        <div>
                                            <b>PAN#:</b> {activeAccount.customer.identity?.panNumber}
                                        </div>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="font-bold text-xl mb-2">Account Details</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-6">
                                        <div>
                                            <b>A/C Number:</b> {activeAccount.accountNumber || activeAccount.number}
                                        </div>
                                        <div>
                                            <b>A/C Type:</b> {activeAccount.name || activeAccount.type}
                                        </div>
                                        <div>
                                            <b>Status:</b> {activeAccount.status}
                                        </div>
                                        <div>
                                            <b>Opened:</b> {activeAccount.openedDate ? formatDate(activeAccount.openedDate) : "-"}
                                        </div>
                                        <div className="text-blue-600 font-bold">
                                            <b>Current Balance:</b> ₹
                                            {activeAccount.currentBalance?.toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </div>
                                        <div>
                                            <b>Available Balance:</b> ₹
                                            {activeAccount.availableBalance?.toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </div>
                                    </div>
                                    <hr className="my-3" />
                                    <button
                                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold text-lg transition"
                                        onClick={() => setShowEdit(true)}
                                    >
                                        Edit Account
                                    </button>
                                    <button
                                        className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-bold text-lg transition"
                                        onClick={() => setActiveAccount(null)}
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // TRANSACTIONS TAB SECTION
    const TransactionsTab = () => {
        const [selectedTx, setSelectedTx] = useState(null);

        return (
            <div className="p-6 bg-white rounded-xl shadow w-full mt-6">
                <h2 className="text-2xl font-bold mb-3 text-blue-800">
                    Transaction Monitor
                </h2>
                <p className="text-gray-500 mb-4">Recent transaction activity</p>
                {!loading && (!transactions.length ? (
                    <div className="mt-10 p-10 text-center text-gray-400 font-semibold">
                        No recent transactions
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl">
                        <table className="min-w-full text-sm bg-white border rounded-xl shadow">
                            <thead>
                            <tr className="bg-blue-100 text-blue-900">
                                <th className="py-2 px-3 text-left">Txn ID</th>
                                <th className="py-2 px-3 text-left">Description</th>
                                <th className="py-2 px-3 text-left">Amount</th>
                                <th className="py-2 px-3 text-left">Type</th>
                                <th className="py-2 px-3 text-left">Date</th>
                                <th className="py-2 px-3 text-left">Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((t, idx) => (
                                <tr
                                    key={t.id || idx}
                                    className="border-b hover:bg-blue-50 cursor-pointer transition"
                                    onClick={() => setSelectedTx(t)}
                                >
                                    <td className="py-2 px-3 font-mono text-xs">{(t.id || "").substring(0, 8)}...</td>
                                    <td className="py-2 px-3 text-sm">{t.description || "-"}</td>
                                    <td className="py-2 px-3 font-semibold">₹{t.amount?.toLocaleString("en-IN")}</td>
                                    <td className="py-2 px-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                t.type === 'debit' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {t.type}
                                            </span>
                                    </td>
                                    <td className="py-2 px-3">{formatDate(t.date)}</td>
                                    <td className="py-2 px-3">{formatTime(t.date)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ))}
                {selectedTx && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
                        <div className="bg-white p-8 rounded-2xl max-w-lg w-full shadow-2xl">
                            <h3 className="text-xl font-bold mb-4 text-blue-900">
                                Transaction Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <b>Txn ID:</b> {selectedTx.id}
                                </div>
                                <div>
                                    <b>Description:</b> {selectedTx.description || "-"}
                                </div>
                                <div>
                                    <b>Amount:</b> <span className="font-bold text-lg">₹{selectedTx.amount?.toLocaleString("en-IN")}</span>
                                </div>
                                <div>
                                    <b>Type:</b> <span className={selectedTx.type === 'debit' ? 'text-red-600' : 'text-green-600'}>{selectedTx.type}</span>
                                </div>
                                <div>
                                    <b>Date:</b> {selectedTx.date ? new Date(selectedTx.date).toLocaleString("en-IN") : "-"}
                                </div>
                                <div>
                                    <b>Status:</b> {selectedTx.status || "Completed"}
                                </div>
                                <div>
                                    <b>Memo:</b> {selectedTx.memo || "-"}
                                </div>
                            </div>
                            <button
                                className="mt-6 w-full px-4 py-2 bg-blue-700 text-white rounded shadow font-semibold hover:bg-blue-800 transition"
                                onClick={() => setSelectedTx(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // USERS TAB SECTION
    const UserList = () => (
        <div className="p-6 bg-white rounded-xl shadow w-full mt-6">
            <div className="flex flex-wrap gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 min-w-[180px] flex-1">
                    <span className="text-gray-600 text-sm">Total Users</span>
                    <div className="text-3xl font-bold">{totalUsers}</div>
                    <div className="text-gray-500 mt-1 text-xs">Registered customers</div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 min-w-[180px] flex-1">
                    <span className="text-gray-600 text-sm">Total Accounts</span>
                    <div className="text-3xl font-bold">{totalAccounts}</div>
                    <div className="text-gray-500 mt-1 text-xs">Active bank accounts</div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500 min-w-[220px] flex-1">
                    <span className="text-gray-600 text-sm">Total Balance</span>
                    <div className="text-3xl font-bold overflow-x-auto">
                        ₹{totalBalance.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                    </div>
                    <div className="text-gray-500 mt-1 text-xs">System-wide balance</div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500 min-w-[180px] flex-1">
                    <span className="text-gray-600 text-sm">Transactions</span>
                    <div className="text-3xl font-bold">{totalTransactions}</div>
                    <div className="text-gray-500 mt-1 text-xs">Recent transactions</div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-blue-800 mb-3">User Management</h2>
            <p className="mb-3 text-gray-500">Overview of all registered users</p>

            <div className="flex font-semibold text-lg text-gray-700 border-b pb-2 mb-2">
                <div className="flex-1">Name</div>
                <div className="flex-1">Email</div>
                <div className="flex-1">Phone Number</div>
                <div className="flex-1 text-right">Joined Date</div>
            </div>

            {loading && <div className="text-center py-6 text-gray-500">Loading users...</div>}
            {!loading && customers.length === 0 && <div className="text-center py-6 text-gray-400">No users found.</div>}
            {!loading &&
                customers.map((u) => (
                    <div
                        key={u.id}
                        className="flex flex-row items-center border rounded-xl p-4 mb-3 hover:bg-blue-50 cursor-default transition"
                    >
                        <div className="flex-1 text-lg font-semibold text-gray-900 min-w-0 truncate">
                            {u.personalDetails?.fullName || u.name || "Unknown User"}
                        </div>
                        <div className="flex-1 text-lg text-gray-600 min-w-0 truncate">
                            {u.personalDetails?.email || u.email || "-"}
                        </div>
                        <div className="flex-1 text-lg font-semibold text-gray-900 min-w-0 truncate">
                            {u.personalDetails?.phoneNumber || "-"}
                        </div>
                        <div className="flex-1 text-lg text-gray-500 min-w-0 truncate text-right">
                            Joined: {u.createdAt ? formatDate(u.createdAt) : "-"}
                        </div>
                    </div>
                ))}
        </div>
    );

    // AUDIT LOGS TAB
    const AuditLogsTab = () => (
        <div className="p-6 bg-white rounded-xl shadow w-full mt-6">
            <h2 className="text-2xl font-bold mb-3 text-blue-800">Audit Trail</h2>
            <p className="text-gray-500">System activity logs</p>
            <div className="mt-6 p-6 text-center text-gray-400">
                No audit logs available
            </div>
        </div>
    );

    // TAB RENDERING - ⭐ CRITICAL: Added LoanReview rendering
    const renderTabContent = () => {
        switch (activeTab) {
            case "users":
                return <UserList />;
            case "accounts":
                return <AccountsTab />;
            case "transactions":
                return <TransactionsTab />;
            case "loans":
                return <LoanReview />;
            case "audit":
                return <AuditLogsTab />;
            default:
                return null;
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white shadow px-6 py-4 flex items-center gap-4 rounded-b-xl">
                <div className="flex items-center gap-3 pr-8">
                    <span className="text-3xl font-extrabold text-blue-800">
                        AutoBank-Pro
                    </span>
                    <span className="text-gray-500 text-lg">Admin Portal</span>
                </div>
                <nav className="flex space-x-2 text-sm font-semibold text-gray-600">
                    <button
                        className={`py-2 px-3 rounded-t-lg transition ${
                            activeTab === "users"
                                ? "bg-blue-50 border border-b-0 border-gray-200 text-gray-900"
                                : "hover:text-gray-800"
                        }`}
                        onClick={() => setActiveTab("users")}
                    >
                        Users
                    </button>
                    <button
                        className={`py-2 px-3 rounded-t-lg transition ${
                            activeTab === "accounts"
                                ? "bg-blue-50 border border-b-0 border-gray-200 text-gray-900"
                                : "hover:text-gray-800"
                        }`}
                        onClick={() => setActiveTab("accounts")}
                    >
                        Accounts
                    </button>
                    <button
                        className={`py-2 px-3 rounded-t-lg transition ${
                            activeTab === "transactions"
                                ? "bg-blue-50 border border-b-0 border-gray-200 text-gray-900"
                                : "hover:text-gray-800"
                        }`}
                        onClick={() => setActiveTab("transactions")}
                    >
                        Transactions
                    </button>
                    <button
                        className={`py-2 px-3 rounded-t-lg transition ${
                            activeTab === "loans"
                                ? "bg-blue-50 border border-b-0 border-gray-200 text-gray-900"
                                : "hover:text-gray-800"
                        }`}
                        onClick={() => setActiveTab("loans")}
                    >
                        Loan Review
                    </button>
                </nav>

                {/* Chat Support Button */}
                <button
                    className="ml-auto mr-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow transition flex items-center gap-2 relative"
                    onClick={() => navigate("/employee/chat")}
                    title="Go to Chat Support Portal"
                >
                    <span className="text-lg">💬 Chat Support</span>
                    {unreadChats > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {unreadChats}
                        </span>
                    )}
                </button>

                {/* Logout Button */}
                <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition font-semibold"
                    onClick={handleLogout}
                    title="Sign out"
                >
                    Logout
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-2 ml-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </div>
                    <span className="text-gray-700 text-sm hidden sm:block">
                        {user?.displayName || user?.email}
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <section className="w-full px-6" style={{ paddingTop: "84px" }}>
                {renderTabContent()}
            </section>
        </div>
    );
};

export default EmployeeDashboard;
