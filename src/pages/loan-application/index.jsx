import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ProgressIndicator from './components/ProgressIndicator';
import LoanTypeSelector from './components/LoanTypeSelector';
import PersonalInfoForm from './components/PersonalInfoForm';
import EmploymentInfoForm from './components/EmploymentInfoForm';
import FinancialInfoForm from './components/FinancialInfoForm';
import LoanDetailsForm from './components/LoanDetailsForm';
import DocumentUpload from './components/DocumentUpload';
import CreditScoreCheck from './components/CreditScoreCheck';
import ApplicationReview from './components/ApplicationReview';

import { db, auth } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const LoanApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedLoanType, setSelectedLoanType] = useState('');
    const [userId, setUserId] = useState(null); // ⭐ NEW: Track userId
    const [userEmail, setUserEmail] = useState(null); // ⭐ NEW: Track email
    const [isAuthLoading, setIsAuthLoading] = useState(true); // ⭐ NEW: Auth loading state
    const [formData, setFormData] = useState({
        // Personal Info
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        ssn: '',
        maritalStatus: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        yearsAtAddress: '',
        // Employment Info
        employmentType: '',
        jobTitle: '',
        employerName: '',
        workPhone: '',
        yearsWithEmployer: '',
        grossIncome: '',
        incomeFrequency: '',
        additionalIncome: '',
        additionalIncomeSource: '',
        employerAddress: '',
        employerCity: '',
        employerState: '',
        employerZipCode: '',
        // Financial Info
        checkingBalance: '',
        savingsBalance: '',
        investmentAccounts: '',
        retirementAccounts: '',
        realEstateValue: '',
        vehicleValue: '',
        creditCardDebt: '',
        creditCardPayments: '',
        mortgageBalance: '',
        mortgagePayment: '',
        autoLoanBalance: '',
        autoLoanPayment: '',
        otherDebtPayments: '',
        monthlyRent: '',
        primaryBank: '',
        bankAccountType: '',
        yearsWithBank: '',
        // Loan Details
        loanAmount: '',
        loanTerm: '',
        loanPurpose: '',
        otherPurpose: '',
        // Auto/Mortgage
        vehicleYear: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleMileage: '',
        vehicleVin: '',
        propertyAddress: '',
        propertyValue: '',
        downPayment: ''
    });
    const [errors, setErrors] = useState({});
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [creditScore, setCreditScore] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loanTypes = [
        {
            id: 'personal',
            name: 'Personal Loan',
            description: 'Unsecured loans for personal expenses',
            icon: 'User',
            minRate: 6.99,
            maxAmount: 50000
        },
        {
            id: 'auto',
            name: 'Auto Loan',
            description: 'Financing for new and used vehicles',
            icon: 'Car',
            minRate: 4.49,
            maxAmount: 100000
        },
        {
            id: 'mortgage',
            name: 'Home Mortgage',
            description: 'Home purchase and refinancing loans',
            icon: 'Home',
            minRate: 3.25,
            maxAmount: 1000000
        }
    ];

    const steps = [
        { title: 'Loan Type', description: 'Choose your loan type' },
        { title: 'Personal Info', description: 'Basic information' },
        { title: 'Employment', description: 'Work and income details' },
        { title: 'Financial', description: 'Assets and liabilities' },
        { title: 'Loan Details', description: 'Loan specifications' },
        { title: 'Documents', description: 'Upload required files' },
        { title: 'Credit Check', description: 'Verify credit score' },
        { title: 'Review', description: 'Final review and submit' }
    ];

    // ⭐ NEW: Check authentication on component mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('✅ User logged in:', user.uid);
                setUserId(user.uid);
                setUserEmail(user.email);
                // ⭐ Auto-fill email from logged-in user
                setFormData(prev => ({
                    ...prev,
                    email: user.email || ''
                }));
            } else {
                console.warn('❌ No user logged in, redirecting to login');
                navigate('/login');
            }
            setIsAuthLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors?.[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleDocumentUpload = (category, file) => {
        const newDocument = {
            id: Date.now() + Math.random(),
            category,
            name: file?.name,
            size: file?.size,
            uploadDate: new Date()?.toLocaleDateString(),
            file
        };
        setUploadedDocuments(prev => [...prev, newDocument]);
    };

    const handleDocumentRemove = documentId => {
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    };

    const handleCreditScoreUpdate = score => {
        setCreditScore(score);
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!selectedLoanType) newErrors.loanType = 'Please select a loan type';
                break;
            case 2:
                if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
                if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
                if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
                if (!formData.ssn?.trim()) newErrors.ssn = 'SSN is required';
                if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
                if (!formData.email?.trim()) newErrors.email = 'Email is required';
                if (!formData.address?.trim()) newErrors.address = 'Address is required';
                if (!formData.city?.trim()) newErrors.city = 'City is required';
                if (!formData.state) newErrors.state = 'State is required';
                if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip code is required';
                break;
            case 3:
                if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
                if (!formData.jobTitle?.trim()) newErrors.jobTitle = 'Job title is required';
                if (!formData.employerName?.trim()) newErrors.employerName = 'Employer name is required';
                if (!formData.yearsWithEmployer) newErrors.yearsWithEmployer = 'Years with employer is required';
                if (!formData.grossIncome) newErrors.grossIncome = 'Gross income is required';
                if (!formData.incomeFrequency) newErrors.incomeFrequency = 'Income frequency is required';
                break;
            case 4:
                if (!formData.checkingBalance) newErrors.checkingBalance = 'Checking balance is required';
                if (!formData.primaryBank?.trim()) newErrors.primaryBank = 'Primary bank is required';
                break;
            case 5:
                if (!formData.loanAmount) newErrors.loanAmount = 'Loan amount is required';
                if (!formData.loanTerm) newErrors.loanTerm = 'Loan term is required';
                if (!formData.loanPurpose) newErrors.loanPurpose = 'Loan purpose is required';
                break;
            case 8:
                // Final validation before submit
                if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
                if (!formData.loanAmount) newErrors.loanAmount = 'Loan amount is required';
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleStepEdit = (step) => {
        setCurrentStep(step);
    };

    // ⭐ UPDATED: Submit with userId
    const handleSubmit = async () => {
        if (!validateStep(8)) return;

        // ⭐ Verify userId exists
        if (!userId) {
            alert('User ID not found. Please log in again.');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        const selectedLoanTypeObj = loanTypes.find(t => t.id === selectedLoanType);

        const loanData = {
            // ⭐ CRITICAL: Include userId for later approval balance update
            userId: userId, // This is the customer's Firebase UID
            userEmail: userEmail, // Email for reference

            loanType: selectedLoanTypeObj?.name || 'Personal Loan',
            loanAmount: parseFloat(formData.loanAmount),
            tenure: parseInt(formData.loanTerm),
            loanPurpose: formData.loanPurpose,
            creditScore: creditScore || 700,

            personalInfo: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                ssn: formData.ssn,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
            },

            employmentInfo: {
                employmentType: formData.employmentType,
                jobTitle: formData.jobTitle,
                employerName: formData.employerName,
                yearsWithEmployer: formData.yearsWithEmployer,
                grossIncome: parseFloat(formData.grossIncome),
                incomeFrequency: formData.incomeFrequency,
            },

            financialInfo: {
                checkingBalance: parseFloat(formData.checkingBalance),
                savingsBalance: parseFloat(formData.savingsBalance || 0),
                monthlyDebtPayments: parseFloat(formData.creditCardPayments || 0) +
                    parseFloat(formData.mortgagePayment || 0) +
                    parseFloat(formData.autoLoanPayment || 0) +
                    parseFloat(formData.otherDebtPayments || 0),
            },

            documents: uploadedDocuments.map(doc => ({
                id: doc.id,
                category: doc.category,
                name: doc.name,
                size: doc.size,
                uploadDate: doc.uploadDate
                // Note: file object is not stored in Firestore, only metadata
            })),

            status: 'Pending Review',
            submittedAt: Timestamp.now(),

            // ⭐ For audit trail
            createdAt: Timestamp.now(),
            lastModified: Timestamp.now()
        };

        try {
            console.log('📝 Submitting loan application with userId:', userId);
            const docRef = await addDoc(collection(db, 'loanApplications'), loanData);

            console.log('✅ Loan application submitted successfully:', docRef.id);
            setIsSubmitting(false);

            alert('✅ Application submitted! You will get a status update soon.');

            // ⭐ Redirect to customer dashboard to see application status
            navigate('/customer-dashboard');
        } catch (err) {
            setIsSubmitting(false);
            console.error('❌ Error submitting loan application:', err);
            alert('Failed to submit loan application: ' + err.message);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <LoanTypeSelector
                        selectedType={selectedLoanType}
                        onTypeSelect={setSelectedLoanType}
                        loanTypes={loanTypes}
                    />
                );
            case 2:
                return (
                    <PersonalInfoForm
                        formData={formData}
                        onInputChange={handleInputChange}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <EmploymentInfoForm
                        formData={formData}
                        onInputChange={handleInputChange}
                        errors={errors}
                    />
                );
            case 4:
                return (
                    <FinancialInfoForm
                        formData={formData}
                        onInputChange={handleInputChange}
                        errors={errors}
                    />
                );
            case 5:
                return (
                    <LoanDetailsForm
                        formData={formData}
                        onInputChange={handleInputChange}
                        errors={errors}
                        selectedLoanType={selectedLoanType}
                        loanTypes={loanTypes}
                    />
                );
            case 6:
                return (
                    <DocumentUpload
                        uploadedDocuments={uploadedDocuments}
                        onDocumentUpload={handleDocumentUpload}
                        onDocumentRemove={handleDocumentRemove}
                    />
                );
            case 7:
                return (
                    <CreditScoreCheck
                        onCreditScoreUpdate={handleCreditScoreUpdate}
                    />
                );
            case 8:
                return (
                    <ApplicationReview
                        formData={formData}
                        selectedLoanType={selectedLoanType}
                        loanTypes={loanTypes}
                        uploadedDocuments={uploadedDocuments}
                        creditScore={creditScore}
                        onEdit={handleStepEdit}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    // ⭐ Show loading while checking auth
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Header />
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground mt-4">Loading your application...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-16">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Breadcrumb />
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Icon name="FileText" size={28} color="white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Loan Application</h1>
                                <p className="text-muted-foreground">Complete your loan application in simple steps</p>
                                {/* ⭐ Show logged-in user */}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Logged in as: <strong>{userEmail}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                    <ProgressIndicator
                        currentStep={currentStep}
                        totalSteps={steps.length}
                        steps={steps}
                    />
                    <div className="bg-card border border-border rounded-lg banking-shadow-md">
                        <div className="p-6 lg:p-8">
                            {renderStepContent()}
                        </div>
                        <div className="border-t border-border p-6 lg:p-8">
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 1}
                                    iconName="ChevronLeft"
                                    iconPosition="left"
                                >
                                    Previous
                                </Button>
                                {currentStep < steps.length ? (
                                    <Button
                                        variant="primary"
                                        onClick={handleNext}
                                        disabled={currentStep === 1 && !selectedLoanType}
                                        iconName="ChevronRight"
                                        iconPosition="right"
                                    >
                                        {currentStep === 7 && !creditScore ? 'Skip Credit Check' : 'Next'}
                                    </Button>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        Review and submit your application above
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 bg-muted p-6 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <Icon name="HelpCircle" size={20} className="text-primary mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-foreground">Need Help?</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Our loan specialists are available to assist you with your application.
                                    Call us at (555) 123-4567 or chat with us online.
                                </p>
                                <div className="mt-3 flex space-x-4">
                                    <Button className="px-6 py-3 text-lg" variant="outline" size="sm" iconName="Phone" iconPosition="left">
                                        Call Support
                                    </Button>
                                    <Button className="px-6 py-3 text-lg" variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
                                        Live Chat
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoanApplication;
