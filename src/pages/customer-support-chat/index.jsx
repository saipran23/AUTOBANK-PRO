import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import ChatHeader from "./components/ChatHeader";
import ChatSidebar from "./components/ChatSidebar";
import SuggestedResponses from "./components/SuggestedResponses";

import {
    createNewChat,
    getActiveCustomerChat,
    sendMessage,
    saveTriageData,
    setPriority,
    subscribeToChatUpdates,
    closeChat,
    getCustomerChatHistory
} from "../../lib/chatService";

// ============================================================================
// BOT TRIAGE SEQUENCE
// ============================================================================
const triageSequence = [
    {
        id: "fullname",
        question: "What is your full name?",
        type: "text",
        options: []
    },
    {
        id: "inquiry_type",
        question: "What is the nature of your inquiry today?",
        type: "select",
        options: ["Account Issue", "Card Problem", "Loan Question", "Transaction Dispute", "Technical Support", "General Inquiry"]
    },
    {
        id: "issue_description",
        question: "Can you describe your issue in detail? Please be as specific as possible.",
        type: "text",
        options: []
    },
    {
        id: "issue_timing",
        question: "When did you first notice this issue?",
        type: "select",
        options: ["Today", "Yesterday", "This Week", "This Month", "Longer ago"]
    },
    {
        id: "urgency",
        question: "How urgent is this matter?",
        type: "select",
        options: ["Low - Can wait", "Medium - This week", "High - Today", "Critical - Immediate"]
    },
    {
        id: "attempts",
        question: "Have you attempted any solutions already?",
        type: "text",
        options: []
    },
    {
        id: "contact_preference",
        question: "What is your preferred contact method?",
        type: "select",
        options: ["Chat", "Phone Call", "Email"]
    }
];

