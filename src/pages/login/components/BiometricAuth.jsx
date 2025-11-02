import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BiometricAuth = ({ onSuccess, onSkip }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Check if biometric authentication is supported
    const checkBiometricSupport = () => {
      if (window.PublicKeyCredential && 
          typeof window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable()?.then(available => {
            setIsSupported(available);
          })?.catch(() => {
            setIsSupported(false);
          });
      } else {
        // Simulate biometric support for demo purposes
        setIsSupported(true);
      }
    };

    checkBiometricSupport();
  }, []);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    setAuthError('');

    try {
      // Simulate biometric authentication
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 80% success rate
          if (Math.random() > 0.2) {
            resolve();
          } else {
            reject(new Error('Biometric authentication failed'));
          }
        }, 2000);
      });

      onSuccess();
    } catch (error) {
      setAuthError('Biometric authentication failed. Please try again or use password.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-xl banking-shadow-lg p-8 border border-border">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Fingerprint" size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Biometric Sign In</h2>
          <p className="text-muted-foreground">
            Use your fingerprint or face recognition for quick and secure access
          </p>
        </div>

        {authError && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{authError}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="default"
            fullWidth
            loading={isAuthenticating}
            onClick={handleBiometricAuth}
            iconName="Fingerprint"
            iconPosition="left"
          >
            {isAuthenticating ? 'Authenticating...' : 'Use Biometric Authentication'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={onSkip}
          >
            Use Password Instead
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Shield" size={16} className="text-success" />
            <span>Your biometric data is stored securely on your device</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Lock" size={16} className="text-success" />
            <span>We never store or transmit your biometric information</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricAuth;