import React, { useState, useCallback, useMemo, memo } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

// ============================================================================
// SUGGESTED RESPONSES COMPONENT
// ============================================================================

const SuggestedResponses = memo(({
                                     suggestions = [],                 // Array of suggestion strings
                                     onSelectSuggestion,              // Callback when suggestion selected
                                     disabled = false,                 // Disable all suggestions
                                     onRemove,                        // Callback to remove component
                                     maxSuggestions = 4,              // Max suggestions to show before expand
                                     showAllButton = false,           // Show "See all"/"Show less" button
                                     analyticsCallback,               // Track suggestion clicks
                                     showIcons = false,               // Show icons with suggestions
                                     variant = 'pills'                // 'pills' or 'cards'
                                 }) => {
    // =========================================================================
    // STATE
    // =========================================================================
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState(null);

    // =========================================================================
    // MEMOIZED SUGGESTIONS
    // =========================================================================
    const displaySuggestions = useMemo(() => {
        if (!Array.isArray(suggestions)) return [];

        const validSuggestions = suggestions.filter(s =>
            s && typeof s === 'string' && s.trim().length > 0
        );

        if (!expanded && validSuggestions.length > maxSuggestions) {
            return validSuggestions.slice(0, maxSuggestions);
        }

        return validSuggestions;
    }, [suggestions, expanded, maxSuggestions]);

    const hasMoreSuggestions = Array.isArray(suggestions) &&
        suggestions.length > maxSuggestions;

    // =========================================================================
    // HANDLE SUGGESTION CLICK
    // =========================================================================
    const handleSelectSuggestion = useCallback((suggestion, index) => {
        setError(null);
        setSelectedIndex(index);

        try {
            // Track analytics if callback provided
            if (typeof analyticsCallback === 'function') {
                analyticsCallback({
                    suggestion: suggestion,
                    index: index,
                    totalSuggestions: displaySuggestions.length,
                    timestamp: new Date().toISOString()
                });
            }

            // Call primary callback
            if (typeof onSelectSuggestion === 'function') {
                onSelectSuggestion(suggestion);
            }

            // Clear selection after brief delay
            setTimeout(() => setSelectedIndex(null), 150);
        } catch (err) {
            console.error('Error selecting suggestion:', err);
            setError('Failed to select suggestion. Please try again.');
        }
    }, [displaySuggestions.length, onSelectSuggestion, analyticsCallback]);

    // =========================================================================
    // EARLY RETURN IF NO SUGGESTIONS
    // =========================================================================
    if (!displaySuggestions || displaySuggestions.length === 0) {
        return null;
    }

    // =========================================================================
    // RENDER PILL LAYOUT
    // =========================================================================
    const renderPillsLayout = useCallback(() => {
        return (
            <div className="flex flex-wrap gap-2">
                {displaySuggestions.map((suggestion, index) => (
                    <Button
                        key={`${suggestion}-${index}`}
                        variant={selectedIndex === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectSuggestion(suggestion, index)}
                        disabled={disabled}
                        className={`
                            text-xs px-3 py-1 h-auto
                            transition-all duration-150
                            hover:border-primary hover:bg-accent
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                            ${selectedIndex === index ? 'ring-2 ring-primary' : ''}
                            whitespace-nowrap truncate
                        `}
                        title={suggestion}
                        aria-label={`Suggested: ${suggestion}`}
                    >
                        {showIcons && (
                            <Icon name="MessageSquare" size={12} className="mr-1" />
                        )}
                        {suggestion}
                    </Button>
                ))}

                {/* Show all / Collapse button */}
                {hasMoreSuggestions && showAllButton && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs px-3 py-1 h-auto"
                    >
                        {expanded ? (
                            <>
                                <Icon name="ChevronUp" size={12} className="mr-1" />
                                Show less
                            </>
                        ) : (
                            <>
                                <Icon name="ChevronDown" size={12} className="mr-1" />
                                +{suggestions.length - maxSuggestions} more
                            </>
                        )}
                    </Button>
                )}
            </div>
        );
    }, [displaySuggestions, selectedIndex, disabled, expanded, hasMoreSuggestions, showAllButton, showIcons, maxSuggestions, suggestions.length, handleSelectSuggestion]);

    // =========================================================================
    // RENDER CARDS LAYOUT
    // =========================================================================
    const renderCardsLayout = useCallback(() => {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displaySuggestions.map((suggestion, index) => (
                    <Button
                        key={`${suggestion}-${index}`}
                        variant={selectedIndex === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectSuggestion(suggestion, index)}
                        disabled={disabled}
                        className={`
                            text-xs px-3 py-2 h-auto flex items-start gap-2
                            transition-all duration-150
                            hover:border-primary hover:bg-accent
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                            ${selectedIndex === index ? 'ring-2 ring-primary' : ''}
                            text-left whitespace-normal
                        `}
                        title={suggestion}
                        aria-label={`Suggested: ${suggestion}`}
                    >
                        {showIcons && (
                            <Icon name="Lightbulb" size={14} className="flex-shrink-0 mt-0.5" />
                        )}
                        <span className="line-clamp-2">{suggestion}</span>
                    </Button>
                ))}

                {/* Show all / Collapse button */}
                {hasMoreSuggestions && showAllButton && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs col-span-full"
                    >
                        {expanded ? (
                            <>
                                <Icon name="ChevronUp" size={12} className="mr-1" />
                                Show less
                            </>
                        ) : (
                            <>
                                <Icon name="ChevronDown" size={12} className="mr-1" />
                                Show all {suggestions.length} suggestions
                            </>
                        )}
                    </Button>
                )}
            </div>
        );
    }, [displaySuggestions, selectedIndex, disabled, expanded, hasMoreSuggestions, showAllButton, showIcons, suggestions.length, handleSelectSuggestion]);

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div className="p-4 border-b border-border bg-muted/20 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                        Suggested responses
                    </h4>
                    {displaySuggestions.length > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {displaySuggestions.length}
                        </span>
                    )}
                </div>

                {onRemove && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="h-6 w-6 p-0"
                        title="Hide suggestions"
                        aria-label="Hide suggested responses"
                    >
                        <Icon name="X" size={14} className="text-muted-foreground" />
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start gap-2">
                    <Icon name="AlertCircle" size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Suggestions */}
            {variant === 'cards' ? renderCardsLayout() : renderPillsLayout()}

            {/* Info */}
            <p className="text-xs text-muted-foreground/70">
                💡 Click any suggestion to quickly respond
            </p>
        </div>
    );
});

SuggestedResponses.displayName = 'SuggestedResponses';

export default SuggestedResponses;
