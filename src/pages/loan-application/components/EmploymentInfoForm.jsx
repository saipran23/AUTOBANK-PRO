import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const EmploymentInfoForm = ({ formData, onInputChange, errors }) => {
    const employmentTypeOptions = [
        { value: 'full-time', label: 'Full-time Employee' },
        { value: 'part-time', label: 'Part-time Employee' },
        { value: 'self-employed', label: 'Self-employed' },
        { value: 'contractor', label: 'Independent Contractor' },
        { value: 'retired', label: 'Retired' },
        { value: 'unemployed', label: 'Unemployed' }
    ];

    const incomeFrequencyOptions = [
        { value: 'monthly', label: 'Monthly' },
        { value: 'bi-weekly', label: 'Bi-weekly' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'annually', label: 'Annually' }
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Employment Type"
                    options={employmentTypeOptions}
                    value={formData?.employmentType}
                    onChange={(value) => onInputChange('employmentType', value)}
                    error={errors?.employmentType}
                    required
                />

                <Input
                    label="Job Title"
                    type="text"
                    value={formData?.jobTitle}
                    onChange={(e) => onInputChange('jobTitle', e?.target?.value)}
                    error={errors?.jobTitle}
                    required
                    placeholder="Software Engineer"
                />

                <Input
                    label="Employer Name"
                    type="text"
                    value={formData?.employerName}
                    onChange={(e) => onInputChange('employerName', e?.target?.value)}
                    error={errors?.employerName}
                    required
                    placeholder="ABC Corporation"
                    className="md:col-span-2"
                />

                <Input
                    label="Work Phone"
                    type="tel"
                    value={formData?.workPhone}
                    onChange={(e) => onInputChange('workPhone', e?.target?.value)}
                    error={errors?.workPhone}
                    required
                    placeholder="(555) 987-6543"
                />

                <Input
                    label="Years with Employer"
                    type="number"
                    value={formData?.yearsWithEmployer}
                    onChange={(e) => onInputChange('yearsWithEmployer', e?.target?.value)}
                    error={errors?.yearsWithEmployer}
                    required
                    min="0"
                    max="50"
                />
            </div>
            <div className="space-y-4">
                <h4 className="font-medium text-foreground">Income Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Gross Income"
                        type="number"
                        value={formData?.grossIncome}
                        onChange={(e) => onInputChange('grossIncome', e?.target?.value)}
                        error={errors?.grossIncome}
                        required
                        min="0"
                        placeholder="5000"
                    />

                    <Select
                        label="Income Frequency"
                        options={incomeFrequencyOptions}
                        value={formData?.incomeFrequency}
                        onChange={(value) => onInputChange('incomeFrequency', value)}
                        error={errors?.incomeFrequency}
                        required
                    />

                    <Input
                        label="Additional Income (Optional)"
                        type="number"
                        value={formData?.additionalIncome}
                        onChange={(e) => onInputChange('additionalIncome', e?.target?.value)}
                        error={errors?.additionalIncome}
                        min="0"
                        placeholder="1000"
                    />

                    <Input
                        label="Additional Income Source"
                        type="text"
                        value={formData?.additionalIncomeSource}
                        onChange={(e) => onInputChange('additionalIncomeSource', e?.target?.value)}
                        error={errors?.additionalIncomeSource}
                        placeholder="Rental income, investments, etc."
                    />
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-medium text-foreground">Employer Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Employer Address"
                        type="text"
                        value={formData?.employerAddress}
                        onChange={(e) => onInputChange('employerAddress', e?.target?.value)}
                        error={errors?.employerAddress}
                        required
                        placeholder="456 Business Ave"
                        className="md:col-span-2"
                    />

                    <Input
                        label="City"
                        type="text"
                        value={formData?.employerCity}
                        onChange={(e) => onInputChange('employerCity', e?.target?.value)}
                        error={errors?.employerCity}
                        required
                        placeholder="New York"
                    />

                    <Input
                        label="State"
                        type="text"
                        value={formData?.employerState}
                        onChange={(e) => onInputChange('employerState', e?.target?.value)}
                        error={errors?.employerState}
                        required
                        placeholder="NY"
                    />

                    <Input
                        label="ZIP Code"
                        type="text"
                        value={formData?.employerZipCode}
                        onChange={(e) => onInputChange('employerZipCode', e?.target?.value)}
                        error={errors?.employerZipCode}
                        required
                        placeholder="10001"
                    />
                </div>
            </div>
        </div>
    );
};

export default EmploymentInfoForm;
