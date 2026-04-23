"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2, Globe, Phone, Share2, FileText, Upload, PenTool } from "lucide-react";
import { CloudinaryUploadButton } from "@/components/ui/cloudinary-upload-button";

interface Props {
    settings: Record<string, string>;
}

export function CMSGeneralEditor({ settings }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingSignature, setIsUploadingSignature] = useState(false);
    const signatureInputRef = useRef<HTMLInputElement>(null);
    const { register, getValues, setValue, watch } = useForm({ defaultValues: settings });
    const adminSignature = watch("admin_signature");

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
            if (result.success) {
                toast.success("Settings saved!");
                return true;
            }
            toast.error("Failed to save.");
            return false;
        } catch {
            toast.error("An error occurred.");
            return false;
        }
        finally { setIsSaving(false); }
    };

    const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingSignature(true);
        try {
            const sigRes = await fetch("/api/upload");
            const sigData = await sigRes.json();
            if (!sigData.success) throw new Error("Could not fetch upload signature");

            const { signature, timestamp, cloudName, apiKey, folder } = sigData.data;
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("signature", signature);
            uploadFormData.append("timestamp", String(timestamp));
            uploadFormData.append("api_key", apiKey);
            uploadFormData.append("folder", folder);

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: uploadFormData,
            });

            const uploadedFile = await uploadRes.json();
            if (!uploadedFile.secure_url) throw new Error("Cloudinary upload failed");

            setValue("admin_signature", uploadedFile.secure_url, { shouldDirty: true });
            await save(["admin_signature"]);
        } catch (error) {
            console.error("Signature upload error:", error);
            toast.error("Failed to upload signature.");
        } finally {
            setIsUploadingSignature(false);
            if (signatureInputRef.current) signatureInputRef.current.value = "";
        }
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
                        <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <Input {...register("org_logo")} />
                            <CloudinaryUploadButton
                                buttonText="Upload Logo"
                                disabled={isSaving}
                                onUploaded={(url) => {
                                    setValue("org_logo", url, { shouldDirty: true });
                                    toast.success("Logo uploaded successfully.");
                                }}
                                onError={() => toast.error("Failed to upload logo.")}
                            />
                        </div>
                        <div><Label>Registration Number</Label><Input {...register("registration_number")} /></div>
                    </div>
                    <div><Label>About (Short description)</Label><Textarea {...register("org_description")} rows={3} /></div>
                </CardContent>
            </Card>

            {/* Signature */}
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-blue-700" /> Admin Signature
                    </CardTitle>
                    <SaveBtn keys={["admin_signature"]} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Signature Image URL</Label>
                            <Input {...register("admin_signature")} placeholder="https://..." />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <input
                                ref={signatureInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleSignatureUpload}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => signatureInputRef.current?.click()}
                                disabled={isUploadingSignature || isSaving}
                            >
                                {isUploadingSignature ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                Upload Signature
                            </Button>
                        </div>
                    </div>

                    {adminSignature ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Preview</p>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm max-w-60">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={adminSignature} alt="Admin Signature Preview" className="max-h-24 w-auto object-contain" />
                                </div>
                                <p className="text-sm text-slate-500">This signature image will be stored in website settings and used later in the ID card.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                            No signature uploaded yet.
                        </div>
                    )}
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
