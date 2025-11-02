import React from 'react';
import Icon from '../../../components/AppIcon';

const TransferProgress = ({ currentStep, totalSteps }) => {
    const steps = [
        { id: 1, name: 'Transfer Details', icon: 'Send' },
        { id: 2, name: 'Confirmation', icon: 'CheckCircle' },
        { id: 3, name: 'Processing', icon: 'Clock' },
        { id: 4, name: 'Complete', icon: 'Check' }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center
                                    ${currentStep === step.id ? 'bg-primary text-white' : ''}
                                    ${currentStep > step.id ? 'bg-success text-white' : ''}
                                    ${currentStep < step.id ? 'bg-gray-200 text-gray-400' : ''}
                                    transition-all duration-300
                                `}
                            >
                                {currentStep > step.id ? (
                                    <Icon name="Check" size={24} />
                                ) : (
                                    <Icon name={step.icon} size={24} />
                                )}
                            </div>
                            <p className={`
                                mt-2 text-sm font-medium
                                ${currentStep >= step.id ? 'text-text' : 'text-text-secondary'}
                            `}>
                                {step.name}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-2" style={{
                                backgroundColor: currentStep > step.id ? 'var(--color-success)' :
                                    currentStep === step.id ? 'var(--color-primary)' :
                                        'var(--color-border)'
                            }} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default TransferProgress;
