import React from 'react';
import Icon from '../../../components/AppIcon';

const LoanTypeSelector = ({ selectedType, onTypeSelect, loanTypes, error }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Select Loan Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loanTypes?.map((type) => (
                    <div
                        key={type?.id}
                        onClick={() => onTypeSelect(type?.id)}
                        className={`p-6 border-2 rounded-lg cursor-pointer banking-transition ${
                            selectedType === type?.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                        }`}
                        tabIndex={0}
                        role="button"
                        aria-pressed={selectedType === type?.id}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                onTypeSelect(type?.id);
                            }
                        }}
                    >
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className={`p-3 rounded-full ${
                                selectedType === type?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                                <Icon name={type?.icon} size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">{type?.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{type?.description}</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    <p>Rate from {type?.minRate}%</p>
                                    <p>Up to ${type?.maxAmount?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
};

export default LoanTypeSelector;
