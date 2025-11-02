import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
    getAllChats,
    sendMessage,
    subscribeToChatUpdates,
    unassignChat,
} from "../../lib/chatService";
import ChatBox from "./components/ChatBox";
import ChatQueue from "./components/ChatQueue";

const HEADER_HEIGHT = 80;

const EmployeeChatDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, logout } = useAuth();
    const messagesEndRef = useRef(null);

    const [allChats, setAllChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const unsubscribeRef = useRef(null);

    const [messageInput, setMessageInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadChats, setUnreadChats] = useState(0);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, loading, navigate]);

    useEffect(() => {
        if (!user?.uid) return;
        const loadChats = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const chats = await getAllChats();
                setAllChats(chats || []);

                const unread = (chats || []).filter(c => c.status === "waiting-assignment").length;
                setUnreadChats(unread);

                if (chats && chats.length > 0 && !selectedChatId) {
                    setSelectedChatId(chats[0].id);
                    loadChatDetails(chats[0]);
                }
            } catch {
                setError("Failed to load chats.");
                setAllChats([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadChats();
        const interval = setInterval(loadChats, 5000);
        return () => clearInterval(interval);
    }, [user?.uid, selectedChatId]);

    const loadChatDetails = useCallback((chat) => {
        if (!chat || !chat.id) return;
        setSelectedChat(chat);
        setMessages(chat.messages || []);
        if (unsubscribeRef.current) unsubscribeRef.current();
        unsubscribeRef.current = subscribeToChatUpdates(chat.id, (updatedChat) => {
            setSelectedChat(updatedChat);
            setMessages(updatedChat.messages || []);
        });
    }, []);

    const handleSelectChat = useCallback((chat) => {
        setSelectedChatId(chat.id);
        loadChatDetails(chat);
        setMessageInput("");
    }, [loadChatDetails]);

    const handleSendResponse = async () => {
        const trimmedMessage = messageInput.trim();
        if (!trimmedMessage || !selectedChatId || !user) {
            setError("Please enter a message before sending.");
            return;
        }
        try {
            setError(null);
            setIsTyping(true);
            await sendMessage(
                selectedChatId,
                user.uid,
                user.displayName || user.email?.split("@")[0] || "Employee",
                trimmedMessage,
                false,
                true
            );
            setMessageInput("");
        } catch {
            setError("Failed to send response. Please try again.");
        } finally {
            setIsTyping(false);
        }
    };

    const handleCloseChat = async () => {
        if (!window.confirm("Close this chat and remove from your queue?")) return;
        if (!selectedChatId || !user?.uid) {
            setError("Invalid chat session.");
            return;
        }
        try {
            setError(null);
            setIsTyping(true);
            await unassignChat(selectedChatId, user.uid);
            setSelectedChatId(null);
            setSelectedChat(null);
            setMessages([]);
            setMessageInput("");
            const chats = await getAllChats();
            setAllChats(chats || []);
        } catch {
            setError("Failed to close chat. Please try again.");
        } finally {
            setIsTyping(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/employee/login", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
            alert("Error logging out. Please try again.");
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Icon name="Loader" size={32} className="animate-spin mx-auto mb-4" />
                    <p className="text-foreground font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
            {/* === HEADER === */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white shadow px-6 py-4 flex items-center gap-4 rounded-b-xl h-20">
                <div className="flex items-center gap-3 pr-8">
                    <span className="text-3xl font-extrabold text-blue-800">AutoBank-Pro</span>
                    <span className="text-gray-500 text-lg">Admin Portal</span>
                </div>

                <nav className="flex space-x-2 text-sm font-semibold text-gray-600">
                    <button className="py-2 px-3 hover:text-gray-800 transition" onClick={() => navigate("/employee/dashboard")}>Users</button>
                    <button className="py-2 px-3 hover:text-gray-800 transition" onClick={() => navigate("/employee/dashboard")}>Accounts</button>
                    <button className="py-2 px-3 hover:text-gray-800 transition" onClick={() => navigate("/employee/dashboard")}>Transactions</button>
                    <button className="py-2 px-3 hover:text-gray-800 transition" onClick={() => navigate("/employee/dashboard")}>Loan Review</button>
                    <button className="py-2 px-3 hover:text-gray-800 transition" onClick={() => navigate("/employee/dashboard")}>Audit Logs</button>
                </nav>

                <button
                    className="ml-auto mr-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow transition flex items-center gap-2 relative font-semibold"
                    title="Chat Support Portal"
                >
                    💬 Chat Support
                    {unreadChats > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {unreadChats}
                        </span>
                    )}
                </button>

                <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition font-semibold"
                    onClick={handleLogout}
                    title="Sign out"
                >
                    Logout
                </button>

                <div className="flex items-center gap-2 ml-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </div>
                    <span className="text-gray-700 text-sm hidden sm:block">
                        {user?.displayName || user?.email}
                    </span>
                </div>
            </header>

            {/* Main Content - FULL SCREEN */}
            <main className="flex flex-row w-full h-[calc(100vh-80px)] mt-20 overflow-hidden">
                {/* ====== LEFT SIDEBAR - Chat Queue with bottom padding ====== */}
                <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden pb-4">
                    <ChatQueue
                        chats={allChats}
                        activeChat={selectedChat}
                        onSelectChat={handleSelectChat}
                    />
                </div>

                {/* ====== RIGHT MAIN PANEL - Chat Conversation with bottom padding ====== */}
                <div className="flex-1 flex flex-col h-full overflow-hidden pb-4">
                    {selectedChat ? (
                        <div className="flex flex-col h-full overflow-hidden bg-card">
                            {/* Chat Header */}
                            <div className="border-b p-4 flex items-center justify-between bg-muted/50 flex-shrink-0">
                                <div>
                                    <h3 className="font-semibold">{selectedChat.customerName}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedChat.customerEmail}</p>
                                    {selectedChat.priority && (
                                        <Badge
                                            variant={
                                                selectedChat.priority === "critical"
                                                    ? "destructive"
                                                    : selectedChat.priority === "high"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                            size="sm"
                                            className="mt-1"
                                        >
                                            {selectedChat.priority.charAt(0).toUpperCase() +
                                                selectedChat.priority.slice(1)}
                                        </Badge>
                                    )}
                                    <span className="ml-2 text-xs italic text-muted-foreground">
                                        Customer Chat
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCloseChat}
                                    disabled={isTyping}
                                    title="Close this chat"
                                    className="hover:bg-destructive/10"
                                >
                                    <Icon name="X" size={16} className="text-muted-foreground hover:text-destructive" />
                                </Button>
                            </div>

                            {/* Triage Info */}
                            {selectedChat.triageData &&
                                Object.keys(selectedChat.triageData).length > 0 && (
                                    <div className="border-b p-4 bg-blue-50/50 text-sm flex-shrink-0 max-h-40 overflow-y-auto">
                                        <p className="font-semibold text-blue-900 mb-2">📋 Customer Information:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(selectedChat.triageData).map(
                                                ([key, value]) => (
                                                    <div key={key} className="text-xs">
                                                        <span className="font-medium text-blue-800">{key}:</span>
                                                        <p className="text-blue-700">{value}</p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Messages - NO BOTTOM MARGIN, fill space */}
                            <div className="flex-1 overflow-y-auto px-4 py-6 bg-muted/10">
                                <ChatBox messages={messages} messagesEndRef={messagesEndRef} />
                            </div>

                            {/* Response Input Docked at Bottom */}
                            <div className="border-t p-4 bg-muted/50 flex-shrink-0">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendResponse();
                                            }
                                        }}
                                        placeholder="Type your response... (Press Enter to send)"
                                        disabled={isTyping}
                                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground"
                                    />
                                    <Button
                                        onClick={handleSendResponse}
                                        disabled={!messageInput.trim() || isTyping}
                                        title="Send response (or press Enter)"
                                    >
                                        {isTyping ? (
                                            <Icon name="Loader" size={16} className="animate-spin" />
                                        ) : (
                                            <Icon name="Send" size={16} />
                                        )}
                                    </Button>
                                </div>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card p-12 text-center flex flex-col items-center justify-center h-full">
                            <Icon name="MessageCircle" size={64} className="mb-4 opacity-20 text-muted-foreground" />
                            <p className="text-lg font-medium text-muted-foreground mb-2">
                                {isLoading ? "Loading chats..." : "Select a chat to view messages"}
                            </p>
                            <p className="text-sm text-muted-foreground/60">
                                {allChats.length === 0
                                    ? "You have no chats at the moment"
                                    : "Choose a chat from the left panel"}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EmployeeChatDashboard;
