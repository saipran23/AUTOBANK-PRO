import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';

export default function Signup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        gender: '',
        email: '',
        countryCode: '+91',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        panNumber: '',
        aadharNumber: '',
        accountType: 'Savings',
        initialDeposit: 10000,
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });
    const [errors, setErrors] = useState({});

    const countryCodesOptions = [
        { code: '+91', country: 'India (IN)' },
        { code: '+1', country: 'USA/Canada (US/CA)' },
        { code: '+44', country: 'UK (GB)' },
        { code: '+61', country: 'Australia (AU)' },
        { code: '+65', country: 'Singapore (SG)' },
    ];

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getCurrentYear = () => new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => getCurrentYear() - i);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const generateAccountNumber = () => {
        return (
            '3' +
            Math.floor(100000000000 + Math.random() * 900000000000).toString()
        );
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = '✗ Full name is required';
        if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) newErrors.dob = '✗ Date of birth is required';
        if (!formData.gender) newErrors.gender = '✗ Please select gender';
        if (!formData.email.trim()) newErrors.email = '✗ Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = '✗ Invalid email format';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = '✗ Phone number is required';
        else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) newErrors.phoneNumber = '✗ Phone must be 10 digits';
        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.address.trim()) newErrors.address = '✗ Address is required';
        if (!formData.city.trim()) newErrors.city = '✗ City is required';
        if (!formData.state.trim()) newErrors.state = '✗ State is required';
        if (!formData.pincode.trim()) newErrors.pincode = '✗ Pincode is required';
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = '✗ Pincode must be 6 digits';
        if (!formData.panNumber.trim()) newErrors.panNumber = '✗ PAN is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) newErrors.panNumber = '✗ Invalid PAN format';
        if (!formData.aadharNumber.trim()) newErrors.aadharNumber = '✗ Aadhar is required';
        else if (!/^\d{12}$/.test(formData.aadharNumber)) newErrors.aadharNumber = '✗ Aadhar must be 12 digits';
        return newErrors;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.password) newErrors.password = '✗ Password is required';
        else if (formData.password.length < 6) newErrors.password = '✗ Password must be at least 6 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = '✗ Please confirm password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '✗ Passwords do not match';
        if (!formData.agreeToTerms) newErrors.agreeToTerms = '✗ You must agree to terms and conditions';
        return newErrors;
    };

    const handleNext = () => {
        let newErrors = {};
        if (step === 1) newErrors = validateStep1();
        else if (step === 2) newErrors = validateStep2();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setStep((prev) => Math.min(prev + 1, 3));
    };

    const handleBack = () => {
        setErrors({});
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateStep3();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(
                auth,
                formData.email.trim(),
                formData.password
            );

            const accountNumber = generateAccountNumber();
            const dateOfBirth = `${formData.dobDay}-${formData.dobMonth}-${formData.dobYear}`;

            const newUserData = {
                personalDetails: {
                    fullName: formData.fullName,
                    dateOfBirth: dateOfBirth,
                    gender: formData.gender,
                    email: formData.email,
                    phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
                },
                address: {
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                identity: {
                    panNumber: formData.panNumber,
                    aadharNumber: formData.aadharNumber,
                },
                accounts: [
                    {
                        accountNumber: accountNumber,
                        type: formData.accountType,
                        currentBalance: parseFloat(formData.initialDeposit),
                        availableBalance: parseFloat(formData.initialDeposit),
                        name: formData.fullName,
                        ifscCode: 'UTIB0000001',
                        transactions: [],
                    }
                ],
                createdAt: new Date().toISOString(),
            };

            await addDoc(collection(db, 'customers'), newUserData);
            navigate('/account-created', { replace: true });
        } catch (error) {
            setErrors({ general: error.message || 'Sign up failed' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Card Container */}
                <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12">
                    {/* Header */}
                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 text-center mb-3">
                            Complete KYC Process
                        </h2>
                        <p className="text-center text-gray-600 font-medium">
                            Step {step} of 3 - {step === 1 ? 'Personal Details' : step === 2 ? 'Address & Identity' : 'Account & Security'}
                        </p>
                        <p className="mt-3 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="font-semibold text-blue-600 hover:text-blue-700 transition"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between gap-2">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="flex items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all transform ${
                                            step >= num
                                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-110'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {num}
                                    </div>
                                    {num < 3 && (
                                        <div
                                            className={`flex-1 h-2 mx-2 rounded-full transition-all ${
                                                step > num ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-300'
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* General Error */}
                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
                            <p className="text-red-700 font-medium">⚠️ {errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* STEP 1: Personal Details */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Full Name <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.fullName && <p className="mt-2 text-sm text-red-600 font-medium">{errors.fullName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Date of Birth <span className="text-red-600">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <select
                                            name="dobDay"
                                            value={formData.dobDay}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium ${
                                                errors.dob ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        >
                                            <option value="">Day</option>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <option key={day} value={String(day).padStart(2, '0')}>{String(day).padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                        <select
                                            name="dobMonth"
                                            value={formData.dobMonth}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium ${
                                                errors.dob ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        >
                                            <option value="">Month</option>
                                            {months.map((month, idx) => (
                                                <option key={month} value={String(idx + 1).padStart(2, '0')}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            name="dobYear"
                                            value={formData.dobYear}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium ${
                                                errors.dob ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        >
                                            <option value="">Year</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.dob && <p className="mt-2 text-sm text-red-600 font-medium">{errors.dob}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Gender <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium ${
                                            errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="mt-2 text-sm text-red-600 font-medium">{errors.gender}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Email Address <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your.email@example.com"
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Phone Number <span className="text-red-600">*</span>
                                    </label>
                                    <div className="flex gap-3">
                                        <select
                                            name="countryCode"
                                            value={formData.countryCode}
                                            onChange={handleInputChange}
                                            className="w-28 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                        >
                                            {countryCodesOptions.map(opt => (
                                                <option key={opt.code} value={opt.code}>
                                                    {opt.code}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            placeholder="10-digit number"
                                            maxLength="10"
                                            className={`flex-1 px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                                errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        />
                                    </div>
                                    {errors.phoneNumber && <p className="mt-2 text-sm text-red-600 font-medium">{errors.phoneNumber}</p>}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 mt-8"
                                >
                                    Next Step
                                </button>
                            </div>
                        )}

                        {/* STEP 2: Address & Identity */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Street Address <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter your complete address"
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.address && <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            City <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                                errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        />
                                        {errors.city && <p className="mt-2 text-sm text-red-600 font-medium">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            State <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="State"
                                            className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                                errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        />
                                        {errors.state && <p className="mt-2 text-sm text-red-600 font-medium">{errors.state}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Postal Code <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="6-digit postal code"
                                        maxLength="6"
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.pincode && <p className="mt-2 text-sm text-red-600 font-medium">{errors.pincode}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        PAN Number <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="panNumber"
                                        value={formData.panNumber.toUpperCase()}
                                        onChange={handleInputChange}
                                        placeholder="ABCDE1234F"
                                        maxLength="10"
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono ${
                                            errors.panNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.panNumber && <p className="mt-2 text-sm text-red-600 font-medium">{errors.panNumber}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Aadhar Number <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="aadharNumber"
                                        value={formData.aadharNumber}
                                        onChange={handleInputChange}
                                        placeholder="12-digit Aadhar number"
                                        maxLength="12"
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono ${
                                            errors.aadharNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.aadharNumber && <p className="mt-2 text-sm text-red-600 font-medium">{errors.aadharNumber}</p>}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-bold transition-all transform hover:scale-[1.02] active:scale-95"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-bold transition-all transform hover:scale-[1.02] active:scale-95"
                                    >
                                        Next Step
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Account & Security */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Account Type <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        name="accountType"
                                        value={formData.accountType}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                                    >
                                        <option value="Savings">Savings Account</option>
                                        <option value="Current">Current Account</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Initial Deposit (₹) <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="initialDeposit"
                                        value={formData.initialDeposit}
                                        onChange={handleInputChange}
                                        min="10000"
                                        placeholder="Minimum ₹10,000"
                                        className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Create Password <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Minimum 6 characters"
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Confirm Password <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Re-enter your password"
                                        className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                                            errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>}
                                </div>

                                <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleInputChange}
                                            className={`h-6 w-6 mt-1 rounded cursor-pointer accent-blue-600 ${
                                                errors.agreeToTerms ? 'border-red-500' : ''
                                            }`}
                                        />
                                        <label className="text-sm text-gray-800 cursor-pointer">
                                            I agree to AutoBank's <span className="font-semibold text-blue-600">terms and conditions</span>, <span className="font-semibold text-blue-600">privacy policy</span>, and consent to data processing for banking services.
                                        </label>
                                    </div>
                                    {errors.agreeToTerms && <p className="mt-3 text-sm text-red-600 font-medium">{errors.agreeToTerms}</p>}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-bold transition-all transform hover:scale-[1.02] active:scale-95"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        {isLoading ? '⏳ Creating Account...' : '✓ Create Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="text-center mt-8 text-sm text-gray-600">
                    <p>Your information is secure and encrypted 🔒</p>
                </div>
            </div>
        </div>
    );
}
