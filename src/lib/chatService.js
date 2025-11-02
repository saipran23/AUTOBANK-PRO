import {
    collection,
        doc,
        addDoc,
        updateDoc,
        getDocs,
        query,
        where,
        orderBy,
        limit,
        onSnapshot,
        serverTimestamp,
        Timestamp,
        writeBatch,
        increment,
        arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase';

const CHAT_COLLECTION = 'supportChats';
const EMPLOYEES_COLLECTION = 'employees';
const QUEUE_COLLECTION = 'chatQueues';

// ============================================================================
// 0. GET ALL CUSTOMER CHATS - NEW FUNCTION (Every employee sees all chats)
// ============================================================================
export const getAllChats = async () => {
    try {
        const snapshot = await getDocs(collection(db, CHAT_COLLECTION));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching all chats:', error);
        throw error;
    }
};

// ============================================================================
// 1. CREATE NEW CHAT - FIXED: No serverTimestamp() in arrays
// ============================================================================
export const createNewChat = async (customerId, customerEmail, customerName) => {
    try {
        const newChat = {
            chatId: '',
            customerId,
            customerEmail,
            customerName,
            status: 'bot-active',
            messages: [
                {
                    id: Date.now(),
                    sender: 'bot',
                    senderName: 'AutoBank Assistant',
                    senderId: 'system-bot',
                    content: 'Hello! I\'m your AutoBank Assistant. I\'ll gather some information to better assist you.',
                    timestamp: new Date().toISOString(), // ✅ STRING TIMESTAMP (NOT serverTimestamp)
                    isBot: true,
                    isHuman: false
                }
            ],
            triageData: {},
            triageCompleted: false,
            triageCompletedAt: null,
            assignedEmployeeId: null,
            assignedEmployeeName: null,
            assignedEmployeeEmail: null,
            assignedAt: null,
            priority: 'medium',
            queuePosition: 0,
            waitStartTime: new Date().toISOString(), // ✅ STRING TIMESTAMP
            createdAt: serverTimestamp(), // ✅ TOP LEVEL OK
            updatedAt: serverTimestamp(), // ✅ TOP LEVEL OK
            closedAt: null
        };

        const docRef = await addDoc(collection(db, CHAT_COLLECTION), newChat);
        return {
            id: docRef.id,
            ...newChat,
            chatId: docRef.id
        };
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
};

// ============================================================================
// 2. GET ACTIVE CHAT FOR CUSTOMER
// ============================================================================
export const getActiveCustomerChat = async (customerId) => {
    try {
        const q = query(
            collection(db, CHAT_COLLECTION),
            where('customerId', '==', customerId),
            where('status', 'in', ['bot-active', 'waiting-assignment', 'assigned']),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const docSnapshot = snapshot.docs[0];
        return {
            id: docSnapshot.id,
            ...docSnapshot.data()
        };
    } catch (error) {
        console.error('Error getting active chat:', error);
        throw error;
    }
};

// ============================================================================
// 3. SEND MESSAGE - FIXED: No serverTimestamp() in arrays
// ============================================================================
export const sendMessage = async (chatId, senderId, senderName, content, isBot = false, isHuman = false) => {
    try {
        const message = {
            id: Date.now(),
            sender: isBot ? 'bot' : (isHuman ? 'employee' : 'customer'),
            senderName,
            senderId,
            content,
            timestamp: new Date().toISOString(), // ✅ STRING TIMESTAMP (NOT serverTimestamp)
            isBot,
            isHuman
        };

        const chatRef = doc(db, CHAT_COLLECTION, chatId);
        await updateDoc(chatRef, {
            messages: arrayUnion(message),
            updatedAt: serverTimestamp() // ✅ TOP LEVEL OK
        });

        return message;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// ============================================================================
// 4. SAVE TRIAGE DATA
// ============================================================================
export const saveTriageData = async (chatId, triageData, isComplete = false) => {
    try {
        const updates = {
            triageData,
            updatedAt: serverTimestamp()
        };

        if (isComplete) {
            updates.triageCompleted = true;
            updates.triageCompletedAt = serverTimestamp();
            updates.status = 'waiting-assignment';
        }

        await updateDoc(doc(db, CHAT_COLLECTION, chatId), updates);
    } catch (error) {
        console.error('Error saving triage data:', error);
        throw error;
    }
};

// ============================================================================
// 5. SET PRIORITY
// ============================================================================
export const setPriority = async (chatId, priority) => {
    try {
        await updateDoc(doc(db, CHAT_COLLECTION, chatId), {
            priority,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error setting priority:', error);
        throw error;
    }
};

// ============================================================================
// 6. ADD TO QUEUE
// ============================================================================
export const addToQueue = async (chatId, customerId, priority = 'medium', department = 'general') => {
    try {
        const queueEntry = {
            chatId,
            customerId,
            priority,
            department,
            position: 0,
            addedAt: serverTimestamp(),
            waitTime: 0,
            estimatedAssignTime: null
        };

        const q = query(
            collection(db, QUEUE_COLLECTION),
            where('department', '==', department),
            where('status', 'in', ['pending', 'waiting'])
        );
        const snapshot = await getDocs(q);
        queueEntry.position = snapshot.size + 1;

        const docRef = await addDoc(collection(db, QUEUE_COLLECTION), queueEntry);
        return {
            id: docRef.id,
            ...queueEntry
        };
    } catch (error) {
        console.error('Error adding to queue:', error);
        throw error;
    }
};

// ============================================================================
// 7. ASSIGN CHAT TO EMPLOYEE - FIXED: No serverTimestamp() in arrays
// ============================================================================
export const assignChatToEmployee = async (chatId, employeeId, employeeName, employeeEmail) => {
    try {
        const batch = writeBatch(db);

        const chatRef = doc(db, CHAT_COLLECTION, chatId);
        batch.update(chatRef, {
            status: 'assigned',
            assignedEmployeeId: employeeId,
            assignedEmployeeName: employeeName,
            assignedEmployeeEmail: employeeEmail,
            assignedAt: serverTimestamp(), // ✅ TOP LEVEL OK
            updatedAt: serverTimestamp() // ✅ TOP LEVEL OK
        });

        // ✅ MESSAGE INSIDE ARRAY - STRING TIMESTAMP
        const assignmentMessage = {
            id: Date.now(),
            sender: 'system',
            senderName: 'System',
            senderId: 'system',
            content: `Chat assigned to ${employeeName}. They will assist you shortly.`,
            timestamp: new Date().toISOString(), // ✅ STRING TIMESTAMP (NOT serverTimestamp)
            isBot: false,
            isHuman: false
        };

        batch.update(chatRef, {
            messages: arrayUnion(assignmentMessage)
        });

        const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
        batch.update(employeeRef, {
            activeChatsCount: increment(1),
            assignedChats: arrayUnion(chatId),
            lastActivityAt: serverTimestamp() // ✅ TOP LEVEL OK
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Error assigning chat:', error);
        throw error;
    }
};

// ============================================================================
// 8. GET AVAILABLE EMPLOYEES
// ============================================================================
export const getAvailableEmployees = async (department = 'general') => {
    try {
        const q = query(
            collection(db, EMPLOYEES_COLLECTION),
            where('status', '==', 'online'),
            where('department', '==', department),
            orderBy('activeChatsCount', 'asc'),
            limit(5)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...docSnapshot.data()
        }));
    } catch (error) {
        console.error('Error getting available employees:', error);
        throw error;
    }
};

// ============================================================================
// 9. AUTO ASSIGN CHAT TO LEAST BUSY EMPLOYEE
// ============================================================================
export const autoAssignChat = async (chatId) => {
    try {
        const chatRef = doc(db, CHAT_COLLECTION, chatId);
        const chatSnapshot = await getDocs(query(collection(db, CHAT_COLLECTION), where('__name__', '==', chatId)));

        if (chatSnapshot.empty) throw new Error('Chat not found');
        const chat = chatSnapshot.docs[0].data();

        const employees = await getAvailableEmployees(chat.department || 'general');

        if (employees.length === 0) {
            console.log('No available employees, keeping in queue');
            return false;
        }

        const employee = employees[0];
        await assignChatToEmployee(chatId, employee.id, employee.name, employee.email);

        return true;
    } catch (error) {
        console.error('Error auto-assigning chat:', error);
        throw error;
    }
};

// ============================================================================
// 10. GET EMPLOYEE'S ASSIGNED CHATS
// ============================================================================
export const getEmployeeAssignedChats = async (employeeId) => {
    try {
        const q = query(
            collection(db, CHAT_COLLECTION),
            where('assignedEmployeeId', '==', employeeId),
            where('status', '==', 'assigned'),
            orderBy('assignedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...docSnapshot.data()
        }));
    } catch (error) {
        console.error('Error getting employee chats:', error);
        throw error;
    }
};

// ============================================================================
// 11. GET CHAT HISTORY FOR CUSTOMER
// ============================================================================
export const getCustomerChatHistory = async (customerId) => {
    try {
        const q = query(
            collection(db, CHAT_COLLECTION),
            where('customerId', '==', customerId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...docSnapshot.data()
        }));
    } catch (error) {
        console.error('Error getting chat history:', error);
        throw error;
    }
};

// ============================================================================
// 12. CLOSE CHAT - FIXED: No serverTimestamp() in arrays
// ============================================================================
export const closeChat = async (chatId) => {
    try {
        const batch = writeBatch(db);

        const chatRef = doc(db, CHAT_COLLECTION, chatId);
        batch.update(chatRef, {
            status: 'closed',
            closedAt: serverTimestamp(), // ✅ TOP LEVEL OK
            updatedAt: serverTimestamp() // ✅ TOP LEVEL OK
        });

        // ✅ MESSAGE INSIDE ARRAY - STRING TIMESTAMP
        const closeMessage = {
            id: Date.now(),
            sender: 'system',
            senderName: 'System',
            senderId: 'system',
            content: 'Chat has been closed.',
            timestamp: new Date().toISOString(), // ✅ STRING TIMESTAMP (NOT serverTimestamp)
            isBot: false,
            isHuman: false
        };

        batch.update(chatRef, {
            messages: arrayUnion(closeMessage)
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Error closing chat:', error);
        throw error;
    }
};

// ============================================================================
// 13. UNASSIGN CHAT FROM EMPLOYEE
// ============================================================================
export const unassignChat = async (chatId, employeeId) => {
    try {
        const batch = writeBatch(db);

        const chatRef = doc(db, CHAT_COLLECTION, chatId);
        batch.update(chatRef, {
            status: 'waiting-assignment',
            assignedEmployeeId: null,
            assignedEmployeeName: null,
            assignedEmployeeEmail: null,
            updatedAt: serverTimestamp()
        });

        const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
        batch.update(employeeRef, {
            activeChatsCount: increment(-1),
            lastActivityAt: serverTimestamp()
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Error unassigning chat:', error);
        throw error;
    }
};

// ============================================================================
// 14. SUBSCRIBE TO CHAT UPDATES (Real-time listener)
// ============================================================================
export const subscribeToChatUpdates = (chatId, callback) => {
    const chatRef = doc(db, CHAT_COLLECTION, chatId);

    const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            callback({
                id: docSnapshot.id,
                ...docSnapshot.data()
            });
        }
    }, (error) => {
        console.error('Error subscribing to chat:', error);
    });

    return unsubscribe;
};

// ============================================================================
// 15. SUBSCRIBE TO QUEUE UPDATES (Employee view)
// ============================================================================
export const subscribeToQueueUpdates = (department, callback) => {
    const q = query(
        collection(db, QUEUE_COLLECTION),
        where('department', '==', department),
        orderBy('priority', 'desc'),
        orderBy('position', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...docSnapshot.data()
        }));
        callback(chats);
    }, (error) => {
        console.error('Error subscribing to queue:', error);
    });

    return unsubscribe;
};

// ============================================================================
// 16. GET QUEUE STATS
// ============================================================================
export const getQueueStats = async () => {
    try {
        const q = query(
            collection(db, QUEUE_COLLECTION),
            where('status', 'in', ['pending', 'waiting'])
        );

        const snapshot = await getDocs(q);
        const chats = snapshot.docs;

        return {
            totalWaiting: chats.length,
            averageWaitTime: calculateAverageWaitTime(chats),
            highPriorityCount: chats.filter(c => c.data().priority === 'high' || c.data().priority === 'critical').length
        };
    } catch (error) {
        console.error('Error getting queue stats:', error);
        throw error;
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateAverageWaitTime = (queueDocs) => {
    if (queueDocs.length === 0) return 0;

    const now = new Date();
    const totalWait = queueDocs.reduce((sum, docSnapshot) => {
        const addedAt = docSnapshot.data().addedAt?.toDate?.() || new Date();
        const wait = Math.floor((now - addedAt) / 60000);
        return sum + wait;
    }, 0);

    return Math.floor(totalWait / queueDocs.length);
};

export const formatChatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getChatDuration = (createdAt, closedAt) => {
    const start = createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
    const end = closedAt instanceof Timestamp ? closedAt.toDate() : new Date(closedAt);
    const minutes = Math.floor((end - start) / 60000);
    return `${minutes} min`;
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
    getAllChats,
    createNewChat,
    getActiveCustomerChat,
    sendMessage,
    saveTriageData,
    setPriority,
    addToQueue,
    assignChatToEmployee,
    getAvailableEmployees,
    autoAssignChat,
    getEmployeeAssignedChats,
    getCustomerChatHistory,
    closeChat,
    unassignChat,
    subscribeToChatUpdates,
    subscribeToQueueUpdates,
    getQueueStats,
    formatChatTimestamp,
    getChatDuration
};