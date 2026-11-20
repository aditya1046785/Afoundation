"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Radio, StopCircle, Users, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Message {
    id: string;
    sessionId?: string;
    senderName: string;
    senderRole: string;
    content: string;
    createdAt: string;
    clientId?: string | null;
    status?: "pending" | "sent" | "failed";
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

const generateClientId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `client-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export function LiveChatBox({ isAdmin = false, currentUserName }: LiveChatBoxProps) {
    const [session, setSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionTitle, setSessionTitle] = useState("Live Community Chat");

    // Refs for message cache, pagination cursor, and lifecycle management
    const messagesMapRef = useRef<Map<string, Message>>(new Map());
    const cursorRef = useRef<{ after: string; afterId: string } | null>(null);
    const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inFlightRef = useRef<boolean>(false);
    const pollAbortControllerRef = useRef<AbortController | null>(null);
    const sendingRef = useRef<boolean>(false);
    const backoffDelayRef = useRef<number>(3000); // 3s -> 6s -> 12s -> 24s -> max 30s
    const isMountedRef = useRef<boolean>(true);
    const sessionIdRef = useRef<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Sort messages by createdAt asc, with id as tie-breaker
    const sortMessages = useCallback((msgs: Message[]): Message[] => {
        return [...msgs].sort((a, b) => {
            const tA = new Date(a.createdAt).getTime();
            const tB = new Date(b.createdAt).getTime();
            if (tA !== tB) return tA - tB;
            return a.id.localeCompare(b.id);
        });
    }, []);

    // Sync persistent map into React state
    const syncMessagesToState = useCallback(() => {
        const sorted = sortMessages(Array.from(messagesMapRef.current.values()));
        setMessages(sorted);
    }, [sortMessages]);

    const clearScheduledPoll = useCallback(() => {
        if (pollTimeoutRef.current) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
        }
    }, []);

    const abortInFlightPoll = useCallback(() => {
        if (pollAbortControllerRef.current) {
            pollAbortControllerRef.current.abort();
            pollAbortControllerRef.current = null;
        }
        inFlightRef.current = false;
    }, []);

    // Forward declaration of executePoll
    const executePollRef = useRef<() => Promise<void>>(async () => {});

    // Schedule next poll with recursive setTimeout
    const scheduleNextPoll = useCallback((delayMs: number) => {
        clearScheduledPoll();

        if (!isMountedRef.current) return;
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

        pollTimeoutRef.current = setTimeout(() => {
            executePollRef.current();
        }, delayMs);
    }, [clearScheduledPoll]);

    // Merge server messages into Map and update cursor
    const mergeServerMessages = useCallback((incoming: Message[]) => {
        if (!incoming || incoming.length === 0) return;

        for (const sm of incoming) {
            // If an optimistic pending/failed message exists with matching clientId, remove temporary key
            if (sm.clientId && messagesMapRef.current.has(sm.clientId)) {
                messagesMapRef.current.delete(sm.clientId);
            }
            messagesMapRef.current.set(sm.id, {
                ...sm,
                status: "sent",
            });
        }

        // Update cursor to the newest server message
        const lastMsg = incoming[incoming.length - 1];
        cursorRef.current = {
            after: lastMsg.createdAt,
            afterId: lastMsg.id,
        };

        syncMessagesToState();
    }, [syncMessagesToState]);

    const handleFullSessionLoad = useCallback((chatSession: ChatSession) => {
        setSession(chatSession);
        sessionIdRef.current = chatSession.id;

        // Preserve pending/failed optimistic messages belonging to this session
        const pendingOrFailed = Array.from(messagesMapRef.current.values()).filter(
            m => (m.status === "pending" || m.status === "failed") && (!m.sessionId || m.sessionId === chatSession.id)
        );

        messagesMapRef.current.clear();
        for (const p of pendingOrFailed) {
            messagesMapRef.current.set(p.id, p);
        }

        if (chatSession.messages && chatSession.messages.length > 0) {
            mergeServerMessages(chatSession.messages);
        } else {
            cursorRef.current = null;
            syncMessagesToState();
        }
    }, [mergeServerMessages, syncMessagesToState]);

    // Core poll function
    const executePoll = useCallback(async () => {
        if (!isMountedRef.current) return;
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

        // Requirement 3: Skip poll when sending is in progress
        if (sendingRef.current) {
            scheduleNextPoll(3000);
            return;
        }

        // Requirement 2: Do not overlap if already in flight
        if (inFlightRef.current) {
            return;
        }

        inFlightRef.current = true;
        const controller = new AbortController();
        pollAbortControllerRef.current = controller;

        try {
            const cursor = cursorRef.current;
            let url = "/api/chat";
            if (cursor?.after) {
                const params = new URLSearchParams();
                params.set("after", cursor.after);
                if (cursor.afterId) {
                    params.set("afterId", cursor.afterId);
                }
                url = `/api/chat?${params.toString()}`;
            }

            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) {
                throw new Error(`Poll failed: ${res.status}`);
            }

            const data = await res.json();
            if (data.success && data.data) {
                const chatSession: ChatSession = data.data;

                // Session change detection
                if (sessionIdRef.current && sessionIdRef.current !== chatSession.id) {
                    handleFullSessionLoad(chatSession);
                } else if (!cursor) {
                    handleFullSessionLoad(chatSession);
                } else {
                    setSession(chatSession);
                    if (chatSession.messages && chatSession.messages.length > 0) {
                        mergeServerMessages(chatSession.messages);
                    }
                }

                // Requirement 9: Reset backoff to 3s on success
                backoffDelayRef.current = 3000;
            } else {
                setSession(null);
                sessionIdRef.current = null;
            }

            // Requirement 1: Next poll scheduled only AFTER previous finishes
            scheduleNextPoll(backoffDelayRef.current);
        } catch (err: unknown) {
            if ((err instanceof Error && err.name === "AbortError") || controller.signal.aborted) {
                return;
            }
            // Requirement 9: Exponential backoff on error: 3s -> 6s -> 12s -> max 30s
            backoffDelayRef.current = Math.min(backoffDelayRef.current * 2, 30000);
            scheduleNextPoll(backoffDelayRef.current);
        } finally {
            inFlightRef.current = false;
            if (pollAbortControllerRef.current === controller) {
                pollAbortControllerRef.current = null;
            }
            setLoading(false);
        }
    }, [handleFullSessionLoad, mergeServerMessages, scheduleNextPoll]);

    // Keep ref updated
    executePollRef.current = executePoll;

    // Component Mount / Unmount lifecycle
    useEffect(() => {
        isMountedRef.current = true;
        executePoll();

        return () => {
            isMountedRef.current = false;
            clearScheduledPoll();
            abortInFlightPoll();
        };
    }, [executePoll, clearScheduledPoll, abortInFlightPoll]);

    // Requirement 4: Visibility change handling
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                // Pause polling & abort active in-flight request
                clearScheduledPoll();
                abortInFlightPoll();
            } else if (document.visibilityState === "visible") {
                // Resume immediately when tab becomes visible
                if (!sendingRef.current) {
                    backoffDelayRef.current = 3000;
                    executePoll();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [executePoll, clearScheduledPoll, abortInFlightPoll]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Send or retry a message
    const doSendMessage = async (content: string, targetSessionId: string, clientId: string) => {
        setSending(true);
        sendingRef.current = true;

        // Prevent overlapping polls while sending
        clearScheduledPoll();
        abortInFlightPoll();

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    sessionId: targetSessionId,
                    clientId,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to send message.");
            }

            const serverMsg: Message = data.data;

            // Replace optimistic message with confirmed server message
            messagesMapRef.current.delete(clientId);
            messagesMapRef.current.set(serverMsg.id, {
                ...serverMsg,
                status: "sent",
            });

            // Update tie-breaker cursor
            const cur = cursorRef.current;
            if (!cur || new Date(serverMsg.createdAt).getTime() >= new Date(cur.after).getTime()) {
                cursorRef.current = {
                    after: serverMsg.createdAt,
                    afterId: serverMsg.id,
                };
            }

            syncMessagesToState();
        } catch (err: unknown) {
            // Mark optimistic message as failed
            const existing = messagesMapRef.current.get(clientId);
            if (existing) {
                messagesMapRef.current.set(clientId, {
                    ...existing,
                    status: "failed",
                });
                syncMessagesToState();
            }
            const errorMsg = err instanceof Error ? err.message : "Failed to send message.";
            toast.error(errorMsg);
        } finally {
            setSending(false);
            sendingRef.current = false;
            inputRef.current?.focus();

            // Requirement 3: Immediate poll after sending completes
            backoffDelayRef.current = 3000;
            executePoll();
        }
    };

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const content = input.trim();
        if (!content || !session?.id || sending) return;

        const clientId = generateClientId();
        setInput("");

        // Optimistic message
        const optimistic: Message = {
            id: clientId,
            sessionId: session.id,
            senderName: currentUserName,
            senderRole: isAdmin ? "ADMIN" : "MEMBER",
            content,
            createdAt: new Date().toISOString(),
            clientId,
            status: "pending",
        };

        messagesMapRef.current.set(clientId, optimistic);
        syncMessagesToState();
        scrollToBottom();

        await doSendMessage(content, session.id, clientId);
    };

    const retrySendMessage = async (msg: Message) => {
        if (!session?.id || !msg.clientId) return;

        // Set status to pending again
        messagesMapRef.current.set(msg.clientId, {
            ...msg,
            status: "pending",
        });
        syncMessagesToState();

        await doSendMessage(msg.content, session.id, msg.clientId);
    };

    const startSession = async () => {
        const res = await fetch("/api/chat/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "start", title: sessionTitle }),
        });
        const data = await res.json();
        if (data.success) {
            toast.success("Chat session started! Members can now join.");
            clearScheduledPoll();
            abortInFlightPoll();
            messagesMapRef.current.clear();
            cursorRef.current = null;
            sessionIdRef.current = data.data.id;
            setMessages([]);
            backoffDelayRef.current = 3000;
            executePoll();
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
            clearScheduledPoll();
            abortInFlightPoll();
            backoffDelayRef.current = 3000;
            executePoll();
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
                                                ? msg.status === "failed"
                                                    ? "bg-rose-950/80 text-rose-100 border border-rose-500/40 rounded-br-md"
                                                    : msg.status === "pending"
                                                        ? "bg-amber-600/70 text-amber-100 rounded-br-md"
                                                        : "bg-amber-600 text-white rounded-br-md"
                                                : isAdminMsg
                                                    ? "bg-brand-neutral-700/80 text-white border border-amber-500/20 rounded-bl-md"
                                                    : "bg-brand-neutral-800 text-brand-neutral-200 rounded-bl-md"
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <div className={`flex flex-col shrink-0 mb-1 ${isSelf ? "items-end" : "items-start"}`}>
                                            <span className="text-[9px] text-brand-neutral-600">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                            {msg.status === "pending" && (
                                                <span className="text-[9px] text-amber-400 flex items-center gap-1 mt-0.5">
                                                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Sending...
                                                </span>
                                            )}
                                            {msg.status === "failed" && (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[9px] text-rose-400 font-medium flex items-center gap-0.5">
                                                        <AlertCircle className="w-2.5 h-2.5" /> Failed
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => retrySendMessage(msg)}
                                                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-brand-neutral-800/80 px-1.5 py-0.5 rounded border border-amber-500/30 cursor-pointer transition-colors"
                                                        title="Retry sending this message"
                                                    >
                                                        <RotateCcw className="w-2.5 h-2.5" /> Retry
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
