
import React, { useMemo, memo } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

// ============================================================================
// CHAT MESSAGE COMPONENT
// ============================================================================
const ChatMessage = memo(({
                              message,           // Message text content
                              isUser = false,    // Is this a user message
                              timestamp,         // Message timestamp
                              agent,             // Agent info { type: 'bot'|'human', name: string }
                              attachment,        // File attachment { type, name, size, url }
                              isTyping = false,  // Show typing indicator
                              isDelivered = true, // Show delivery status
                              senderName,        // Override sender name
                              isBot = false,     // Explicit bot indicator
                              isEmployee = false // Explicit employee indicator
                          }) => {
    // =========================================================================
    // FORMAT TIME
    // =========================================================================
    const formatTime = useMemo(() => {
        try {
            if (!timestamp) return '';

            const date = timestamp instanceof Date
                ? timestamp
                : new Date(timestamp);

            if (isNaN(date.getTime())) return '';

            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    }, [timestamp]);

    // =========================================================================
    // TYPING INDICATOR
    // =========================================================================
    if (isTyping) {
        return (
            <div className="flex items-start space-x-3 mb-4 animate-in fade-in-50 duration-300">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon name="Bot" size={16} color="white" />
                </div>
                <div className="flex-1">
                    <div className="bg-muted rounded-lg px-4 py-3 max-w-xs shadow-sm">
                        <div className="flex space-x-1 items-center">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // DETERMINE MESSAGE TYPE & STYLES
    // =========================================================================
    const isFromEmployee = isEmployee || agent?.type === 'human';
    const isFromBot = isBot || agent?.type === 'bot' || (!isUser && !isFromEmployee);

    const avatarBgColor = isUser
        ? 'bg-accent'
        : isFromEmployee
            ? 'bg-secondary'
            : 'bg-primary';

    const messageBgColor = isUser
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground';

    const displayName = senderName || agent?.name || (isFromBot ? 'AutoBank Assistant' : 'Agent');

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div
            className={`
                flex items-start space-x-3 mb-4 animate-in fade-in-50 duration-300
                ${isUser ? 'flex-row-reverse space-x-reverse' : ''}
            `}
        >
            {/* Avatar */}
            <div
                className={`
                    ${avatarBgColor} w-8 h-8 rounded-full flex items-center justify-center
                    flex-shrink-0 shadow-sm transition-all
                `}
                title={displayName}
            >
                {isUser ? (
                    <Icon name="User" size={16} color="white" />
                ) : isFromEmployee ? (
                    <Icon name="Headphones" size={16} color="white" />
                ) : (
                    <Icon name="Bot" size={16} color="white" />
                )}
            </div>

            {/* Message Container */}
            <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md">
                {/* Sender Info (not for user messages) */}
                {!isUser && (
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                            {displayName}
                        </span>
                        {isFromEmployee && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium inline-flex items-center gap-1">
                                <Icon name="CheckCircle" size={10} />
                                Live Agent
                            </span>
                        )}
                    </div>
                )}

                {/* Message Bubble */}
                <div
                    className={`
                        ${messageBgColor} rounded-lg px-4 py-3 shadow-sm
                        transition-all hover:shadow-md
                    `}
                >
                    {/* Message Text */}
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message || (attachment ? `📎 Sent attachment` : 'No message')}
                    </p>

                    {/* File Attachment */}
                    {attachment && (
                        <AttachmentPreview attachment={attachment} />
                    )}
                </div>

                {/* Message Footer (Time & Status) */}
                <div
                    className={`
                        flex items-center mt-1 space-x-2 text-xs text-muted-foreground
                        ${isUser ? 'flex-row-reverse' : ''}
                    `}
                >
                    <span>{formatTime}</span>

                    {/* Delivery Status (for user messages) */}
                    {isUser && (
                        <div className="flex items-center space-x-0.5">
                            <Icon
                                name="Check"
                                size={12}
                                className={isDelivered ? 'text-green-600' : 'text-muted-foreground'}
                            />
                            <Icon
                                name="Check"
                                size={12}
                                className={isDelivered ? 'text-green-600' : 'text-muted-foreground'}
                                style={{ marginLeft: '-4px' }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

ChatMessage.displayName = 'ChatMessage';

// ============================================================================
// ATTACHMENT PREVIEW COMPONENT
// ============================================================================
const AttachmentPreview = memo(({ attachment }) => {
    if (!attachment) return null;

    const { type, name, size, url } = attachment;
    const isImage = type === 'image';

    return (
        <div className="mt-3 p-3 bg-background/20 rounded-lg border border-border/30 hover:bg-background/30 transition-colors">
            {/* File Info */}
            <div className="flex items-center space-x-2">
                <Icon
                    name={isImage ? 'Image' : 'FileText'}
                    size={16}
                    className="text-primary flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={name}>
                        {name}
                    </p>
                    {size && (
                        <p className="text-xs opacity-70">
                            {size}
                        </p>
                    )}
                </div>
            </div>

            {/* Image Preview */}
            {isImage && url && (
                <div className="mt-2 overflow-hidden rounded-md">
                    <Image
                        src={url}
                        alt={name || 'Uploaded image'}
                        className="max-w-full h-32 object-cover rounded transition-transform hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            console.error('Image failed to load:', name);
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}

            {/* Download Link for Documents */}
            {!isImage && url && (
                <a
                    href={url}
                    download={name}
                    className="mt-2 inline-flex items-center space-x-1 text-xs text-primary hover:underline"
                    title={`Download ${name}`}
                >
                    <Icon name="Download" size={12} />
                    <span>Download</span>
                </a>
            )}
        </div>
    );
});

AttachmentPreview.displayName = 'AttachmentPreview';

export default ChatMessage;