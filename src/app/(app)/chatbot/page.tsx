'use client'
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import { ApiResponse } from '@/src/types/ApiResponse';

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Session {
    sessionId: string;
    title: string;
    createdAt: string;
}

const ChatbotPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [sessionList, setSessionList] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // auth protection
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/signIn");
        }
    }, [status]);

    // fetch session list on page load
    useEffect(() => {
        if (status === "authenticated") {
            fetchSessionList();
        }
    }, [status]);

    // auto scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (status === "loading") return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin" />
        </div>
    )
    if (!session) return null;

    // fetch all sessions from MongoDB
    const fetchSessionList = async () => {
        setIsLoadingList(true);
        try {
            const response = await axios.get('/api/session/list');
            if (response.data.success) {
                setSessionList(response.data.sessions);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Failed to fetch chats.");
        } finally {
            setIsLoadingList(false);
        }
    }

    // create new session
    const handleNewChat = async () => {
        setIsCreatingSession(true);
        try {
            const response = await axios.post('/api/session/new');
            if (response.data.success) {
                toast.success(response.data.message);
                // add new session to list
                await fetchSessionList();
                // set new session as active
                setActiveSessionId(response.data.sessionId);
                setMessages([]);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Failed to create new chat.");
        } finally {
            setIsCreatingSession(false);
        }
    }

    // handle session click → fetch history
    const handleSessionClick = async (sessionId: string) => {
        if (sessionId === activeSessionId) return; // already active

        setActiveSessionId(sessionId);
        setMessages([]);
        setIsLoadingHistory(true);

        try {
            const response = await axios.get(`/api/session/history?sessionId=${sessionId}`);
            if (response.data.success) {
                setMessages(response.data.history);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Failed to fetch chat history.");
        } finally {
            setIsLoadingHistory(false);
        }
    }

    // delete session
    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent triggering handleSessionClick

        try {
            const response = await axios.delete(`/api/session/delete?sessionId=${sessionId}`);
            if (response.data.success) {
                toast.success(response.data.message);
                // if deleted session was active, clear messages
                if (sessionId === activeSessionId) {
                    setActiveSessionId(null);
                    setMessages([]);
                }
                // remove from list
                setSessionList(prev => prev.filter(s => s.sessionId !== sessionId));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Failed to delete chat.");
        }
    }

    // send message
    const sendMessage = async () => {
        if (!input.trim()) return;
        if (!activeSessionId) {
            toast.error("Please select or create a chat first.");
            return;
        }

        const userMessage: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoadingMessage(true);

        try {
            const response = await axios.post('/api/chat', {
                sessionId: activeSessionId,
                message: input
            });

            if (response.data.success) {
                const botMessage: Message = {
                    role: "assistant",
                    content: response.data.response
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Failed to send message.");
        } finally {
            setIsLoadingMessage(false);
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">

            {/* LEFT PANEL — Session List */}
            <div className="w-64 bg-white border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-bold mb-3">My Chats</h2>
                    <Button
                        onClick={handleNewChat}
                        disabled={isCreatingSession}
                        className="w-full"
                    >
                        {isCreatingSession
                            ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            : <PlusCircle className="h-4 w-4 mr-2" />
                        }
                        New Chat
                    </Button>
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoadingList ? (
                        <div className="flex justify-center mt-4">
                            <Loader2 className="animate-spin text-gray-400" />
                        </div>
                    ) : sessionList.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm mt-4">
                            No chats yet. Create one!
                        </p>
                    ) : (
                        sessionList.map((s) => (
                            <div
                                key={s.sessionId}
                                onClick={() => handleSessionClick(s.sessionId)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group hover:bg-gray-100 ${
                                    activeSessionId === s.sessionId
                                        ? "bg-gray-200 font-medium"
                                        : ""
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{s.title}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(s.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(s.sessionId, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT PANEL — Chat UI */}
            <div className="flex-1 flex flex-col">

                {/* Chat header */}
                <div className="bg-white border-b p-4">
                    <h1 className="text-xl font-bold">MedAssist Chatbot</h1>
                    <p className="text-sm text-gray-500">
                        {activeSessionId
                            ? sessionList.find(s => s.sessionId === activeSessionId)?.title
                            : "Select a chat or create a new one"
                        }
                    </p>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!activeSessionId ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-gray-400">
                                Select a chat from the left or create a new one
                            </p>
                        </div>
                    ) : isLoadingHistory ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-gray-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-gray-400">
                                No messages yet. Say hello!
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[75%] p-3 rounded-lg text-sm ${
                                    msg.role === "user"
                                        ? "bg-black text-white rounded-br-none"
                                        : "bg-white border text-gray-800 rounded-bl-none"
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}

                    {/* loading indicator when bot is responding */}
                    {isLoadingMessage && (
                        <div className="flex justify-start">
                            <div className="bg-white border p-3 rounded-lg rounded-bl-none">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                        </div>
                    )}

                    {/* auto scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="bg-white border-t p-4 flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !isLoadingMessage) sendMessage();
                        }}
                        placeholder={activeSessionId ? "Type your message..." : "Select a chat first..."}
                        disabled={isLoadingMessage || !activeSessionId}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={isLoadingMessage || !input.trim() || !activeSessionId}
                    >
                        {isLoadingMessage
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : "Send"
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ChatbotPage;