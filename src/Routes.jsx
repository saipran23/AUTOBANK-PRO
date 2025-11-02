import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

// ============================================
// CUSTOMER PAGES
// ============================================
import CustomerSupportChat from "./pages/customer-support-chat";
import Login from "./pages/login";
import Signup from "./pages/signup";
import AccountDetails from "./pages/account-details";
import TransferMoney from "./pages/transfer-money";
import CustomerDashboard from "./pages/customer-dashboard";
import LoanApplication from "./pages/loan-application";
import AccountCreated from "./pages/account-created";
import ProfileSettings from "./pages/profile-settings";
import LandingDashboard from "./pages/landing/LandingDashboard";
import TransactionsPage from "./pages/transactions";
import CustomerLoans from "./pages/loans/CustomerLoans";
import LoanDetails from "./pages/loans/LoanDetails";

// ============================================
// EMPLOYEE PAGES
// ============================================
import EmployeeLogin from "./pages/employee/EmployeeLogin";
import EmployeeSignup from "./pages/employee/EmployeeSignup";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeChatPortal from "./pages/employee-chat";

const Routes = () => {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <ScrollToTop />
                <RouterRoutes>
                    {/* ============================================ */}
                    {/* LANDING PAGE */}
                    {/* ============================================ */}
                    <Route path="/" element={<LandingDashboard />} />

                    {/* ============================================ */}
                    {/* CUSTOMER AUTHENTICATION ROUTES */}
                    {/* ============================================ */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/account-created" element={<AccountCreated />} />

                    {/* ============================================ */}
                    {/* CUSTOMER MAIN ROUTES */}
                    {/* ============================================ */}
                    <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                    <Route path="/support" element={<CustomerSupportChat />} />
                    <Route path="/account-details/:accountId" element={<AccountDetails />} />
                    <Route path="/account-details" element={<AccountDetails />} />
                    <Route path="/profile-settings" element={<ProfileSettings />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/transfer-money" element={<TransferMoney />} />

                    {/* ============================================ */}
                    {/* CUSTOMER LOAN ROUTES */}
                    {/* ============================================ */}
                    <Route path="/loans" element={<CustomerLoans />} />
                    <Route path="/loans/:id" element={<LoanDetails />} />
                    <Route path="/loan-details" element={<LoanDetails />} />
                    <Route path="/loan-application" element={<LoanApplication />} />

                    {/* ============================================ */}
                    {/* EMPLOYEE AUTHENTICATION ROUTES */}
                    {/* ============================================ */}
                    <Route path="/employee/login" element={<EmployeeLogin />} />
                    <Route path="/employee/signup" element={<EmployeeSignup />} />

                    {/* ============================================ */}
                    {/* EMPLOYEE MAIN ROUTES */}
                    {/* ============================================ */}
                    <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

                    {/* ============================================ */}
                    {/* EMPLOYEE CHAT PORTAL ROUTE */}
                    {/* ============================================ */}
                    <Route path="/employee/chat" element={<EmployeeChatPortal />} />

                    {/* ============================================ */}
                    {/* 404 FALLBACK - MUST BE LAST */}
                    {/* ============================================ */}
                    <Route path="*" element={<NotFound />} />
                </RouterRoutes>
            </ErrorBoundary>
        </BrowserRouter>
    );
};

export default Routes;
