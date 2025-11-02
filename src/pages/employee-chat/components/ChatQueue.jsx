import React from 'react';
import Icon from '../../../components/AppIcon';

const ChatQueue = ({ chats = [], activeChat, onSelectChat }) => {
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        let date;
        if (timestamp instanceof Date) date = timestamp;
        else if (timestamp?.toDate) date = timestamp.toDate();
        else date = new Date(timestamp);

        const now = new Date();
        const diffMinutes = Math.floor((now - date) / 60000);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'waiting-assignment':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'assigned':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'closed':
                return 'bg-gray-100 text-gray-500 border-gray-300';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-300';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'waiting-assignment':
                return 'Waiting';
            case 'assigned':
                return 'Assigned';
            case 'closed':
                return 'Closed';
            default:
                return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
        }
    };

    return (
        <div className="bg-card border rounded-lg overflow-hidden flex flex-col h-full pb-4">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Icon name="Users" size={16} className="text-primary" />
                    Chat Queue <span className="font-normal text-xs text-muted-foreground">({chats.length})</span>
                </h3>
            </div>
            <div className="divide-y flex-1 overflow-y-auto max-h-full pb-4">
                {chats.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                        <Icon name="Inbox" size={28} className="mx-auto mb-2 opacity-20" />
                        No pending chats
                    </div>
                ) : (
                    chats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => onSelectChat(chat)}
                            aria-label={`Select chat with ${chat.customerName || 'Customer'}`}
                            className={`w-full p-3 text-left hover:bg-primary/10 focus:bg-primary/20 transition-colors outline-none ${
                                activeChat?.id === chat.id
                                    ? 'bg-primary/10 border-l-4 border-primary'
                                    : ''
                            }`}
                        >
                            <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-foreground text-sm truncate">
                                    {chat.customerName || 'Customer'}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusStyle(chat.status)}`}>
                                    {getStatusLabel(chat.status)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1 truncate">
                                {chat.customerEmail || "No email"}
                            </p>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground/70">
                                    {chat.messages?.length > 0 ? `${chat.messages.length} messages` : "No messages"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(chat.createdAt)}
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>
            {/* Padding at bottom for nice spacing */}
            <div className="pt-2" />
        </div>
    );
};

export default ChatQueue;
