"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2, Globe, Phone, MapPin, Share2, FileText } from "lucide-react";

interface Props {
    settings: Record<string, string>;
}

export function CMSGeneralEditor({ settings }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const { register, getValues } = useForm({ defaultValues: settings });

    const save = async (keys: string[]) => {
        setIsSaving(true);
        const values = getValues();
        const data = keys.reduce((acc, key) => { acc[key] = values[key] || ""; return acc; }, {} as Record<string, string>);
        try {
            const res = await fetch("/api/site-settings", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) toast.success("Settings saved!");
            else toast.error("Failed to save.");
        } catch { toast.error("An error occurred."); }
        finally { setIsSaving(false); }
    };

    const SaveBtn = ({ keys }: { keys: string[] }) => (
        <Button type="button" onClick={() => save(keys)} disabled={isSaving} className="bg-blue-800 hover:bg-blue-900 text-white">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
        </Button>
    );

    return (
        <div className="space-y-6">
            {/* Organization */}
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-700" /> Organization Info
                    </CardTitle>
                    <SaveBtn keys={["org_name", "org_tagline", "org_description", "org_logo", "registration_number"]} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><Label>Organization Name</Label><Input {...register("org_name")} /></div>
                        <div><Label>Tagline</Label><Input {...register("org_tagline")} /></div>
                        <div><Label>Logo URL</Label><Input {...register("org_logo")} /></div>
                        <div><Label>Registration Number</Label><Input {...register("registration_number")} /></div>
                    </div>
                    <div><Label>About (Short description)</Label><Textarea {...register("org_description")} rows={3} /></div>
                </CardContent>
            </Card>

            {/* Contact */}
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-700" /> Contact Information
                    </CardTitle>
                    <SaveBtn keys={["contact_phone", "contact_email", "contact_address", "contact_city", "contact_state", "contact_pincode", "contact_map_embed"]} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><Label>Phone</Label><Input {...register("contact_phone")} /></div>
                        <div><Label>Email</Label><Input {...register("contact_email")} /></div>
                        <div><Label>City</Label><Input {...register("contact_city")} /></div>
                        <div><Label>State</Label><Input {...register("contact_state")} /></div>
                        <div><Label>Pincode</Label><Input {...register("contact_pincode")} /></div>
                    </div>
                    <div><Label>Full Address</Label><Textarea {...register("contact_address")} rows={2} /></div>
                    <div><Label>Google Maps Embed URL (iframe src)</Label><Input {...register("contact_map_embed")} /></div>
                </CardContent>
            </Card>

            {/* Social */}
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-blue-700" /> Social Media Links
                    </CardTitle>
                    <SaveBtn keys={["social_facebook", "social_instagram", "social_twitter", "social_youtube", "social_linkedin"]} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["facebook", "instagram", "twitter", "youtube", "linkedin"].map((platform) => (
                            <div key={platform}>
                                <Label className="capitalize">{platform}</Label>
                                <Input {...register(`social_${platform}`)} placeholder={`https://${platform}.com/...`} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Legal */}
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-700" /> Legal &amp; Footer
                    </CardTitle>
                    <SaveBtn keys={["footer_copyright", "footer_legal_text", "privacy_policy_url", "terms_url"]} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div><Label>Copyright Text</Label><Input {...register("footer_copyright")} /></div>
                    <div><Label>Legal / Tax Exemption Text</Label><Textarea {...register("footer_legal_text")} rows={2} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Privacy Policy URL</Label><Input {...register("privacy_policy_url")} /></div>
                        <div><Label>Terms &amp; Conditions URL</Label><Input {...register("terms_url")} /></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
