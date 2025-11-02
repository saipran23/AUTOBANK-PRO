import React from 'react';
import Icon from '../../../components/AppIcon';

const ChatBox = ({ messages = [], messagesEndRef }) => {
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper function to get sender display
    const getSenderType = (msg) => {
        if (msg.isBot) return "Bot";
        if (msg.isEmployee || msg.sender === 'employee' || msg.isHuman) return "Employee";
        if (msg.isUser || msg.sender === "customer" || msg.sender === "user") return "You";
        return msg.senderName || "User";
    };

    return (
        <div className="space-y-3 scrollbar-thin pb-8">
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                        <Icon name="MessageCircle" size={32} className="mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-sm">No messages yet</p>
                    </div>
                </div>
            ) : (
                messages.map((msg) => {
                    const isIncoming = msg.isUser || msg.sender === "customer" || msg.sender === "user";
                    const isBot = msg.isBot || msg.sender === "bot";
                    const isEmployee = msg.isHuman || msg.isEmployee || msg.sender === "employee";
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-xs px-3 py-2 rounded-lg shadow-sm break-words ${
                                isBot
                                    ? 'bg-muted text-foreground border border-primary'
                                    : isIncoming
                                        ? 'bg-muted text-foreground'
                                        : 'bg-primary text-primary-foreground'
                            }`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <Icon
                                        name={isBot
                                            ? "Bot"
                                            : isEmployee
                                                ? "UserCheck"
                                                : "User"}
                                        size={14}
                                        className={
                                            isBot
                                                ? "text-primary"
                                                : isEmployee
                                                    ? "text-blue-700"
                                                    : "text-muted-foreground"
                                        }
                                    />
                                    <span className="text-xs font-medium opacity-70">
                                        {getSenderType(msg)}
                                    </span>
                                </div>
                                <div>
                                    {msg.message || msg.content}
                                    {msg.attachmentUrl && (
                                        <a
                                            href={msg.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block mt-2 text-blue-600 underline text-xs"
                                        >{msg.attachmentName || "View Attachment"}</a>
                                    )}
                                </div>
                                <p className="text-xs mt-1 opacity-80 text-right">
                                    {formatTime(msg.timestamp)}
                                </p>
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatBox;
