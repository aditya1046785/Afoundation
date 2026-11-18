import { Toaster } from "sonner";

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: "bg-white shadow-xl border border-brand-neutral-100 rounded-xl",
                    title: "text-brand-neutral-900 font-semibold text-sm",
                    description: "text-brand-neutral-500 text-xs",
                    success: "border-l-4 border-emerald-500",
                    error: "border-l-4 border-red-500",
                    warning: "border-l-4 border-amber-500",
                },
            }}
        />
    );
}
