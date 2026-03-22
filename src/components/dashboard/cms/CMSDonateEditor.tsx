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

export function CMSDonateEditor() {
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
        if (data.success) toast.success("Donate page content saved!");
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
                    <h2 className="font-serif text-xl font-bold text-slate-900">Donate Page Content</h2>
                    <p className="text-slate-500 text-sm">Edit the donation page messaging</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-800 hover:bg-blue-900 text-white">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save</>}
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Donation Page</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Page Heading" name="donate_heading" placeholder="Make a Difference Today" />
                    <Field label="Page Description" name="donate_description" multiline placeholder="Your contribution can change lives..." />
                    <Field label="Quick Amounts (comma separated)" name="donate_quick_amounts" placeholder="500, 1000, 2000, 5000" />
                    <Field label="UPI ID (for direct UPI)" name="donate_upi_id" placeholder="nirashray@upi" />
                    <Field label="Bank Account Name" name="donate_bank_name" placeholder="Nirashray Foundation" />
                    <Field label="Bank Account Number" name="donate_bank_account" placeholder="XXXXXXXXXX" />
                    <Field label="Bank IFSC Code" name="donate_bank_ifsc" placeholder="XXXX0XXXXXX" />
                    <Field label="Bank Branch" name="donate_bank_branch" placeholder="Main Branch" />
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Impact Messaging</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Impact Text" name="donate_impact_text" multiline placeholder="What your donation achieves..." />
                    <Field label="Thank You Message" name="donate_thank_you" multiline placeholder="Thank you message shown after donation..." />
                </CardContent>
            </Card>
        </div>
    );
}
