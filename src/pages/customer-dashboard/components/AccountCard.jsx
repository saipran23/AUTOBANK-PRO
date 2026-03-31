import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountCard = ({ accounts, totalBalance }) => {
    const navigate = useNavigate();

    if (!accounts || accounts.length === 0) {
        return (
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-8 text-white">
                <p className="text-sm font-medium opacity-90">No accounts available</p>
            </div>
        );
    }

    const primaryAccount = accounts[0];

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-8 text-white">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-sm font-medium opacity-90">Total Balance</p>
                        <h2 className="text-4xl font-bold">₹{(totalBalance || 0).toFixed(2)}</h2>
                    </div>
                    <div className="text-3xl">💳</div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs opacity-75 mb-2">Card Number</p>
                        <p className="text-lg tracking-wider">{primaryAccount?.number || '****'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs opacity-75 mb-2">{primaryAccount?.name || 'Account'}</p>
                        <p className="text-sm opacity-90">Valid</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {accounts.map((account) => (
                    <div
                        key={account.id}
                        onClick={() => navigate(`/account-details/${account.id}`)}
                        className="bg-surface rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                    >
                        <p className="text-xs text-muted-foreground mb-2">{account.type}</p>
                        <p className="font-semibold">₹{(account.currentBalance || 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-2">{account.number}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccountCard;
