import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const responses = [
    {
        id: 1,
        title: 'Greeting',
        content: 'Hello! Thank you for contacting AutoBank support. How can I assist you today?'
    },
    {
        id: 2,
        title: 'Account Balance',
        content: 'I can help you check your account balance. To get started, please provide me with your account number or the email associated with your account.'
    },
    {
        id: 3,
        title: 'Card Issue',
        content: 'I understand you\'re experiencing an issue with your card. Let me help you resolve this. Could you please describe the specific issue you\'re facing?'
    },
    {
        id: 4,
        title: 'Transaction Dispute',
        content: 'I can help you dispute a transaction. Please provide me with the date of the transaction, amount, and recipient details so I can investigate.'
    },
    {
        id: 5,
        title: 'Loan Application',
        content: 'Thank you for your interest in our loan products. I can help you track your application status or answer any questions about the process.'
    },
    {
        id: 6,
        title: 'Waiting Response',
        content: 'Thank you for your patience. I\'m currently reviewing your inquiry and will get back to you shortly with an update.'
    },
    {
        id: 7,
        title: 'Apology',
        content: 'I sincerely apologize for the inconvenience you\'ve experienced. We take your concerns seriously and are here to help resolve this matter.'
    },
    {
        id: 8,
        title: 'Escalation',
        content: 'I understand this is a complex issue. Let me escalate this to our specialist team who will have more expertise in handling this matter. They will contact you shortly.'
    },
    {
        id: 9,
        title: 'Resolution',
        content: 'I\'m glad we could resolve your issue. Is there anything else I can help you with today?'
    },
    {
        id: 10,
        title: 'Follow-up',
        content: 'Just following up on your previous inquiry. Do you still need assistance, or has your issue been resolved?'
    }
];

const CannedResponses = ({ onSelectResponse }) => {
    const [showResponses, setShowResponses] = useState(false);

    return (
        <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">
                    Canned Responses
                </h3>
                <Button
                    aria-expanded={showResponses}
                    size="sm"
                    variant={showResponses ? 'default' : 'outline'}
                    onClick={() => setShowResponses(s => !s)}
                    title={showResponses ? "Hide canned responses" : "Show canned responses"}
                >
                    <Icon name={showResponses ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </Button>
            </div>

            {showResponses && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {responses.map((response) => (
                        <Button
                            key={response.id}
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectResponse?.(response.content)}
                            className="flex items-center text-left"
                            title={`Send: ${response.content}`}
                            aria-label={response.title}
                        >
                            <Icon name="Copy" size={14} className="mr-2" />
                            <span>{response.title}</span>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CannedResponses;
