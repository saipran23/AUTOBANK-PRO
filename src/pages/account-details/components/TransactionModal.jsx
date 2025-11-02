import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionModal = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return { icon: 'ArrowDown', color: 'text-success bg-success/10' };
      case 'withdrawal':
        return { icon: 'ArrowUp', color: 'text-error bg-error/10' };
      case 'transfer':
        return { icon: 'ArrowRightLeft', color: 'text-primary bg-primary/10' };
      case 'payment':
        return { icon: 'CreditCard', color: 'text-warning bg-warning/10' };
      case 'fee':
        return { icon: 'Minus', color: 'text-error bg-error/10' };
      case 'interest':
        return { icon: 'Plus', color: 'text-success bg-success/10' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground bg-muted' };
    }
  };

  const getAmountColor = (amount) => {
    return amount >= 0 ? 'text-success' : 'text-error';
  };

  const { icon, color } = getTransactionIcon(transaction?.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-lg border border-border banking-shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${color}`}>
              <Icon name={icon} size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Transaction Details</h2>
              <p className="text-muted-foreground">Reference: {transaction?.reference || transaction?.id}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className={`text-2xl font-bold ${getAmountColor(transaction?.amount)}`}>
                  {transaction?.amount >= 0 ? '+' : '-'}{formatCurrency(transaction?.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance After</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(transaction?.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Transaction Details</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span className="font-medium text-foreground">{transaction?.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                      {transaction?.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction?.status === 'completed' 
                        ? 'bg-success/10 text-success' 
                        : transaction?.status === 'pending' ?'bg-warning/10 text-warning' :'bg-error/10 text-error'
                    }`}>
                      {transaction?.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-medium text-foreground text-right">
                      {formatDate(transaction?.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Additional Information</p>
                <div className="space-y-3">
                  {transaction?.merchant && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Merchant:</span>
                      <span className="font-medium text-foreground">{transaction?.merchant}</span>
                    </div>
                  )}
                  {transaction?.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium text-foreground">{transaction?.category}</span>
                    </div>
                  )}
                  {transaction?.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-foreground">{transaction?.location}</span>
                    </div>
                  )}
                  {transaction?.fee && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee:</span>
                      <span className="font-medium text-error">{formatCurrency(transaction?.fee)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Shield" size={18} className="text-primary" />
              <p className="font-medium text-foreground">Security Information</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-foreground">{transaction?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authorization:</span>
                <span className="font-mono text-foreground">{transaction?.authCode || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Time:</span>
                <span className="text-foreground">{transaction?.processingTime || 'Instant'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel:</span>
                <span className="text-foreground">{transaction?.channel || 'Online Banking'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              className="flex-1"
              onClick={() => console.log('Download receipt')}
            >
              Download Receipt
            </Button>
            <Button
              variant="outline"
              iconName="Flag"
              iconPosition="left"
              className="flex-1"
              onClick={() => console.log('Report issue')}
            >
              Report Issue
            </Button>
            {transaction?.type === 'transfer' && (
              <Button
                variant="outline"
                iconName="Repeat"
                iconPosition="left"
                className="flex-1"
                onClick={() => console.log('Repeat transaction')}
              >
                Repeat Transfer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;