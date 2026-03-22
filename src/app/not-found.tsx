"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                <div className="mb-8">
                    <span className="text-8xl font-serif font-bold text-gradient">404</span>
                </div>
                <h1 className="font-serif text-2xl font-bold text-slate-900 mb-3">Page Not Found</h1>
                <p className="text-slate-500 text-sm mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/">
                        <Button className="bg-blue-800 hover:bg-blue-900 text-white">
                            <Home className="w-4 h-4 mr-2" /> Go Home
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
