import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FinancialInfoForm = ({ formData, onInputChange, errors }) => {
    const bankAccountTypeOptions = [
        { value: 'checking', label: 'Checking Account' },
        { value: 'savings', label: 'Savings Account' },
        { value: 'both', label: 'Both Checking & Savings' }
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Financial Information</h3>
            <div className="space-y-4">
                <h4 className="font-medium text-foreground">Assets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Checking Account Balance"
                        type="number"
                        value={formData?.checkingBalance}
                        onChange={(e) => onInputChange('checkingBalance', e?.target?.value)}
                        error={errors?.checkingBalance}
                        required
                        min="0"
                        placeholder="10000"
                    />
                    <Input
                        label="Savings Account Balance"
                        type="number"
                        value={formData?.savingsBalance}
                        onChange={(e) => onInputChange('savingsBalance', e?.target?.value)}
                        error={errors?.savingsBalance}
                        required
                        min="0"
                        placeholder="25000"
                    />
                    <Input
                        label="Investment Accounts"
                        type="number"
                        value={formData?.investmentAccounts}
                        onChange={(e) => onInputChange('investmentAccounts', e?.target?.value)}
                        error={errors?.investmentAccounts}
                        min="0"
                        placeholder="50000"
                    />
                    <Input
                        label="Retirement Accounts (401k, IRA)"
                        type="number"
                        value={formData?.retirementAccounts}
                        onChange={(e) => onInputChange('retirementAccounts', e?.target?.value)}
                        error={errors?.retirementAccounts}
                        min="0"
                        placeholder="75000"
                    />
                    <Input
                        label="Real Estate Value"
                        type="number"
                        value={formData?.realEstateValue}
                        onChange={(e) => onInputChange('realEstateValue', e?.target?.value)}
                        error={errors?.realEstateValue}
                        min="0"
                        placeholder="300000"
                    />
                    <Input
                        label="Vehicle Value"
                        type="number"
                        value={formData?.vehicleValue}
                        onChange={(e) => onInputChange('vehicleValue', e?.target?.value)}
                        error={errors?.vehicleValue}
                        min="0"
                        placeholder="25000"
                    />
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-medium text-foreground">Liabilities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Credit Card Debt"
                        type="number"
                        value={formData?.creditCardDebt}
                        onChange={(e) => onInputChange('creditCardDebt', e?.target?.value)}
                        error={errors?.creditCardDebt}
                        min="0"
                        placeholder="5000"
                    />
                    <Input
                        label="Monthly Credit Card Payments"
                        type="number"
                        value={formData?.creditCardPayments}
                        onChange={(e) => onInputChange('creditCardPayments', e?.target?.value)}
                        error={errors?.creditCardPayments}
                        min="0"
                        placeholder="200"
                    />
                    <Input
                        label="Mortgage Balance"
                        type="number"
                        value={formData?.mortgageBalance}
                        onChange={(e) => onInputChange('mortgageBalance', e?.target?.value)}
                        error={errors?.mortgageBalance}
                        min="0"
                        placeholder="250000"
                    />
                    <Input
                        label="Monthly Mortgage Payment"
                        type="number"
                        value={formData?.mortgagePayment}
                        onChange={(e) => onInputChange('mortgagePayment', e?.target?.value)}
                        error={errors?.mortgagePayment}
                        min="0"
                        placeholder="1800"
                    />
                    <Input
                        label="Auto Loan Balance"
                        type="number"
                        value={formData?.autoLoanBalance}
                        onChange={(e) => onInputChange('autoLoanBalance', e?.target?.value)}
                        error={errors?.autoLoanBalance}
                        min="0"
                        placeholder="15000"
                    />
                    <Input
                        label="Monthly Auto Payment"
                        type="number"
                        value={formData?.autoLoanPayment}
                        onChange={(e) => onInputChange('autoLoanPayment', e?.target?.value)}
                        error={errors?.autoLoanPayment}
                        min="0"
                        placeholder="350"
                    />
                    <Input
                        label="Other Monthly Debt Payments"
                        type="number"
                        value={formData?.otherDebtPayments}
                        onChange={(e) => onInputChange('otherDebtPayments', e?.target?.value)}
                        error={errors?.otherDebtPayments}
                        min="0"
                        placeholder="300"
                    />
                    <Input
                        label="Monthly Rent (if applicable)"
                        type="number"
                        value={formData?.monthlyRent}
                        onChange={(e) => onInputChange('monthlyRent', e?.target?.value)}
                        error={errors?.monthlyRent}
                        min="0"
                        placeholder="2000"
                    />
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-medium text-foreground">Banking Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Primary Bank Name"
                        type="text"
                        value={formData?.primaryBank}
                        onChange={(e) => onInputChange('primaryBank', e?.target?.value)}
                        error={errors?.primaryBank}
                        required
                        placeholder="Chase Bank"
                    />
                    <Select
                        label="Account Type"
                        options={bankAccountTypeOptions}
                        value={formData?.bankAccountType}
                        onChange={(value) => onInputChange('bankAccountType', value)}
                        error={errors?.bankAccountType}
                        required
                    />
                    <Input
                        label="Years with Bank"
                        type="number"
                        value={formData?.yearsWithBank}
                        onChange={(e) => onInputChange('yearsWithBank', e?.target?.value)}
                        error={errors?.yearsWithBank}
                        required
                        min="0"
                        max="50"
                    />
                </div>
            </div>
        </div>
    );
};

export default FinancialInfoForm;
