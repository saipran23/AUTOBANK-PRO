import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PersonalInfoForm = ({ formData, onInputChange, errors }) => {
    const titleOptions = [
        { value: 'mr', label: 'Mr.' },
        { value: 'mrs', label: 'Mrs.' },
        { value: 'ms', label: 'Ms.' },
        { value: 'dr', label: 'Dr.' }
    ];

    const maritalStatusOptions = [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' }
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Title"
                    options={titleOptions}
                    value={formData?.title}
                    onChange={(value) => onInputChange('title', value)}
                    error={errors?.title}
                    required
                />

                <Input
                    label="First Name"
                    type="text"
                    value={formData?.firstName}
                    onChange={(e) => onInputChange('firstName', e?.target?.value)}
                    error={errors?.firstName}
                    required
                    placeholder="Enter your first name"
                />

                <Input
                    label="Last Name"
                    type="text"
                    value={formData?.lastName}
                    onChange={(e) => onInputChange('lastName', e?.target?.value)}
                    error={errors?.lastName}
                    required
                    placeholder="Enter your last name"
                />

                <Input
                    label="Date of Birth"
                    type="date"
                    value={formData?.dateOfBirth}
                    onChange={(e) => onInputChange('dateOfBirth', e?.target?.value)}
                    error={errors?.dateOfBirth}
                    required
                />

                <Input
                    label="Social Security Number"
                    type="text"
                    value={formData?.ssn}
                    onChange={(e) => onInputChange('ssn', e?.target?.value)}
                    error={errors?.ssn}
                    required
                    placeholder="XXX-XX-XXXX"
                />

                <Select
                    label="Marital Status"
                    options={maritalStatusOptions}
                    value={formData?.maritalStatus}
                    onChange={(value) => onInputChange('maritalStatus', value)}
                    error={errors?.maritalStatus}
                    required
                />

                <Input
                    label="Phone Number"
                    type="tel"
                    value={formData?.phone}
                    onChange={(e) => onInputChange('phone', e?.target?.value)}
                    error={errors?.phone}
                    required
                    placeholder="(555) 123-4567"
                />

                <Input
                    label="Email Address"
                    type="email"
                    value={formData?.email}
                    onChange={(e) => onInputChange('email', e?.target?.value)}
                    error={errors?.email}
                    required
                    placeholder="john.doe@email.com"
                />
            </div>
            <div className="space-y-4">
                <h4 className="font-medium text-foreground">Current Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Street Address"
                        type="text"
                        value={formData?.address}
                        onChange={(e) => onInputChange('address', e?.target?.value)}
                        error={errors?.address}
                        required
                        placeholder="123 Main Street"
                        className="md:col-span-2"
                    />

                    <Input
                        label="City"
                        type="text"
                        value={formData?.city}
                        onChange={(e) => onInputChange('city', e?.target?.value)}
                        error={errors?.city}
                        required
                        placeholder="New York"
                    />

                    <Input
                        label="State"
                        type="text"
                        value={formData?.state}
                        onChange={(e) => onInputChange('state', e?.target?.value)}
                        error={errors?.state}
                        required
                        placeholder="NY"
                    />

                    <Input
                        label="ZIP Code"
                        type="text"
                        value={formData?.zipCode}
                        onChange={(e) => onInputChange('zipCode', e?.target?.value)}
                        error={errors?.zipCode}
                        required
                        placeholder="10001"
                    />

                    <Input
                        label="Years at Address"
                        type="number"
                        value={formData?.yearsAtAddress}
                        onChange={(e) => onInputChange('yearsAtAddress', e?.target?.value)}
                        error={errors?.yearsAtAddress}
                        required
                        min="0"
                        max="50"
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoForm;
