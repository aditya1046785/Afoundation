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

export function CMSAboutEditor() {
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
        if (data.success) toast.success("About page content saved!");
        else toast.error("Failed to save.");
        setSaving(false);
    };

    if (loading) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;

    const Field = ({ label, name, multiline = false, placeholder = "" }: { label: string; name: string; multiline?: boolean; placeholder?: string }) => (
        <div>
            <Label className="text-sm">{label}</Label>
            {multiline ? (
                <Textarea value={settings[name] || ""} onChange={(e) => handleChange(name, e.target.value)} rows={4} placeholder={placeholder} />
            ) : (
                <Input value={settings[name] || ""} onChange={(e) => handleChange(name, e.target.value)} placeholder={placeholder} />
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">About Page Content</h2>
                    <p className="text-slate-500 text-sm">Edit the content shown on the About page</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-800 hover:bg-blue-900 text-white">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save</>}
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Page Header</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Heading" name="about_page_heading" placeholder="About Nirashray Foundation" />
                    <Field label="Subheading" name="about_page_subheading" placeholder="Empowering communities..." />
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Our Story</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Story Heading" name="about_story_heading" placeholder="How It All Began" />
                    <Field label="Story Text" name="about_story_text" multiline placeholder="Tell your organization's story..." />
                    <Field label="Story Image URL" name="about_story_image" placeholder="https://..." />
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Mission, Vision & Values</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Mission" name="about_mission" multiline placeholder="Our mission statement..." />
                    <Field label="Vision" name="about_vision" multiline placeholder="Our vision statement..." />
                    <Field label="Values" name="about_values" multiline placeholder="Our core values..." />
                </CardContent>
            </Card>
        </div>
    );
}
