export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin" />
                </div>
                <p className="text-slate-400 text-sm">Loading...</p>
            </div>
        </div>
    );
}
