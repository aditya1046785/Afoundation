import { Toaster } from "sonner";

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: "bg-white shadow-xl border border-slate-100 rounded-xl",
                    title: "text-slate-900 font-semibold text-sm",
                    description: "text-slate-500 text-xs",
                    success: "border-l-4 border-emerald-500",
                    error: "border-l-4 border-red-500",
                    warning: "border-l-4 border-amber-500",
                },
            }}
        />
    );
}
