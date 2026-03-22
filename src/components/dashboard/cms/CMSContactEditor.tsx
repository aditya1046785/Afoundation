"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface SiteSettings { [key: string]: string }

export function CMSContactEditor() {
    const [settings, setSettings] = useState<SiteSettings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const res = await fetch("/api/site-settings");
            const data = await res.json();
            if (data.success) setSettings(data.data);
            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("/api/site-settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
        });
        const data = await res.json();
        if (data.success) toast.success("Contact page content saved!");
        else toast.error("Failed to save.");
        setSaving(false);
    };

    if (loading) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;

    const Field = ({ label, name, multiline = false, placeholder = "" }: { label: string; name: string; multiline?: boolean; placeholder?: string }) => (
        <div>
            <Label className="text-sm">{label}</Label>
            {multiline ? (
                <Textarea value={settings[name] || ""} onChange={(e) => handleChange(name, e.target.value)} rows={3} placeholder={placeholder} />
            ) : (
                <Input value={settings[name] || ""} onChange={(e) => handleChange(name, e.target.value)} placeholder={placeholder} />
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">Contact Page Content</h2>
                    <p className="text-slate-500 text-sm">Edit contact information displayed on the website</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-800 hover:bg-blue-900 text-white">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save</>}
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Contact Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Address" name="contact_address" multiline placeholder="Full postal address" />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Phone Number" name="contact_phone" placeholder="+91 XXXXX XXXXX" />
                        <Field label="Email Address" name="contact_email" placeholder="info@nirashray.org" />
                    </div>
                    <Field label="Working Hours" name="contact_hours" placeholder="Mon-Sat 10 AM - 6 PM" />
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Google Maps</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Map Embed URL" name="contact_map_embed" placeholder="https://www.google.com/maps/embed?pb=..." />
                    <p className="text-xs text-slate-400">Paste the iframe src URL from Google Maps embed code</p>
                </CardContent>
            </Card>
        </div>
    );
}
