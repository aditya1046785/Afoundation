"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { safeJsonParse } from "@/lib/utils";

interface SiteSettings { [key: string]: string }
interface NavLink { label: string; url: string }

export default function CMSNavFooterPage() {
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
        if (data.success) toast.success("Navigation & Footer saved!");
        else toast.error("Failed to save.");
        setSaving(false);
    };

    // Helpers for JSON array fields
    const getLinks = (key: string): NavLink[] => safeJsonParse<NavLink[]>(settings[key] || "[]", []);
    const setLinks = (key: string, links: NavLink[]) => handleChange(key, JSON.stringify(links));
    const addLink = (key: string) => setLinks(key, [...getLinks(key), { label: "", url: "" }]);
    const removeLink = (key: string, idx: number) => setLinks(key, getLinks(key).filter((_, i) => i !== idx));
    const updateLink = (key: string, idx: number, field: "label" | "url", value: string) => {
        const links = getLinks(key);
        links[idx] = { ...links[idx], [field]: value };
        setLinks(key, links);
    };

    if (loading) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;

    const LinksEditor = ({ title, settingsKey }: { title: string; settingsKey: string }) => {
        const links = getLinks(settingsKey);
        return (
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{title}</CardTitle>
                        <Button size="sm" variant="outline" onClick={() => addLink(settingsKey)}>
                            <Plus className="w-3 h-3 mr-1" /> Add Link
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {links.length === 0 && <p className="text-sm text-slate-400">No links added yet.</p>}
                    {links.map((link, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input
                                value={link.label}
                                onChange={(e) => updateLink(settingsKey, i, "label", e.target.value)}
                                placeholder="Label"
                                className="flex-1"
                            />
                            <Input
                                value={link.url}
                                onChange={(e) => updateLink(settingsKey, i, "url", e.target.value)}
                                placeholder="/path or URL"
                                className="flex-1"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeLink(settingsKey, i)} className="text-red-500 shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Navigation & Footer</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage navigation links and footer content</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-800 hover:bg-blue-900 text-white">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save All</>}
                </Button>
            </div>

            {/* Navbar Settings */}
            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Navbar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm">CTA Button Text</Label>
                            <Input value={settings.navbar_cta_text || ""} onChange={(e) => handleChange("navbar_cta_text", e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-sm">CTA Button Link</Label>
                            <Input value={settings.navbar_cta_link || ""} onChange={(e) => handleChange("navbar_cta_link", e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <LinksEditor title="Navigation Links" settingsKey="navbar_links" />

            {/* Footer */}
            <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Footer Content</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-sm">About Text</Label>
                        <Textarea value={settings.footer_about || ""} onChange={(e) => handleChange("footer_about", e.target.value)} rows={3} />
                    </div>
                    <div>
                        <Label className="text-sm">Copyright Text</Label>
                        <Input value={settings.footer_copyright || ""} onChange={(e) => handleChange("footer_copyright", e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <LinksEditor title="Footer Quick Links" settingsKey="footer_quick_links" />
            <LinksEditor title="Footer Support Links" settingsKey="footer_support_links" />
        </div>
    );
}
