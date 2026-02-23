'use client'
import { useState,useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/src/types/ApiResponse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
interface ChatMessage {
    role: "user" | "bot";
    content: string;
}

const ChatbotPage = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { data: session, status } = useSession();  
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/signIn");
        }
    }, [status]);

     if (status === "loading") return <div>Loading...</div> 
    if (!session) return null 

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chatbot', {
                message: input
            });

            const botMessage: ChatMessage = {
                role: "bot",
                content: response.data.response
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">MedAssist Chatbot</h1>

            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50">
                {messages.length === 0 && (
                    <p className="text-center text-gray-400">Ask me anything about your health!</p>
                )}
                {messages.map((msg, index) => (
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
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border p-3 rounded-lg rounded-bl-none">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !isLoading) sendMessage();
                    }}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
            </div>
        </div>
    )
}

export default ChatbotPage;