"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Radio, StopCircle, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Message {
    id: string;
    senderName: string;
    senderRole: string;
    content: string;
    createdAt: string;
}

interface ChatSession {
    id: string;
    title: string;
    isLive: boolean;
    startedAt: string | null;
    messages: Message[];
}

const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: "text-rose-500",
    ADMIN: "text-amber-500",
    MANAGER: "text-violet-500",
    MEMBER: "text-blue-500",
};

const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    MANAGER: "Manager",
    MEMBER: "Member",
};

interface LiveChatBoxProps {
    isAdmin?: boolean;
    currentUserName: string;
}

export function LiveChatBox({ isAdmin = false, currentUserName }: LiveChatBoxProps) {
    const [session, setSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionTitle, setSessionTitle] = useState("Live Community Chat");
    const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const fetchSession = useCallback(async (after?: string) => {
        try {
            const url = after ? `/api/chat?after=${encodeURIComponent(after)}` : "/api/chat";
            const res = await fetch(url);
            const data = await res.json();

            if (data.success && data.data) {
                const chatSession: ChatSession = data.data;
                setSession(chatSession);

                if (!after) {
                    // Full load
                    setMessages(chatSession.messages);
                    if (chatSession.messages.length > 0) {
                        setLastMessageTime(chatSession.messages[chatSession.messages.length - 1].createdAt);
                    }
                } else if (chatSession.messages.length > 0) {
                    // Incremental update — only new messages
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const newMsgs = chatSession.messages.filter(m => !existingIds.has(m.id));
                        return [...prev, ...newMsgs];
                    });
                    setLastMessageTime(chatSession.messages[chatSession.messages.length - 1].createdAt);
                }
            } else {
                setSession(null);
            }
        } catch {
            // Silently fail on poll errors
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    // Polling every 3 seconds when live
    useEffect(() => {
        if (pollRef.current) clearInterval(pollRef.current);

        pollRef.current = setInterval(() => {
            fetchSession(lastMessageTime || undefined);
        }, 3000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchSession, lastMessageTime]);

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const startSession = async () => {
        const res = await fetch("/api/chat/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "start", title: sessionTitle }),
        });
        const data = await res.json();
        if (data.success) {
            toast.success("Chat session started! Members can now join.");
            setMessages([]);
            setLastMessageTime(null);
            fetchSession();
        } else {
            toast.error("Failed to start session.");
        }
    };

    const stopSession = async () => {
        if (!confirm("End this chat session? Members won't be able to chat after this.")) return;
        const res = await fetch("/api/chat/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "stop" }),
        });
        const data = await res.json();
        if (data.success) {
            toast.success("Session ended.");
            fetchSession();
        }
    };

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !session?.id) return;
        setSending(true);
        const content = input.trim();
        setInput("");

        // Optimistic update
        const optimistic: Message = {
            id: `temp-${Date.now()}`,
            senderName: currentUserName,
            senderRole: isAdmin ? "ADMIN" : "MEMBER",
            content,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);
        scrollToBottom();

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, sessionId: session.id }),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.error || "Failed to send.");
                setMessages(prev => prev.filter(m => m.id !== optimistic.id));
                setInput(content);
            } else {
                // Replace optimistic with real
                setMessages(prev => prev.map(m => m.id === optimistic.id ? data.data : m));
                setLastMessageTime(data.data.createdAt);
            }
        } catch {
            toast.error("Network error.");
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
            setInput(content);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex flex-col h-full bg-[#023727] rounded-2xl overflow-hidden border border-brand-neutral-800/60 shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-brand-neutral-800/60 flex items-center justify-between shrink-0 bg-[#0d1526]">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full transition-colors ${session?.isLive ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-pulse" : "bg-brand-neutral-600"}`} />
                    <div>
                        <p className="text-white font-serif font-bold text-base tracking-wide">
                            {session?.title || "Live Chat"}
                        </p>
                        <p className="text-[10px] text-brand-neutral-400 uppercase tracking-widest font-semibold mt-0.5">
                            {session?.isLive ? "Session Active" : "No Active Session"}
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-2">
                        {!session?.isLive ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={sessionTitle}
                                    onChange={e => setSessionTitle(e.target.value)}
                                    placeholder="Session title..."
                                    className="text-xs bg-brand-neutral-800/60 border border-brand-neutral-700/50 rounded-lg px-3 py-1.5 text-brand-neutral-300 placeholder:text-brand-neutral-500 outline-none focus:border-amber-500/50 w-36"
                                />
                                <Button size="sm" onClick={startSession}
                                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5 font-bold">
                                    <Radio className="w-3 h-3" /> Go Live
                                </Button>
                            </div>
                        ) : (
                            <Button size="sm" onClick={stopSession}
                                className="h-8 px-3 text-xs bg-rose-600/80 hover:bg-rose-700 text-white rounded-lg gap-1.5 font-bold border border-rose-500/30">
                                <StopCircle className="w-3 h-3" /> End Session
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    </div>
                ) : !session?.isLive && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-brand-neutral-800/60 flex items-center justify-center">
                            <Users className="w-7 h-7 text-brand-neutral-500" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-brand-neutral-300 font-serif font-bold text-lg">No Live Session</p>
                            <p className="text-brand-neutral-500 text-sm mt-1">
                                {isAdmin ? "Start a session to begin chatting with members." : "An admin hasn't started a chat session yet. Check back soon!"}
                            </p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-brand-neutral-500 text-sm font-medium">No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => {
                            const isSelf = msg.senderName === currentUserName;
                            const isAdminMsg = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(msg.senderRole);
                            const prevMsg = idx > 0 ? messages[idx - 1] : null;
                            const showSender = !prevMsg || prevMsg.senderName !== msg.senderName;

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                                >
                                    {showSender && (
                                        <div className={`flex items-center gap-1.5 mb-1 ${isSelf ? "flex-row-reverse" : ""}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isAdminMsg ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                                                {msg.senderName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`text-[11px] font-bold ${ROLE_COLORS[msg.senderRole] || "text-brand-neutral-400"}`}>
                                                {msg.senderName}
                                            </span>
                                            <span className="text-[9px] text-brand-neutral-600 uppercase tracking-wider font-semibold">
                                                {ROLE_LABELS[msg.senderRole] || msg.senderRole}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex items-end gap-1.5 ${isSelf ? "flex-row-reverse" : ""}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            isSelf
                                                ? "bg-amber-600 text-white rounded-br-md"
                                                : isAdminMsg
                                                    ? "bg-brand-neutral-700/80 text-white border border-amber-500/20 rounded-bl-md"
                                                    : "bg-brand-neutral-800 text-brand-neutral-200 rounded-bl-md"
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[9px] text-brand-neutral-600 shrink-0 mb-1">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-brand-neutral-800/60 bg-[#0d1526] shrink-0">
                {session?.isLive ? (
                    <form onSubmit={sendMessage} className="flex gap-2 items-center">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 bg-brand-neutral-800/70 border border-brand-neutral-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-brand-neutral-500 outline-none focus:border-amber-500/60 focus:bg-brand-neutral-800 transition-colors"
                            maxLength={500}
                            autoComplete="off"
                        />
                        <Button type="submit" disabled={!input.trim() || sending} size="sm"
                            className="h-10 w-10 p-0 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shrink-0 transition-all">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </form>
                ) : (
                    <div className="flex items-center justify-center gap-2 py-1">
                        <Clock className="w-4 h-4 text-brand-neutral-600" />
                        <p className="text-brand-neutral-500 text-xs font-medium">Chat is offline</p>
                    </div>
                )}
            </div>
        </div>
    );
}
