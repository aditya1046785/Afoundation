"use client";

import { useSession } from "next-auth/react";
import { LiveChatBox } from "@/components/dashboard/LiveChatBox";
import { MessageSquareDot } from "lucide-react";

export default function MemberLiveChatPage() {
    const { data: session } = useSession();
    const name = session?.user?.name || "Member";

    return (
        <div className="space-y-6 max-w-3xl mx-auto h-[calc(100vh-8rem)]">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <MessageSquareDot className="w-6 h-6 text-amber-600" /> Live Chat
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Join when an admin opens a session. You'll see all messages in real time.
                </p>
            </div>

            <div className="flex-1 h-[calc(100%-6rem)]">
                <LiveChatBox currentUserName={name} />
            </div>
        </div>
    );
}
