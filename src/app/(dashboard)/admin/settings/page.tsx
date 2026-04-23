"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Settings, Globe, Mail, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudinaryUploadButton } from "@/components/ui/cloudinary-upload-button";

interface SiteSettings {
    [key: string]: string;
}

export default function AdminSettingsPage() {
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
        try {
            const res = await fetch("/api/site-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (data.success) toast.success("Settings saved successfully!");
            else toast.error(data.error || "Failed to save settings.");
        } catch {
            toast.error("An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

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
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Site Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure global website settings</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-800 hover:bg-blue-900 text-white">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save All</>}
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general" className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> General</TabsTrigger>
                    <TabsTrigger value="contact" className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Contact</TabsTrigger>
                    <TabsTrigger value="social" className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Social</TabsTrigger>
                    <TabsTrigger value="seo" className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> SEO & Legal</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="border-0 shadow-sm">
                        <CardHeader><CardTitle className="text-base">Organization Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Field label="Organization Name" name="org_name" placeholder="Nirashray Foundation" />
                            <Field label="Tagline" name="org_tagline" placeholder="Empowering communities..." />
                            <Field label="Registration Number" name="registration_number" placeholder="REG/2024/XXX" />
                            <div className="space-y-2">
                                <Field label="Logo URL" name="logo_url" placeholder="https://..." />
                                <CloudinaryUploadButton
                                    buttonText="Upload Logo"
                                    disabled={saving}
                                    onUploaded={(url) => {
                                        handleChange("logo_url", url);
                                        toast.success("Logo uploaded.");
                                    }}
                                    onError={() => toast.error("Failed to upload logo.")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Field label="Favicon URL" name="favicon_url" placeholder="https://..." />
                                <CloudinaryUploadButton
                                    buttonText="Upload Favicon"
                                    disabled={saving}
                                    onUploaded={(url) => {
                                        handleChange("favicon_url", url);
                                        toast.success("Favicon uploaded.");
                                    }}
                                    onError={() => toast.error("Failed to upload favicon.")}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact">
                    <Card className="border-0 shadow-sm">
                        <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Field label="Address" name="contact_address" multiline placeholder="Full address" />
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Phone" name="contact_phone" placeholder="+91 XXXXX XXXXX" />
                                <Field label="Email" name="contact_email" placeholder="info@nirashray.org" />
                            </div>
                            <Field label="Working Hours" name="contact_hours" placeholder="Mon-Sat 10 AM - 6 PM" />
                            <Field label="Google Maps Embed URL" name="contact_map_embed" placeholder="https://www.google.com/maps/embed?..." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="social">
                    <Card className="border-0 shadow-sm">
                        <CardHeader><CardTitle className="text-base">Social Media Links</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Field label="Facebook URL" name="social_facebook" placeholder="https://facebook.com/..." />
                            <Field label="Instagram URL" name="social_instagram" placeholder="https://instagram.com/..." />
                            <Field label="Twitter/X URL" name="social_twitter" placeholder="https://x.com/..." />
                            <Field label="YouTube URL" name="social_youtube" placeholder="https://youtube.com/..." />
                            <Field label="LinkedIn URL" name="social_linkedin" placeholder="https://linkedin.com/..." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="seo">
                    <Card className="border-0 shadow-sm">
                        <CardHeader><CardTitle className="text-base">SEO & Legal</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Field label="Site Title (SEO)" name="seo_title" placeholder="Nirashray Foundation - NGO" />
                            <Field label="Site Description (SEO)" name="seo_description" multiline placeholder="Meta description for search engines" />
                            <div className="space-y-2">
                                <Field label="OG Image URL" name="seo_og_image" placeholder="https://..." />
                                <CloudinaryUploadButton
                                    buttonText="Upload OG Image"
                                    disabled={saving}
                                    onUploaded={(url) => {
                                        handleChange("seo_og_image", url);
                                        toast.success("OG image uploaded.");
                                    }}
                                    onError={() => toast.error("Failed to upload OG image.")}
                                />
                            </div>
                            <Field label="Footer Legal Text" name="footer_legal_text" multiline placeholder="© 2024 Nirashray Foundation..." />
                            <Field label="Privacy Policy URL" name="privacy_policy_url" placeholder="/privacy" />
                            <Field label="Terms of Service URL" name="terms_url" placeholder="/terms" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
