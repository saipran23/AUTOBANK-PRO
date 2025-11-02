import React, { useState, useRef, useCallback, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { sendMessage } from '../../../lib/chatService';

// ============================================================================
// CHAT INPUT COMPONENT
// ============================================================================
const ChatInput = ({
                       chatId,           // Firestore chat document ID
                       user,             // User object with id, name, email, displayName
                       onSendMessage,    // Callback when message is sent
                       disabled = false, // Disable input (e.g., during sending)
                       placeholder = "Type your message..." // Custom placeholder
                   }) => {
    // =========================================================================
    // STATE
    // =========================================================================
    const [message, setMessage] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [charCount, setCharCount] = useState(0);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    // =========================================================================
    // CONSTANTS
    // =========================================================================
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_MESSAGE_LENGTH = 5000; // 5000 characters
    const ALLOWED_FILE_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    // =========================================================================
    // AUTO-RESIZE TEXTAREA
    // =========================================================================
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [message]);

    // =========================================================================
    // VALIDATION FUNCTIONS
    // =========================================================================
    const validateUser = useCallback(() => {
        if (!user) {
            setError('User not authenticated. Please log in again.');
            return false;
        }

        if (!user.id || !user.email) {
            setError('User information incomplete. Please log in again.');
            return false;
        }

        return true;
    }, [user]);

    const validateChat = useCallback(() => {
        if (!chatId) {
            setError('No chat session found. Please start a new chat.');
            return false;
        }
        return true;
    }, [chatId]);

    const validateMessage = useCallback(() => {
        const trimmedMessage = message?.trim();

        if (!trimmedMessage && !attachedFile) {
            setError('Please enter a message or attach a file.');
            return false;
        }

        if (trimmedMessage && trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            setError(`Message exceeds ${MAX_MESSAGE_LENGTH} character limit.`);
            return false;
        }

        return true;
    }, [message, attachedFile]);

    const validateFile = useCallback((file) => {
        if (!file) return true;

        if (file.size > MAX_FILE_SIZE) {
            setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
            return false;
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setError('File type not allowed. Please upload an image, PDF, document, or spreadsheet.');
            return false;
        }

        return true;
    }, []);

    // =========================================================================
    // FILE HANDLING
    // =========================================================================
    const handleFileSelect = useCallback((e) => {
        setError(null);
        const file = e?.target?.files?.[0];

        if (!file) return;

        if (!validateFile(file)) {
            if (fileInputRef?.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        try {
            const fileData = {
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                type: file.type.startsWith('image/') ? 'image' : 'document',
                url: URL.createObjectURL(file),
                mimeType: file.type,
                lastModified: file.lastModified,
                file: file // Store actual file for potential upload
            };

            setAttachedFile(fileData);
        } catch (err) {
            console.error('Error processing file:', err);
            setError('Failed to process file');
        }
    }, [validateFile]);

    const removeAttachment = useCallback(() => {
        if (attachedFile?.url) {
            try {
                URL.revokeObjectURL(attachedFile.url);
            } catch (e) {
                console.log('URL cleanup:', e);
            }
        }
        setAttachedFile(null);
        if (fileInputRef?.current) {
            fileInputRef.current.value = '';
        }
        setError(null);
    }, [attachedFile]);

    // =========================================================================
    // MESSAGE SUBMISSION
    // =========================================================================
    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        setError(null);

        // Validation
        if (!validateChat()) return;
        if (!validateUser()) return;
        if (!validateMessage()) return;

        try {
            setIsLoading(true);

            const messageContent = (message?.trim() || '').substring(0, MAX_MESSAGE_LENGTH);

            // Use the parent's onSendMessage callback if provided
            if (typeof onSendMessage === 'function') {
                await onSendMessage(messageContent, attachedFile);
            } else {
                // Fallback: send directly to Firestore using chatService
                await sendMessage(
                    chatId,
                    user.id,
                    user.displayName || user.name || user.email.split('@')[0],
                    messageContent || (attachedFile ? `Sent attachment: ${attachedFile.name}` : ''),
                    false,  // isBot
                    false   // isHuman
                );
            }

            // Clear form
            setMessage('');
            setCharCount(0);
            removeAttachment();
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.message || 'Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [chatId, user, message, attachedFile, onSendMessage, validateChat, validateUser, validateMessage, removeAttachment]);

    // =========================================================================
    // KEYBOARD HANDLING
    // =========================================================================
    const handleKeyPress = useCallback((e) => {
        if (e?.key === 'Enter' && !e?.shiftKey && !isLoading) {
            e?.preventDefault();
            handleSubmit(e);
        }
    }, [isLoading, handleSubmit]);

    // =========================================================================
    // MESSAGE CHANGE HANDLER
    // =========================================================================
    const handleMessageChange = useCallback((e) => {
        const newMessage = e?.target?.value || '';

        // Limit to MAX_MESSAGE_LENGTH
        if (newMessage.length <= MAX_MESSAGE_LENGTH) {
            setMessage(newMessage);
            setCharCount(newMessage.length);
            setError(null);
        }
    }, []);

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div className="border-t border-border bg-card">
            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <Icon name="AlertCircle" size={16} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-700 hover:text-red-900 font-bold text-lg flex-shrink-0"
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="p-4 space-y-3">
                {/* Attached File Preview */}
                {attachedFile && (
                    <div className="p-3 bg-muted rounded-lg flex items-center justify-between group hover:bg-muted/80 transition-colors">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Icon
                                name={attachedFile.type === 'image' ? 'Image' : 'FileText'}
                                size={16}
                                className="text-primary flex-shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-foreground truncate" title={attachedFile.name}>
                                    {attachedFile.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {attachedFile.size}
                                </span>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeAttachment}
                            disabled={isLoading}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 flex-shrink-0 ml-2"
                            title="Remove attachment"
                            aria-label="Remove attachment"
                        >
                            <Icon name="X" size={14} className="text-destructive" />
                        </Button>
                    </div>
                )}

                {/* Message Input Form */}
                <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                    {/* Text Area */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleMessageChange}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholder}
                            disabled={disabled || isLoading}
                            className={`
                                w-full px-3 py-2 border border-border rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                bg-background text-foreground placeholder-muted-foreground
                                transition-all resize-none
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            rows={1}
                            style={{
                                minHeight: '40px',
                                maxHeight: '120px',
                                overflow: 'hidden'
                            }}
                            aria-label="Message input"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                        {/* File Attachment Button */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                            className="hidden"
                            aria-label="Attach file"
                            disabled={isLoading}
                        />

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef?.current?.click()}
                            disabled={disabled || isLoading || !!attachedFile}
                            className="h-10 w-10 p-0 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Attach file (Max 10MB)"
                            aria-label="Attach file"
                        >
                            <Icon
                                name="Paperclip"
                                size={18}
                                className={attachedFile ? 'text-primary' : 'text-muted-foreground'}
                            />
                        </Button>

                        {/* Send Button */}
                        <Button
                            type="submit"
                            variant="default"
                            size="sm"
                            disabled={
                                disabled ||
                                isLoading ||
                                (!message?.trim() && !attachedFile)
                            }
                            className="h-10 w-10 p-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send message (Enter)"
                            aria-label="Send message"
                        >
                            {isLoading ? (
                                <Icon name="Loader" size={18} className="animate-spin" />
                            ) : (
                                <Icon name="Send" size={18} />
                            )}
                        </Button>
                    </div>
                </form>

                {/* Helper Text & Character Count */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <div className="flex items-center gap-2">
                        {charCount > 0 && (
                            <span className={charCount > MAX_MESSAGE_LENGTH * 0.9 ? 'text-orange-600 font-medium' : ''}>
                                {charCount}/{MAX_MESSAGE_LENGTH}
                            </span>
                        )}
                        <span>Max file: 10MB</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
