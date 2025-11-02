import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AccountActions = ({ accountData }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'transfer',
      title: 'Transfer Money',
      description: 'Send money to another account',
      icon: 'ArrowRightLeft',
      color: 'text-primary bg-primary/10',
      action: () => navigate('/transfer-money')
    },
    {
      id: 'deposit',
      title: 'Mobile Deposit',
      description: 'Deposit checks using your phone',
      icon: 'Smartphone',
      color: 'text-success bg-success/10',
      action: () => console.log('Mobile deposit')
    },
    {
      id: 'billpay',
      title: 'Pay Bills',
      description: 'Schedule and manage bill payments',
      icon: 'Receipt',
      color: 'text-warning bg-warning/10',
      action: () => console.log('Bill pay')
    },
    {
      id: 'statements',
      title: 'View Statements',
      description: 'Download account statements',
      icon: 'FileText',
      color: 'text-purple-600 bg-purple-100',
      action: () => console.log('View statements')
    }
  ];

  const accountServices = [
    {
      id: 'alerts',
      title: 'Account Alerts',
      description: 'Manage notification preferences',
      icon: 'Bell',
      action: () => console.log('Account alerts')
    },
    {
      id: 'limits',
      title: 'Transaction Limits',
      description: 'View and modify spending limits',
      icon: 'Shield',
      action: () => console.log('Transaction limits')
    },
    {
      id: 'autopay',
      title: 'Auto Pay Setup',
      description: 'Set up automatic payments',
      icon: 'Repeat',
      action: () => console.log('Auto pay setup')
    },
    {
      id: 'freeze',
      title: 'Freeze Account',
      description: 'Temporarily freeze account activity',
      icon: 'Pause',
      action: () => console.log('Freeze account')
    },
    {
      id: 'interest',
      title: 'Interest Details',
      description: 'View interest rates and calculations',
      icon: 'TrendingUp',
      action: () => console.log('Interest details')
    },
    {
      id: 'support',
      title: 'Get Support',
      description: 'Contact customer service',
      icon: 'MessageCircle',
      action: () => navigate('/customer-support-chat')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border banking-shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Zap" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions?.map((action) => (
            <div
              key={action?.id}
              className="p-4 rounded-lg border border-border hover:border-primary/50 banking-transition cursor-pointer group"
              onClick={action?.action}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${action?.color} group-hover:scale-110 banking-transition`}>
                  <Icon name={action?.icon} size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground group-hover:text-primary banking-transition">
                    {action?.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action?.description}
                  </p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary banking-transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Account Services */}
      <div className="bg-card rounded-lg border border-border banking-shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Settings" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Account Services</h3>
        </div>
        <div className="space-y-2">
          {accountServices?.map((service) => (
            <div
              key={service?.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 banking-transition cursor-pointer group"
              onClick={service?.action}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 banking-transition">
                  <Icon name={service?.icon} size={16} className="text-muted-foreground group-hover:text-primary banking-transition" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary banking-transition">
                    {service?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service?.description}
                  </p>
                </div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary banking-transition" />
            </div>
          ))}
        </div>
      </div>
      {/* Account Information */}
      <div className="bg-card rounded-lg border border-border banking-shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Info" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Opened:</span>
                <span className="font-medium text-foreground">{accountData?.openedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Routing Number:</span>
                <span className="font-mono text-foreground">{accountData?.routingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span className="font-medium text-foreground">{accountData?.interestRate}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Fee:</span>
                <span className="font-medium text-foreground">{accountData?.monthlyFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Balance:</span>
                <span className="font-medium text-foreground">{accountData?.minimumBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overdraft Protection:</span>
                <span className={`font-medium ${accountData?.overdraftProtection ? 'text-success' : 'text-error'}`}>
                  {accountData?.overdraftProtection ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              onClick={() => console.log('Download account summary')}
              className="w-full sm:w-auto"
            >
              Download Account Summary
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountActions;
