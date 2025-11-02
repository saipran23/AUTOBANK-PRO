import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ApplicationReview = ({
                               formData,
                               selectedLoanType,
                               loanTypes,
                               uploadedDocuments,
                               creditScore,
                               onEdit,
                               isSubmitting,
                               onSubmissionComplete
                           }) => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const currentLoanType = loanTypes?.find(type => type?.id === selectedLoanType);

    const calculateMonthlyPayment = () => {
        const principal = parseFloat(formData?.loanAmount) || 0;
        const rate = (currentLoanType?.minRate || 5) / 100 / 12;
        const term = parseInt(formData?.loanTerm) || 12;
        if (principal > 0 && rate > 0 && term > 0) {
            const monthlyPayment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
            return monthlyPayment?.toFixed(2);
        }
        return '0.00';
    };

    const calculateTotalInterest = () => {
        const monthlyPayment = parseFloat(calculateMonthlyPayment());
        const principal = parseFloat(formData?.loanAmount) || 0;
        const term = parseInt(formData?.loanTerm) || 12;
        const totalPayments = monthlyPayment * term;
        const totalInterest = totalPayments - principal;
        return totalInterest > 0 ? totalInterest?.toFixed(2) : '0.00';
    };

    const getRequiredDocumentsCount = () => {
        const requiredDocs = ['income-verification', 'bank-statements', 'identification'];
        return requiredDocs.filter(docId =>
            uploadedDocuments?.some(doc => doc?.category === docId)
        ).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!termsAccepted || submitting) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'loanApplications'), {
                formData: { ...formData },
                loanType: currentLoanType?.name || 'Personal Loan',
                creditScore,
                createdAt: serverTimestamp(),
                status: 'Pending Review'
            });

            setSubmitted(true);
            if (onSubmissionComplete) onSubmissionComplete();
        } catch (error) {
            console.error('Error submitting loan application:', error);
            alert('Failed to submit loan application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="space-y-8 flex flex-col items-center py-20">
                <Icon name="CheckCircle" size={64} className="text-green-600 mb-6" />
                <h3 className="text-2xl font-bold text-foreground">Application Submitted!</h3>
                <p className="text-lg text-muted-foreground max-w-xl text-center">
                    Your loan application has been successfully submitted and stored in our database. You will be contacted within 1–3 business days.
                </p>
                <Button variant="primary" size="lg" onClick={() => (window.location.href = '/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const sections = [
        {
            title: 'Personal Information',
            icon: 'User',
            step: 1,
            data: [
                { label: 'Name', value: `${formData?.title} ${formData?.firstName} ${formData?.lastName}` },
                { label: 'Date of Birth', value: formData?.dateOfBirth },
                { label: 'SSN', value: `***-**-${formData?.ssn?.slice(-4) || '****'}` },
                { label: 'Phone', value: formData?.phone },
                { label: 'Email', value: formData?.email },
                { label: 'Address', value: `${formData?.address}, ${formData?.city}, ${formData?.state} ${formData?.zipCode}` }
            ]
        },
        {
            title: 'Employment Information',
            icon: 'Briefcase',
            step: 2,
            data: [
                { label: 'Employment Type', value: formData?.employmentType },
                { label: 'Job Title', value: formData?.jobTitle },
                { label: 'Employer', value: formData?.employerName },
                { label: 'Years with Employer', value: `${formData?.yearsWithEmployer} years` },
                { label: 'Gross Income', value: `$${parseFloat(formData?.grossIncome || 0)?.toLocaleString()} ${formData?.incomeFrequency}` }
            ]
        },
        {
            title: 'Financial Information',
            icon: 'DollarSign',
            step: 3,
            data: [
                { label: 'Checking Balance', value: `$${parseFloat(formData?.checkingBalance || 0)?.toLocaleString()}` },
                { label: 'Savings Balance', value: `$${parseFloat(formData?.savingsBalance || 0)?.toLocaleString()}` },
                { label: 'Monthly Debt Payments', value: `$${(
                        parseFloat(formData?.creditCardPayments || 0) +
                        parseFloat(formData?.mortgagePayment || 0) +
                        parseFloat(formData?.autoLoanPayment || 0) +
                        parseFloat(formData?.otherDebtPayments || 0)
                    )?.toLocaleString()}` },
                { label: 'Primary Bank', value: formData?.primaryBank }
            ]
        },
        {
            title: 'Loan Details',
            icon: 'FileText',
            step: 4,
            data: [
                { label: 'Loan Type', value: currentLoanType?.name },
                { label: 'Loan Amount', value: `$${parseFloat(formData?.loanAmount || 0)?.toLocaleString()}` },
                { label: 'Loan Term', value: `${formData?.loanTerm} months` },
                { label: 'Purpose', value: formData?.loanPurpose },
                ...(formData?.otherPurpose ? [{ label: 'Other Purpose', value: formData?.otherPurpose }] : [])
            ]
        }
    ];

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <h3 className="text-lg font-semibold text-foreground">Review Your Application</h3>
                <p className="text-sm text-muted-foreground mt-1">Please review all information before submitting your loan application.</p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h4 className="font-semibold text-foreground mb-4">Loan Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Loan Amount</p>
                        <p className="text-xl font-bold text-primary">${formData?.loanAmount?.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="text-xl font-bold text-foreground">${calculateMonthlyPayment()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Interest Rate (Est.)</p>
                        <p className="text-xl font-bold text-foreground">{currentLoanType?.minRate || 5}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-xl font-bold text-foreground">${calculateTotalInterest()}</p>
                    </div>
                </div>
            </div>

            {sections.map((section, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Icon name={section.icon} size={16} className="text-primary" />
                            </div>
                            <h4 className="font-semibold text-foreground">{section.title}</h4>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(section.step)} iconName="Edit" iconPosition="left">Edit</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.data.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{item.label}:</span>
                                <span className="text-sm font-medium text-foreground">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon name="Upload" size={16} className="text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground">Documents</h4>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Required Documents Uploaded:</span>
                    <span className="text-sm font-medium text-foreground">{getRequiredDocumentsCount()}/3 Required</span>
                </div>
            </div>

            <div className="bg-muted p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                    <input type="checkbox" id="terms" className="mt-1" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} />
                    <label htmlFor="terms" className="text-sm text-foreground">
                        I acknowledge that I have read and agree to the{' '}
                        <a href="#" className="text-primary hover:underline">Terms and Conditions</a>,{' '}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>, and{' '}
                        <a href="#" className="text-primary hover:underline">Loan Agreement</a>.
                    </label>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <Button variant="primary" size="lg" type="submit" loading={submitting} disabled={!termsAccepted || submitting}>
                    {submitting ? 'Submitting...' : 'Submit Loan Application'}
                </Button>
            </div>
        </form>
    );
};

export default ApplicationReview;
