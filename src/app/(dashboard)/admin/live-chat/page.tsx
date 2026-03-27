"use client";

import { useSession } from "next-auth/react";
import { LiveChatBox } from "@/components/dashboard/LiveChatBox";
import { MessageSquareDot, Sparkles } from "lucide-react";

export default function AdminLiveChatPage() {
    const { data: session } = useSession();
    const name = session?.user?.name || "Admin";

    return (
        <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <MessageSquareDot className="w-6 h-6 text-amber-600" /> Live Chat Console
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Start a session to open live communication with all members. Your chat controls are in the chat window below.
                    </p>
                </div>
            </div>

            {/* Tips */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-amber-700 text-xs font-medium leading-relaxed">
                    <strong>Tip:</strong> Click "Go Live" to open the session for all members.
                    Give your session a title like "Q&A Session" or "Town Hall".
                    Members on their dashboard will immediately see the chat and can join.
                    Messages appear in real time. End the session anytime to close the chat.
                </p>
            </div>

            {/* Chat window — fills remaining height */}
            <div className="flex-1 h-[calc(100%-9rem)]">
                <LiveChatBox isAdmin currentUserName={name} />
            </div>
        </div>
    );
}
