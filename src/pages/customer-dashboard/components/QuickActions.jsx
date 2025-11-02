import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onTransfer }) => {
    const quickActions = [
        {
            id: 1,
            title: "Transfer Money",
            description: "Send money between accounts",
            icon: "ArrowRightLeft",
            path: "#",
            action: onTransfer,
            variant: "default"
        },
        {
            id: 2,
            title: "Pay Bills",
            description: "Schedule or pay bills",
            icon: "Receipt",
            path: "/transfer-money",
            variant: "outline"
        },
        {
            id: 3,
            title: "Get Support",
            description: "Chat with our team",
            icon: "MessageCircle",
            path: "/customer-support-chat",
            variant: "outline"
        }
    ];

    return (
        <div className="bg-card border border-border rounded-lg p-6 banking-shadow-md">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions?.map((action) => (
                    <div key={action?.id}>
                        {action?.action ? (
                            <Button
                                variant={action?.variant}
                                fullWidth
                                iconName={action?.icon}
                                iconPosition="left"
                                className="h-auto p-4 flex-col items-start text-left"
                                onClick={action?.action}
                            >
                                <div className="w-full">
                                    <div className="font-medium text-sm mb-1">{action?.title}</div>
                                    <div className="text-xs opacity-70">{action?.description}</div>
                                </div>
                            </Button>
                        ) : (
                            <Link to={action?.path} className="block">
                                <Button
                                    variant={action?.variant}
                                    fullWidth
                                    iconName={action?.icon}
                                    iconPosition="left"
                                    className="h-auto p-4 flex-col items-start text-left"
                                >
                                    <div className="w-full">
                                        <div className="font-medium text-sm mb-1">{action?.title}</div>
                                        <div className="text-xs opacity-70">{action?.description}</div>
                                    </div>
                                </Button>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
