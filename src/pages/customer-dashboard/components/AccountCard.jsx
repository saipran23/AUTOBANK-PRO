import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountCard = ({ accounts, totalBalance }) => {
    const navigate = useNavigate();

    if (!accounts || accounts.length === 0) {
        return (
            <div className="bg-[#FFD60A] border-2 border-black p-8 text-black shadow-[4px_4px_0px_#000]">
                <p className="text-sm font-bold text-black">No accounts available</p>
            </div>
        );
    }

    const primaryAccount = accounts[0];

    return (
        <div className="space-y-4">
            <div className="bg-[#FFD60A] border-2 border-black p-8 text-black shadow-[4px_4px_0px_#000]">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-sm font-bold text-black">Total Balance</p>
                        <h2 className="text-4xl font-black text-black">₹{(totalBalance || 0).toFixed(2)}</h2>
                    </div>
                    <div className="text-3xl">💳</div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs font-bold text-black mb-2">Card Number</p>
                        <p className="text-lg font-mono font-bold tracking-wider">{primaryAccount?.number || '****'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-black mb-2">{primaryAccount?.name || 'Account'}</p>
                        <p className="text-sm font-medium">Valid</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {accounts.map((account) => (
                    <div
                        key={account.id}
                        onClick={() => navigate(`/account-details/${account.id}`)}
                        className="bg-white border-2 border-black p-4 cursor-pointer hover:bg-[#FFD60A] hover:shadow-[4px_4px_0px_#000] shadow-[2px_2px_0px_#000] transition-all"
                    >
                        <p className="text-xs font-bold text-gray-600 mb-2">{account.type}</p>
                        <p className="font-black text-black">₹{(account.currentBalance || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-600 font-medium mt-2">{account.number}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccountCard;
