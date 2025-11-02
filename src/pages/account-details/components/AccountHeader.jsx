import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AccountHeader = ({ accountData, onQuickAction }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const getAccountTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'checking':
        return 'CreditCard';
      case 'savings':
        return 'PiggyBank';
      case 'business':
        return 'Building2';
      default:
        return 'Wallet';
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'checking':
        return 'text-blue-600 bg-blue-50';
      case 'savings':
        return 'text-green-600 bg-green-50';
      case 'business':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border banking-shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Account Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${getAccountTypeColor(accountData?.type)}`}>
              <Icon name={getAccountTypeIcon(accountData?.type)} size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{accountData?.name}</h1>
              <p className="text-muted-foreground">Account #{accountData?.number}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(accountData?.currentBalance)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-xl font-semibold text-success">{formatCurrency(accountData?.availableBalance)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Account Type</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(accountData?.type)}`}>
                  {accountData?.type}
                </span>
                {accountData?.isPrimary && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Primary
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
          <Button
            variant="default"
            iconName="ArrowRightLeft"
            iconPosition="left"
            onClick={() => onQuickAction('transfer')}
            className="w-full"
          >
            Transfer Money
          </Button>
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={() => onQuickAction('statement')}
            className="w-full"
          >
            Download Statement
          </Button>
          <Button
            variant="ghost"
            iconName="Settings"
            iconPosition="left"
            onClick={() => onQuickAction('settings')}
            className="w-full"
          >
            Account Settings
          </Button>
        </div>
      </div>
      {/* Account Status Indicators */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-success font-medium">Account Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Shield" size={16} className="text-primary" />
          <span className="text-sm text-muted-foreground">FDIC Insured</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last updated: {accountData?.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};

export default AccountHeader;