import React, { useState, useCallback, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { db } from '../../../firebase';

const ChatSidebar = ({
                         isOpen = false,
                         onClose,
                         chatHistory = [],
                         onLoadChat,
                         user,
                         isLoading = false,
                         onChatCreated
                     }) => {
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [error, setError] = useState(null);

    const formatDate = useCallback((timestamp) => {
        if (!timestamp) return 'Unknown';
        try {
            const date = timestamp instanceof Date
                ? timestamp
                : timestamp?.toDate?.()
                    ? timestamp.toDate()
                    : new Date(timestamp);
            if (isNaN(date.getTime())) return 'Unknown';
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            if (messageDate.getTime() === today.getTime()) return 'Today';
            if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) return `${diffDays} days ago`;
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } catch {
            return 'Unknown';
        }
    }, []);

    // Allow creating chat for both logged-in users and anonymous guests
    const handleNewChat = useCallback(async () => {
        setError(null);

        // For guests, generate a temp ID/email
        const fakeId = user?.id || `guest_${Math.random().toString(36).slice(2, 10)}`;
        const fakeEmail = user?.email || `guest_${Math.random().toString(36).slice(2, 10)}@guest.com`;
        const fakeName = user?.displayName || user?.name || 'Guest';

        try {
            setIsCreatingChat(true);

            // Check for existing open chat with this ID
            const chatQuery = query(
                collection(db, 'supportChats'),
                where('customerId', '==', fakeId),
                where('status', 'in', ['waiting-assignment', 'open', 'bot-active', 'assigned'])
            );
            const querySnapshot = await getDocs(chatQuery);

            if (!querySnapshot.empty) {
                const existingChatId = querySnapshot.docs[0].id;
                if (typeof onLoadChat === 'function') onLoadChat(existingChatId);
                if (typeof onClose === 'function') onClose();
                setIsCreatingChat(false);
                return;
            }

            // Create a new chat
            const chatDocRef = await addDoc(collection(db, 'supportChats'), {
                customerId: fakeId,
                customerEmail: fakeEmail,
                customerName: fakeName,
                messages: [],
                status: 'bot-active',
                triageData: {},
                triageCompleted: false,
                priority: 'medium',
                queuePosition: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                waitStartTime: serverTimestamp()
            });
            const newChatId = chatDocRef.id;
            if (typeof onLoadChat === 'function') onLoadChat(newChatId);
            if (typeof onChatCreated === 'function') onChatCreated(newChatId);
            if (typeof onClose === 'function') onClose();
        } catch (err) {
            setError(err.message || 'Failed to start new chat. Please try again.');
        } finally {
            setIsCreatingChat(false);
        }
    }, [user, onLoadChat, onClose, onChatCreated]);

    const generateChatTitle = useCallback((chat) => {
        if (chat?.title && chat.title.trim()) return chat.title;
        if (chat?.messages && chat.messages.length > 0) {
            const lastUserMessage = [...chat.messages].reverse().find(
                msg => msg.isUser === true || msg.sender === 'customer'
            );
            if (lastUserMessage?.message || lastUserMessage?.content) {
                const messageText = lastUserMessage.message || lastUserMessage.content;
                return messageText.substring(0, 40) +
                    (messageText.length > 40 ? '...' : '');
            }
        }
        return 'Chat Conversation';
    }, []);

    const getLastMessage = useCallback((chat) => {
        if (chat?.messages && chat.messages.length > 0) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const messageText = lastMsg?.message || lastMsg?.content || 'No messages';
            return messageText.substring(0, 60) +
                (messageText.length > 60 ? '...' : '');
        }
        return 'No messages';
    }, []);

    const getChatStatus = useCallback((chat) => {
        if (chat?.status === 'closed') return 'closed';
        if (chat?.status === 'assigned' || chat?.assignedEmployeeId) return 'ongoing';
        if (chat?.status === 'waiting-assignment') return 'pending';
        if (chat?.status === 'bot-active') return 'active';
        return 'active';
    }, []);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'closed':
                return 'bg-muted/20 text-muted-foreground border-muted/30';
            case 'ongoing':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'active':
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    }, []);

    const getStatusLabel = useCallback((status) => {
        switch (status) {
            case 'closed':
                return 'Closed';
            case 'ongoing':
                return 'Ongoing';
            case 'pending':
                return 'Pending';
            case 'active':
            default:
                return 'Active';
        }
    }, []);

    const handleChatClick = useCallback((chat) => {
        setError(null);
        if (typeof onLoadChat === 'function') onLoadChat(chat?.id);
        if (typeof onClose === 'function') onClose();
    }, [onLoadChat, onClose]);

    const chatList = useMemo(() => {
        if (!Array.isArray(chatHistory)) return [];
        return chatHistory.slice(0, 50);
    }, [chatHistory]);
    const hasChatHistory = chatList.length > 0;

    return (
        <>
            {/* Overlay (Mobile Only) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                    aria-label="Close sidebar"
                    role="presentation"
                />
            )}

            {/* Sidebar */}
            <div className={
                `z-50 flex flex-col
                ${isOpen ? "fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg" : ""}
                ${!isOpen ? "relative lg:w-full lg:z-auto lg:shadow-none" : ""}
                overflow-y-auto`
            }>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
                    <h3 className="font-semibold text-foreground">Chat History</h3>
                    {isOpen && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="lg:hidden h-8 w-8 p-0 hover:bg-muted"
                            aria-label="Close chat history"
                            title="Close sidebar"
                        >
                            <Icon name="X" size={16} />
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Only show backend errors */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                            <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Error</p>
                                <p className="text-xs mt-1">{error}</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="default"
                        onClick={handleNewChat}
                        disabled={isCreatingChat || isLoading}
                        className="w-full transition-all"
                    >
                        {isCreatingChat ? (
                            <>
                                <Icon name="Loader" size={16} className="animate-spin mr-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Icon name="Plus" size={16} className="mr-2" />
                                New Chat
                            </>
                        )}
                    </Button>

                    {/* Chat History Section */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground px-1">
                            {hasChatHistory ? 'Recent Conversations' : 'No chat history'}
                        </h4>

                        {hasChatHistory ? (
                            <div className="space-y-2">
                                {chatList.map((chat) => {
                                    const status = getChatStatus(chat);
                                    const statusLabel = getStatusLabel(status);
                                    const statusColor = getStatusColor(status);
                                    const title = generateChatTitle(chat);
                                    const lastMessage = getLastMessage(chat);
                                    const messageCount = chat?.messages?.length || 0;

                                    return (
                                        <button
                                            key={chat?.id}
                                            onClick={() => handleChatClick(chat)}
                                            className={`
                                                w-full p-3 rounded-lg border transition-all text-left
                                                hover:bg-muted/50 active:bg-muted
                                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                                                group
                                            `}
                                            aria-label={`Load chat: ${title}`}
                                            title={title}
                                        >
                                            <div className="flex items-start justify-between mb-1 gap-2">
                                                <h5 className="text-sm font-medium text-foreground truncate flex-1 group-hover:text-primary transition-colors">
                                                    {title}
                                                </h5>
                                                <span className={`
                                                    px-2 py-0.5 text-xs font-semibold rounded-full
                                                    whitespace-nowrap flex-shrink-0 border
                                                    ${statusColor}
                                                `}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mb-2 group-hover:text-muted-foreground/80 transition-colors">
                                                {lastMessage}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                                                <span>{formatDate(chat?.updatedAt || chat?.createdAt)}</span>
                                                {messageCount > 0 && (
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                                                        {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Icon
                                    name="MessageCircle"
                                    size={32}
                                    className="mx-auto text-muted-foreground/30 mb-2"
                                />
                                <p className="text-sm font-medium text-muted-foreground">No chats yet</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Start a new chat to begin
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Quick Links Footer */}
                <div className="border-t border-border bg-muted/30 p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                        Quick Links
                    </h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        title="Download chat transcript"
                    >
                        <Icon name="Download" size={16} className="mr-2" />
                        <span>Download Transcript</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        title="Rate your chat experience"
                    >
                        <Icon name="Star" size={16} className="mr-2" />
                        <span>Rate Experience</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        title="Frequently asked questions"
                    >
                        <Icon name="HelpCircle" size={16} className="mr-2" />
                        <span>FAQ & Help</span>
                    </Button>
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;
