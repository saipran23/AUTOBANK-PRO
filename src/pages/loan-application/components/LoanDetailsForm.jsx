import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const LoanDetailsForm = ({ formData, onInputChange, errors, selectedLoanType, loanTypes }) => {
    const loanPurposeOptions = {
        personal: [
            { value: 'debt-consolidation', label: 'Debt Consolidation' },
            { value: 'home-improvement', label: 'Home Improvement' },
            { value: 'medical', label: 'Medical Expenses' },
            { value: 'vacation', label: 'Vacation' },
            { value: 'wedding', label: 'Wedding' },
            { value: 'other', label: 'Other' }
        ],
        auto: [
            { value: 'new-car', label: 'New Car Purchase' },
            { value: 'used-car', label: 'Used Car Purchase' },
            { value: 'refinance', label: 'Auto Loan Refinance' }
        ],
        mortgage: [
            { value: 'purchase', label: 'Home Purchase' },
            { value: 'refinance', label: 'Mortgage Refinance' },
            { value: 'cash-out', label: 'Cash-out Refinance' }
        ]
    };

    const termOptions = {
        personal: [
            { value: '12', label: '12 months' },
            { value: '24', label: '24 months' },
            { value: '36', label: '36 months' },
            { value: '48', label: '48 months' },
            { value: '60', label: '60 months' }
        ],
        auto: [
            { value: '36', label: '36 months' },
            { value: '48', label: '48 months' },
            { value: '60', label: '60 months' },
            { value: '72', label: '72 months' },
            { value: '84', label: '84 months' }
        ],
        mortgage: [
            { value: '180', label: '15 years' },
            { value: '360', label: '30 years' }
        ]
    };

    const currentLoanType = loanTypes?.find(type => type?.id === selectedLoanType);
    const currentPurposeOptions = loanPurposeOptions?.[selectedLoanType] || [];
    const currentTermOptions = termOptions?.[selectedLoanType] || [];

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

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Loan Amount"
                    type="number"
                    value={formData?.loanAmount}
                    onChange={(e) => onInputChange('loanAmount', e?.target?.value)}
                    error={errors?.loanAmount}
                    required
                    min="1000"
                    max={currentLoanType?.maxAmount || 100000}
                    placeholder="25000"
                />
                <Select
                    label="Loan Term"
                    options={currentTermOptions}
                    value={formData?.loanTerm}
                    onChange={(value) => onInputChange('loanTerm', value)}
                    error={errors?.loanTerm}
                    required
                />
                <Select
                    label="Loan Purpose"
                    options={currentPurposeOptions}
                    value={formData?.loanPurpose}
                    onChange={(value) => onInputChange('loanPurpose', value)}
                    error={errors?.loanPurpose}
                    required
                    className="md:col-span-2"
                />
                {formData?.loanPurpose === 'other' && (
                    <Input
                        label="Please specify"
                        type="text"
                        value={formData?.otherPurpose}
                        onChange={(e) => onInputChange('otherPurpose', e?.target?.value)}
                        error={errors?.otherPurpose}
                        required
                        placeholder="Describe the purpose of your loan"
                        className="md:col-span-2"
                    />
                )}
            </div>
            {/* Loan Calculator */}
            {formData?.loanAmount && formData?.loanTerm && (
                <div className="bg-muted p-6 rounded-lg">
                    <h4 className="font-medium text-foreground mb-4">Loan Calculation Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                            <p className="text-2xl font-bold text-primary">${calculateMonthlyPayment()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Interest</p>
                            <p className="text-xl font-semibold text-foreground">${calculateTotalInterest()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Interest Rate (Est.)</p>
                            <p className="text-xl font-semibold text-foreground">{currentLoanType?.minRate || 5}%</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                        * This is an estimate. Actual rates and terms may vary based on credit approval.
                    </div>
                </div>
            )}
            {/* Auto Loan Specific Fields */}
            {selectedLoanType === 'auto' && (
                <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Vehicle Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Vehicle Year"
                            type="number"
                            value={formData?.vehicleYear}
                            onChange={(e) => onInputChange('vehicleYear', e?.target?.value)}
                            error={errors?.vehicleYear}
                            required
                            min="1990"
                            max={new Date().getFullYear() + 1}
                            placeholder="2023"
                        />
                        <Input
                            label="Vehicle Make"
                            type="text"
                            value={formData?.vehicleMake}
                            onChange={(e) => onInputChange('vehicleMake', e?.target?.value)}
                            error={errors?.vehicleMake}
                            required
                            placeholder="Toyota"
                        />
                        <Input
                            label="Vehicle Model"
                            type="text"
                            value={formData?.vehicleModel}
                            onChange={(e) => onInputChange('vehicleModel', e?.target?.value)}
                            error={errors?.vehicleModel}
                            required
                            placeholder="Camry"
                        />
                        <Input
                            label="Vehicle Mileage"
                            type="number"
                            value={formData?.vehicleMileage}
                            onChange={(e) => onInputChange('vehicleMileage', e?.target?.value)}
                            error={errors?.vehicleMileage}
                            min="0"
                            placeholder="25000"
                        />
                        <Input
                            label="VIN Number"
                            type="text"
                            value={formData?.vehicleVin}
                            onChange={(e) => onInputChange('vehicleVin', e?.target?.value)}
                            error={errors?.vehicleVin}
                            placeholder="1HGBH41JXMN109186"
                            className="md:col-span-2"
                        />
                    </div>
                </div>
            )}
            {/* Mortgage Specific Fields */}
            {selectedLoanType === 'mortgage' && (
                <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Property Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Property Address"
                            type="text"
                            value={formData?.propertyAddress}
                            onChange={(e) => onInputChange('propertyAddress', e?.target?.value)}
                            error={errors?.propertyAddress}
                            required
                            placeholder="789 Property Lane"
                            className="md:col-span-2"
                        />
                        <Input
                            label="Property Value"
                            type="number"
                            value={formData?.propertyValue}
                            onChange={(e) => onInputChange('propertyValue', e?.target?.value)}
                            error={errors?.propertyValue}
                            required
                            min="50000"
                            placeholder="350000"
                        />
                        <Input
                            label="Down Payment"
                            type="number"
                            value={formData?.downPayment}
                            onChange={(e) => onInputChange('downPayment', e?.target?.value)}
                            error={errors?.downPayment}
                            required
                            min="0"
                            placeholder="70000"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanDetailsForm;
