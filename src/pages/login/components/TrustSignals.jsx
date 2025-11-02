import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustBadges = [
    {
      id: 1,
      name: 'SSL Certificate',
      icon: 'Shield',
      description: '256-bit SSL Encryption',
      verified: true
    },
    {
      id: 2,
      name: 'FDIC Insured',
      icon: 'Building2',
      description: 'Up to $250,000',
      verified: true
    },
    {
      id: 3,
      name: 'SOC 2 Compliant',
      icon: 'CheckCircle',
      description: 'Security Certified',
      verified: true
    },
    {
      id: 4,
      name: 'PCI DSS Level 1',
      icon: 'CreditCard',
      description: 'Payment Security',
      verified: true
    }
  ];

  const securityFeatures = [
    'Multi-factor authentication',
    'Real-time fraud monitoring',
    'Biometric login support',
    'Session timeout protection',
    'Advanced encryption protocols'
  ];

  return (
    <div className="space-y-8">
      {/* Trust Badges */}
      <div className="bg-card rounded-xl banking-shadow-md p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Shield" size={20} className="mr-2 text-success" />
          Security & Trust
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {trustBadges?.map((badge) => (
            <div key={badge?.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon name={badge?.icon} size={16} className="text-success" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{badge?.name}</p>
                <p className="text-xs text-muted-foreground">{badge?.description}</p>
              </div>
              {badge?.verified && (
                <Icon name="CheckCircle" size={16} className="text-success flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Security Features */}
      <div className="bg-card rounded-xl banking-shadow-md p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Lock" size={20} className="mr-2 text-primary" />
          Security Features
        </h3>
        
        <div className="space-y-3">
          {securityFeatures?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Icon name="Check" size={16} className="text-success flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Regulatory Information */}
      <div className="bg-muted/30 rounded-xl p-6 border border-border">
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            AutoBank Pro is a member of FDIC and your deposits are insured up to $250,000
          </p>
          <p className="text-xs text-muted-foreground">
            Licensed by the Office of the Comptroller of the Currency (OCC)
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-1">
              <Icon name="Globe" size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Equal Housing Lender</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Member FDIC</span>
            </div>
          </div>
        </div>
      </div>
      {/* Contact Support */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Need help signing in?</p>
        <div className="flex items-center justify-center space-x-6">
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 banking-transition">
            <Icon name="Phone" size={16} />
            <span>Call Support</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 banking-transition">
            <Icon name="MessageCircle" size={16} />
            <span>Live Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;