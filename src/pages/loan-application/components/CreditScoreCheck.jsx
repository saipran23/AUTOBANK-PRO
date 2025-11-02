import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CreditScoreCheck = ({
                              hasConsent,
                              onConsentChange,
                              isChecking,
                              onCreditCheck,
                              creditScore,
                              creditReport,
                          }) => {
    const getCreditScoreColor = (score) => {
        if (score >= 800) return 'text-success';
        if (score >= 740) return 'text-primary';
        if (score >= 670) return 'text-warning';
        return 'text-error';
    };

    const getCreditScoreRange = (score) => {
        if (score >= 800) return 'Excellent';
        if (score >= 740) return 'Very Good';
        if (score >= 670) return 'Good';
        if (score >= 580) return 'Fair';
        return 'Poor';
    };

    const getImpactColor = (impact) => {
        switch (impact) {
            case 'Positive': return 'text-success';
            case 'Negative': return 'text-error';
            default: return 'text-muted-foreground';
        }
    };

    const getImpactIcon = (impact) => {
        switch (impact) {
            case 'Positive': return 'TrendingUp';
            case 'Negative': return 'TrendingDown';
            default: return 'Minus';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-foreground">Credit Score Check</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    We'll perform a soft credit check to determine your loan eligibility and interest rate.
                </p>
            </div>
            {!creditScore ? (
                <div className="space-y-4">
                    {/* Consent Section */}
                    <div className="border border-border rounded-lg p-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Icon name="Shield" size={16} className="text-primary" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-foreground">Credit Check Authorization</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    By clicking "Check My Credit Score", you authorize AutoBank Pro to perform a soft credit inquiry.
                                    This will not affect your credit score and helps us provide you with personalized loan terms.
                                </p>
                                <div className="mt-4 space-y-2">
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hasConsent}
                                            onChange={onConsentChange}
                                            className="mt-1"
                                        />
                                        <span className="text-sm text-foreground">
                      I authorize AutoBank Pro to obtain my credit report and score for loan evaluation purposes.
                    </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Check Button */}
                    <div className="text-center">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={onCreditCheck}
                            disabled={!hasConsent || isChecking}
                            loading={isChecking}
                            iconName="Search"
                            iconPosition="left"
                        >
                            {isChecking ? 'Checking Credit Score...' : 'Check My Credit Score'}
                        </Button>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4">
                            <Icon name="Zap" size={24} className="mx-auto text-primary mb-2" />
                            <h4 className="font-medium text-foreground">Instant Results</h4>
                            <p className="text-sm text-muted-foreground">Get your credit score in seconds</p>
                        </div>
                        <div className="text-center p-4">
                            <Icon name="Shield" size={24} className="mx-auto text-success mb-2" />
                            <h4 className="font-medium text-foreground">No Impact</h4>
                            <p className="text-sm text-muted-foreground">Soft inquiry won't hurt your score</p>
                        </div>
                        <div className="text-center p-4">
                            <Icon name="Target" size={24} className="mx-auto text-warning mb-2" />
                            <h4 className="font-medium text-foreground">Better Rates</h4>
                            <p className="text-sm text-muted-foreground">Personalized loan terms</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Credit Score Display */}
                    <div className="bg-card border border-border rounded-lg p-6 text-center">
                        <h4 className="text-lg font-semibold text-foreground mb-4">Your Credit Score</h4>
                        <div className={`text-6xl font-bold mb-2 ${getCreditScoreColor(creditScore)}`}>
                            {creditScore}
                        </div>
                        <div className="text-lg font-medium text-muted-foreground mb-4">
                            {getCreditScoreRange(creditScore)}
                        </div>
                        {/* Score Range Indicator */}
                        <div className="relative w-full h-2 bg-muted rounded-full mb-4">
                            <div
                                className="absolute h-2 bg-primary rounded-full"
                                style={{ width: `${(creditScore / 850) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>300</span>
                            <span>850</span>
                        </div>
                    </div>

                    {/* Credit Factors */}
                    {creditReport?.factors?.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h4 className="font-semibold text-foreground mb-4">Factors Affecting Your Score</h4>
                            <div className="space-y-3">
                                {creditReport?.factors?.map((factor, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Icon
                                                name={getImpactIcon(factor?.impact)}
                                                size={16}
                                                className={getImpactColor(factor?.impact)}
                                            />
                                            <div>
                                                <p className="font-medium text-foreground">{factor?.factor}</p>
                                                <p className="text-sm text-muted-foreground">{factor?.description}</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${getImpactColor(factor?.impact)}`}>
                      {factor?.impact}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Credit Accounts Summary */}
                    {creditReport?.accounts?.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h4 className="font-semibold text-foreground mb-4">Credit Accounts Summary</h4>
                            <div className="space-y-3">
                                {creditReport?.accounts?.map((account, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                        <div>
                                            <p className="font-medium text-foreground">{account?.name}</p>
                                            <p className="text-sm text-muted-foreground">{account?.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-foreground">
                                                ${account?.balance?.toLocaleString()}
                                                {account?.limit && ` / $${account?.limit?.toLocaleString()}`}
                                            </p>
                                            <p className="text-sm text-success">{account?.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loan Eligibility */}
                    <div className="bg-success/10 border border-success/20 rounded-lg p-6">
                        <div className="flex items-center space-x-3">
                            <Icon name="CheckCircle" size={24} className="text-success" />
                            <div>
                                <h4 className="font-semibold text-success">Great News!</h4>
                                <p className="text-sm text-success/80">
                                    Based on your credit score, you're pre-qualified for competitive loan rates.
                                    Continue with your application to see personalized offers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditScoreCheck;