// Priority mapping from urgency
const getPriorityFromUrgency = (urgency) => {
    if (urgency?.includes("Critical")) return "critical";
    if (urgency?.includes("High")) return "high";
    if (urgency?.includes("Medium")) return "medium";
    return "low";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const CustomerSupportChat = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useAuth();
    const messagesEndRef = useRef(null);

    // Chat State
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([]);

    // Triage State
    const [triageStep, setTriageStep] = useState(0);
    const [triageData, setTriageData] = useState({});
    const [triageComplete, setTriageComplete] = useState(false);

    // UI State
    const [isTyping, setIsTyping] = useState(false);
    const [suggestedResponses, setSuggestedResponses] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatStatus, setChatStatus] = useState("bot-active");
    const [assignedEmployee, setAssignedEmployee] = useState(null);
    const [waitTime, setWaitTime] = useState(null);
    const [error, setError] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // =========================================================================
    // CLEANUP ON UNMOUNT
    // =========================================================================
    useEffect(() => {
        return () => {
            unsubscribeFunctions.forEach(unsub => {
                try {
                    unsub();
                } catch (e) {
                    console.log('Cleanup:', e);
                }
            });
        };
    }, [unsubscribeFunctions]);

    // =========================================================================
    // INITIALIZATION & AUTH CHECK
    // =========================================================================
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, loading, navigate]);

    // =========================================================================
    // LOAD OR CREATE CHAT ON MOUNT
    // =========================================================================
    useEffect(() => {
        if (!user?.uid || !isAuthenticated) return;

        const initializeChat = async () => {
            try {
                setError(null);
                setIsInitializing(true);

                // Try to get existing active chat
                const existingChat = await getActiveCustomerChat(user.uid);

                if (existingChat && existingChat.id) {
                    // Load existing chat
                    setChatId(existingChat.id);
                    setMessages(existingChat.messages || []);
                    setTriageData(existingChat.triageData || {});
                    setTriageComplete(existingChat.triageCompleted || false);
                    setChatStatus(existingChat.status);

                    if (existingChat.assignedEmployeeId) {
                        setAssignedEmployee({
                            id: existingChat.assignedEmployeeId,
                            name: existingChat.assignedEmployeeName,
                            email: existingChat.assignedEmployeeEmail
                        });
                    }

                    // Subscribe to real-time updates
                    subscribeToChat(existingChat.id);
                    setIsInitializing(false);
                } else {
                    // Create new chat
                    const newChat = await createNewChat(
                        user.uid,
                        user.email,
                        user.displayName || user.email.split("@")[0]
                    );

                    if (!newChat || !newChat.id) {
                        throw new Error('Failed to create chat - no ID returned');
                    }

                    setChatId(newChat.id);
                    setMessages(newChat.messages || []);
                    setChatStatus("bot-active");
                    setTriageStep(0);
                    setTriageData({});
                    setTriageComplete(false);

                    // Subscribe to real-time updates
                    subscribeToChat(newChat.id);
                    setIsInitializing(false);

                    // ✅ ASK FIRST TRIAGE QUESTION
                    setTimeout(() => {
                        askTriageQuestion(newChat.id, 0);
                    }, 2000);
                }

                // Load chat history (non-blocking)
                setTimeout(() => {
                    getCustomerChatHistory(user.uid)
                        .then(setChatHistory)
                        .catch(err => {
                            console.warn("Could not load chat history:", err.message);
                            setChatHistory([]);
                        });
                }, 500);

            } catch (err) {
                console.error("Error initializing chat:", err);
                setError(err.message || "Failed to initialize chat. Please refresh.");
                setIsInitializing(false);
            }
        };

        initializeChat();
    }, [user?.uid, isAuthenticated]);

    // =========================================================================
    // SUBSCRIBE TO REAL-TIME CHAT UPDATES
    // =========================================================================
    const subscribeToChat = (id) => {
        if (!id) return;

        const unsubscribe = subscribeToChatUpdates(id, (updatedChat) => {
            setMessages(updatedChat.messages || []);
            setChatStatus(updatedChat.status);
            setTriageData(updatedChat.triageData || {});
            setTriageComplete(updatedChat.triageCompleted || false);

            if (updatedChat.assignedEmployeeId) {
                setAssignedEmployee({
                    id: updatedChat.assignedEmployeeId,
                    name: updatedChat.assignedEmployeeName,
                    email: updatedChat.assignedEmployeeEmail
                });
            }

            if (updatedChat.status === "assigned" && !assignedEmployee) {
                setWaitTime(null);
            }
        });

        setUnsubscribeFunctions([unsubscribe]);
        return unsubscribe;
    };

    // =========================================================================
    // ASK TRIAGE QUESTION
    // =========================================================================
    const askTriageQuestion = async (currentChatId, step) => {
        if (!currentChatId) {
            console.error("Cannot ask question: chatId is null");
            return;
        }

        if (step >= triageSequence.length) {
            completeTriage(currentChatId);
            return;
        }

        const currentQuestion = triageSequence[step];

        try {
            setError(null);

            // Send bot message
            await sendMessage(
                currentChatId,
                "system-bot",
                "AutoBank Assistant",
                currentQuestion.question,
                true,
                false
            );

            setTriageStep(step);
            setSuggestedResponses(currentQuestion.options);
        } catch (err) {
            console.error("Error asking question:", err);
            setError("Failed to send question");
        }
    };

    // =========================================================================
    // HANDLE CUSTOMER RESPONSE TO BOT
    // =========================================================================
    const handleTriageResponse = async (response) => {
        if (!chatId || !user) {
            setError("No active chat. Please refresh.");
            return;
        }

        if (!response || typeof response !== 'string') {
            setError("Invalid response. Please try again.");
            return;
        }

        try {
            setError(null);
            setIsTyping(true);

            // Send customer message
            await sendMessage(
                chatId,
                user.uid,
                user.displayName || user.email.split("@")[0],
                response.trim(),
                false,
                false
            );

            setSuggestedResponses([]);

            // Save triage data
            const currentQuestion = triageSequence[triageStep];
            if (currentQuestion) {
                const updatedTriageData = {
                    ...triageData,
                    [currentQuestion.id]: response.trim()
                };
                setTriageData(updatedTriageData);
            }

            // Move to next question
            const nextStep = triageStep + 1;
            setTriageStep(nextStep);

            // ✅ ASK NEXT QUESTION AFTER DELAY
            setTimeout(() => {
                setIsTyping(false);
                if (nextStep >= triageSequence.length) {
                    completeTriage(chatId);
                } else {
                    askTriageQuestion(chatId, nextStep);
                }
            }, 1500);

        } catch (err) {
            console.error("Error handling response:", err);
            setError("Failed to save response. Please try again.");
            setIsTyping(false);
        }
    };

    // =========================================================================
    // COMPLETE TRIAGE & MOVE TO QUEUE
    // =========================================================================
    const completeTriage = async (currentChatId) => {
        if (!currentChatId) return;

        try {
            setError(null);
            setIsTyping(true);

            const urgency = triageData.urgency || "";
            const priority = getPriorityFromUrgency(urgency);

            // Save all triage data
            await saveTriageData(currentChatId, triageData, true);
            await setPriority(currentChatId, priority);

            // Send completion message
            await sendMessage(
                currentChatId,
                "system-bot",
                "AutoBank Assistant",
                "Thank you for providing all that information! I'm now connecting you to one of our customer service representatives. Please hold on...",
                true,
                false
            );

            setTriageComplete(true);
            setChatStatus("waiting-assignment");
            setSuggestedResponses([]);
            setWaitTime("2-5 minutes");
            setIsTyping(false);

        } catch (err) {
            console.error("Error completing triage:", err);
            setError("Failed to complete triage");
            setIsTyping(false);
        }
    };

    // =========================================================================
    // HANDLE CUSTOMER MESSAGE (Main handler from ChatInput)
    // =========================================================================
    const handleSendMessage = async (messageText, attachment) => {
        if (!chatId || !user) {
            setError("No active chat session");
            return;
        }

        if (!messageText || typeof messageText !== 'string') {
            setError("Invalid message");
            return;
        }

        try {
            setError(null);

            // If still in triage, handle as triage response
            if (!triageComplete && triageStep < triageSequence.length) {
                await handleTriageResponse(messageText);
            } else {
                // After triage, just send regular message
                await sendMessage(
                    chatId,
                    user.uid,
                    user.displayName || user.email.split("@")[0],
                    messageText.trim(),
                    false,
                    false
                );

                setSuggestedResponses([]);
            }

        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message. Please try again.");
        }
    };

    // =========================================================================
    // LOAD PREVIOUS CHAT
    // =========================================================================
    const handleLoadPreviousChat = (historyChat) => {
        if (!historyChat || !historyChat.id) return;

        setChatId(historyChat.id);
        setMessages(historyChat.messages || []);
        setTriageData(historyChat.triageData || {});
        setTriageComplete(historyChat.triageCompleted || false);
        setChatStatus(historyChat.status);
        setIsSidebarOpen(false);

        // Unsubscribe from old chat
        unsubscribeFunctions.forEach(unsub => unsub());

        // Subscribe to new chat
        subscribeToChat(historyChat.id);
    };

    // =========================================================================
    // START NEW CHAT
    // =========================================================================
    const handleNewChat = async () => {
        if (!user?.uid) return;

        try {
            setError(null);
            setIsInitializing(true);

            const newChat = await createNewChat(
                user.uid,
                user.email,
                user.displayName || user.email.split("@")[0]
            );

            if (!newChat || !newChat.id) {
                throw new Error('Failed to create new chat');
            }

            setChatId(newChat.id);
            setMessages(newChat.messages || []);
            setTriageStep(0);
            setTriageData({});
            setTriageComplete(false);
            setChatStatus("bot-active");
            setAssignedEmployee(null);
            setWaitTime(null);
            setIsSidebarOpen(false);
            setSuggestedResponses([]);

            // Unsubscribe from old chat
            unsubscribeFunctions.forEach(unsub => unsub());

            // Subscribe to new chat
            subscribeToChat(newChat.id);

            setIsInitializing(false);

            // ✅ ASK FIRST QUESTION AGAIN
            setTimeout(() => askTriageQuestion(newChat.id, 0), 2000);

            // Reload history
            setTimeout(() => {
                getCustomerChatHistory(user.uid)
                    .then(setChatHistory)
                    .catch(err => console.warn("History error:", err.message));
            }, 500);

        } catch (err) {
            console.error("Error creating new chat:", err);
            setError("Failed to create new chat");
            setIsInitializing(false);
        }
    };

    // =========================================================================
    // END CHAT
    // =========================================================================
    const handleEndChat = async () => {
        if (!window.confirm("Are you sure you want to end this chat?")) return;

        if (!chatId) return;

        try {
            setError(null);
            await closeChat(chatId);
            setChatStatus("closed");
            alert("Chat closed. Redirecting to dashboard...");
            setTimeout(() => navigate("/customer-dashboard"), 2000);
        } catch (err) {
            console.error("Error ending chat:", err);
            setError("Failed to end chat");
        }
    };

    // =========================================================================
    // AUTO SCROLL TO LATEST MESSAGE
    // =========================================================================
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    // =========================================================================
    // RENDER
    // =========================================================================
    if (loading || isInitializing) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin mb-4">
                        <Icon name="Loader" size={32} />
                    </div>
                    <p>Initializing chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Breadcrumb links={[{ label: "Support", href: "/support" }]} />

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start justify-between">
                            <div className="flex items-start gap-2">
                                <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-1" />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="font-bold text-lg hover:text-red-900"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Customer Support</h1>
                                <p className="text-muted-foreground mt-1">Get instant help with your banking needs</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden"
                            >
                                <Icon name="MessageSquare" size={16} className="mr-2" />
                                Chat History ({chatHistory.length})
                            </Button>
                        </div>
                    </div>

                    {/* Main Flex Layout - Chat and Sidebar Side-by-Side */}
                    <div className="flex flex-row gap-6">
                        {/* Main Chat Area - Flex 1 */}
                        <div className="flex-1">
                            <div className="bg-card rounded-lg border overflow-hidden flex flex-col h-[600px]">

                                {/* Chat Header */}
                                <ChatHeader
                                    status={chatStatus}
                                    assignedEmployee={assignedEmployee}
                                    waitTime={waitTime}
                                    onEndChat={handleEndChat}
                                    onNewChat={handleNewChat}
                                />

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                                    {messages.length > 0 ? (
                                        messages.map((message) => (
                                            <ChatMessage
                                                key={message.id}
                                                message={message.content || message.message}
                                                senderName={message.senderName}
                                                isUser={message.sender === "customer"}
                                                isBot={message.isBot}
                                                isEmployee={message.isHuman}
                                                timestamp={message.timestamp}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            <p>Loading chat...</p>
                                        </div>
                                    )}

                                    {isTyping && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                <Icon name="Bot" size={16} color="white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-muted rounded-lg px-4 py-3 max-w-xs">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Suggested Responses */}
                                {suggestedResponses.length > 0 && !triageComplete && (
                                    <SuggestedResponses
                                        suggestions={suggestedResponses}
                                        onSelectSuggestion={handleTriageResponse}
                                        disabled={isTyping}
                                    />
                                )}

                                {/* Chat Input */}
                                <ChatInput
                                    chatId={chatId}
                                    user={{
                                        id: user?.uid,
                                        name: user?.displayName || user?.email?.split("@")[0],
                                        email: user?.email,
                                        displayName: user?.displayName
                                    }}
                                    onSendMessage={handleSendMessage}
                                    disabled={chatStatus === "closed" || isTyping || !chatId}
                                    placeholder={
                                        !chatId
                                            ? "Initializing chat..."
                                            : triageComplete
                                                ? "Type your message..."
                                                : "Please select an option or type your response"
                                    }
                                />
                            </div>

                            {/* Security Info */}
                            <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-start space-x-3">
                                    <Icon name="Shield" size={20} className="text-primary mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Secure Chat</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            This conversation is encrypted. Never share passwords or PINs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Always Visible (Fixed Width) */}
                        <div className="hidden lg:block w-[328px] min-w-[320px] max-w-[350px]">
                            <ChatSidebar
                                chatHistory={chatHistory}
                                onLoadChat={handleLoadPreviousChat}
                                onNewChat={handleNewChat}
                                user={user}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Sidebar - Mobile Drawer */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-background border-l overflow-y-auto">
                        <ChatSidebar
                            chatHistory={chatHistory}
                            onLoadChat={handleLoadPreviousChat}
                            onNewChat={handleNewChat}
                            user={user}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSupportChat;
