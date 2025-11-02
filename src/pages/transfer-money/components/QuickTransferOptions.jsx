import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickTransferOptions = ({ onQuickTransfer, accounts }) => {
    // Use your real accounts (example: checking/savings/business IDs)
    const checking = accounts.find(a => a.type === 'checking');
    const savings = accounts.find(a => a.type === 'savings');
    const business = accounts.find(a => a.type === 'business');
    const quickTransferOptions = [
        {
            id: 'recent-1',
            type: 'recent',
            recipient: 'Sarah Johnson',
            sourceAccount: checking?.id,
            destinationAccount: savings?.id,
            amount: 500,
            icon: 'User',
            description: 'Last transfer: Oct 20, 2025'
        },
        {
            id: 'recent-2',
            type: 'recent',
            recipient: 'Business Account',
            sourceAccount: checking?.id,
            destinationAccount: business?.id,
            amount: 1200,
            icon: 'Building2',
            description: 'Last transfer: Oct 18, 2025'
        }
        // ...add more as needed
    ];

    const handleQuickTransfer = (option) => {
        onQuickTransfer({
            sourceAccount: option.sourceAccount,
            destinationAccount: option.destinationAccount,
            transferType: "internal",
            amount: option.amount,
            frequency: 'once',
            recipientName: option.recipient,
            memo: `Quick transfer to ${option.recipient}`
        });
    };

    return (
        <div>
            {quickTransferOptions.map((option) => (
                <div key={option.id} onClick={() => handleQuickTransfer(option)}>
                    {option.recipient} - ${option.amount}
                </div>
            ))}
        </div>
    );
};

export default QuickTransferOptions;
