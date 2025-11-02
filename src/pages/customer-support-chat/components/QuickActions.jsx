
import React, { useState, useCallback, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// ============================================================================
// QUICK ACTIONS COMPONENT
// ============================================================================
const QuickActions = ({
                          onActionSelect,                    // Callback when action selected
                          disabled = false,                  // Disable all actions
                          onActionClick,                     // Additional click handler
                          customActions,                     // Override default actions
                          variant = 'grid',                  // 'grid' or 'list'
                          maxColumns = 3,                    // Max columns for grid
                          showDescriptions = true,           // Show descriptions
                          analyticsCallback                  // Track action clicks
                      }) => {
    // =========================================================================
    // STATE
    // =========================================================================
    const [selectedActionId, setSelectedActionId] = useState(null);
    const [error, setError] = useState(null);

    // =========================================================================
    // DEFAULT ACTIONS
    // =========================================================================
    const defaultActions = [
        {
            id: 'account-balance',
            label: 'Check Balance',
            icon: 'DollarSign',
            description: 'View current account balance',
            action: 'Check Balance',
            category: 'account',
            color: 'text-blue-600'
        },
        {
            id: 'transaction-history',
            label: 'Transaction History',
            icon: 'History',
            description: 'Recent transactions',
            action: 'Transaction History',
            category: 'account',
            color: 'text-purple-600'
        },
        {
            id: 'profile-settings',
            label: 'Profile Settings',
            icon: 'User',
            description: 'Update your profile',
            action: 'Profile Settings',
            category: 'profile',
            color: 'text-green-600'
        },
        {
            id: 'loan-status',
            label: 'Loan Status',
            icon: 'FileText',
            description: 'Check loan application',
            action: 'Loan Status',
            category: 'loans',
            color: 'text-orange-600'
        },
        {
            id: 'transfer-money',
            label: 'Transfer Money',
            icon: 'ArrowRightLeft',
            description: 'Send money quickly',
            action: 'Transfer Money',
            category: 'transfer',
            color: 'text-red-600'
        },
        {
            id: 'technical-support',
            label: 'Technical Support',
            icon: 'Wrench',
            description: 'App or website issues',
            action: 'Technical Support',
            category: 'support',
            color: 'text-gray-600'
        }
    ];

    // =========================================================================
    // USE CUSTOM ACTIONS OR DEFAULT
    // =========================================================================
    const quickActions = useMemo(() => {
        if (Array.isArray(customActions) && customActions.length > 0) {
            return customActions;
        }
        return defaultActions;
    }, [customActions]);

    // =========================================================================
    // HANDLE ACTION CLICK
    // =========================================================================
    const handleActionClick = useCallback((action) => {
        setError(null);
        setSelectedActionId(action.id);

        try {
            // Track analytics if callback provided
            if (typeof analyticsCallback === 'function') {
                analyticsCallback({
                    actionId: action.id,
                    actionLabel: action.label,
                    category: action.category,
                    timestamp: new Date().toISOString()
                });
            }

            // Call primary callback
            if (typeof onActionSelect === 'function') {
                onActionSelect(action.action || action.label, action);
            }

            // Call additional click handler
            if (typeof onActionClick === 'function') {
                onActionClick(action);
            }

            // Clear selection after delay
            setTimeout(() => setSelectedActionId(null), 200);
        } catch (err) {
            console.error('Error in action click:', err);
            setError('Failed to execute action. Please try again.');
        }
    }, [onActionSelect, onActionClick, analyticsCallback]);

    // =========================================================================
    // RENDER GRID LAYOUT
    // =========================================================================
    const renderGridLayout = useCallback(() => {
        return (
            <div className={`grid gap-2 grid-cols-2 md:grid-cols-${maxColumns}`}>
                {quickActions.map((action) => (
                    <Button
                        key={action.id}
                        variant={selectedActionId === action.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleActionClick(action)}
                        disabled={disabled}
                        className={`
                            flex flex-col items-center justify-center space-y-1
                            h-24 py-3 px-2 text-center
                            hover:bg-accent hover:border-primary transition-all
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                            ${selectedActionId === action.id ? 'ring-2 ring-primary' : ''}
                        `}
                        title={`${action.label} - ${action.description}`}
                        aria-label={`${action.label}: ${action.description}`}
                    >
                        <Icon
                            name={action.icon}
                            size={20}
                            className={action.color || 'text-primary'}
                        />
                        <span className="text-xs font-semibold leading-tight">
                            {action.label}
                        </span>
                        {showDescriptions && (
                            <span className="text-xs text-muted-foreground hidden sm:inline line-clamp-1">
                                {action.description}
                            </span>
                        )}
                    </Button>
                ))}
            </div>
        );
    }, [quickActions, selectedActionId, disabled, showDescriptions, maxColumns, handleActionClick]);

    // =========================================================================
    // RENDER LIST LAYOUT
    // =========================================================================
    const renderListLayout = useCallback(() => {
        return (
            <div className="space-y-2">
                {quickActions.map((action) => (
                    <Button
                        key={action.id}
                        variant={selectedActionId === action.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleActionClick(action)}
                        disabled={disabled}
                        className={`
                            w-full flex items-center justify-start space-x-3
                            px-4 py-3 text-left
                            hover:bg-accent hover:border-primary transition-all
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                            ${selectedActionId === action.id ? 'ring-2 ring-primary' : ''}
                        `}
                        title={`${action.label} - ${action.description}`}
                        aria-label={`${action.label}: ${action.description}`}
                    >
                        <Icon
                            name={action.icon}
                            size={18}
                            className={action.color || 'text-primary flex-shrink-0'}
                        />
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold">{action.label}</p>
                            {showDescriptions && (
                                <p className="text-xs text-muted-foreground">
                                    {action.description}
                                </p>
                            )}
                        </div>
                        <Icon
                            name="ChevronRight"
                            size={16}
                            className="text-muted-foreground flex-shrink-0"
                        />
                    </Button>
                ))}
            </div>
        );
    }, [quickActions, selectedActionId, disabled, showDescriptions, handleActionClick]);

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div className="p-4 border-b border-border bg-muted/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                    Quick Actions
                </h3>
                {quickActions.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                        {quickActions.length} {quickActions.length === 1 ? 'action' : 'actions'}
                    </span>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start gap-2">
                    <Icon name="AlertCircle" size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Actions */}
            {quickActions.length > 0 ? (
                variant === 'list' ? renderListLayout() : renderGridLayout()
            ) : (
                <div className="p-6 text-center">
                    <Icon
                        name="Zap"
                        size={24}
                        className="mx-auto text-muted-foreground/30 mb-2"
                    />
                    <p className="text-sm text-muted-foreground">
                        No quick actions available
                    </p>
                </div>
            )}

            {/* Footer Info */}
            {quickActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground/70">
                        💡 Tip: Click any action to get immediate assistance
                    </p>
                </div>
            )}
        </div>
    );
};

export default QuickActions;