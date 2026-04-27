import { MessageCircle } from "lucide-react";

export function WhatsAppFloatButton() {
    const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "";
    const whatsappNumber = rawNumber.replace(/\D/g, "");

    if (!whatsappNumber) {
        return null;
    }

    const prefilledText = (process.env.NEXT_PUBLIC_WHATSAPP_PREFILL_TEXT || "").trim();
    const href = prefilledText
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefilledText)}`
        : `https://wa.me/${whatsappNumber}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            title="Chat with us on WhatsApp"
            className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-white sm:bottom-6 sm:right-6"
        >
            <MessageCircle className="h-7 w-7" />
            <span className="sr-only">Open WhatsApp chat</span>
        </a>
    );
}
