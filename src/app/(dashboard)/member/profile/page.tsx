"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Lock, Loader2, Save } from "lucide-react";
import type { z } from "zod";
import { CloudinaryUploadButton } from "@/components/ui/cloudinary-upload-button";
import Image from "next/image";

type PasswordFormData = z.infer<typeof changePasswordSchema>;

export default function MemberProfilePage() {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(session?.user?.image || null);
    const [savingPhoto, setSavingPhoto] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/members/me");
                const result = await res.json();
                if (result.success) {
                    setProfileImage(result.data?.user?.image || null);
                }
            } catch {
                // Keep existing session image if fetch fails.
            }
        };

        fetchProfile();
    }, []);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onChangePassword = async (data: PasswordFormData) => {
        setSaving(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Password changed successfully!");
                reset();
            } else toast.error(result.error || "Failed to change password.");
        } catch {
            toast.error("An error occurred.");
        } finally { setSaving(false); }
    };

    const saveProfileImage = async (imageUrl: string) => {
        setSavingPhoto(true);
        try {
            const res = await fetch("/api/members/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageUrl }),
            });

            const result = await res.json();
            if (result.success) {
                setProfileImage(result.data?.image || imageUrl);
                toast.success("Profile photo updated. It will reflect on your ID card.");
            } else {
                toast.error(result.error || "Failed to update profile photo.");
            }
        } catch {
            toast.error("An error occurred while saving profile photo.");
        } finally {
            setSavingPhoto(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account settings</p>
            </div>

            {/* Profile Info */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-700" /> Account Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0">
                            {profileImage ? (
                                <Image src={profileImage} alt="Profile" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">No Photo</div>
                            )}
                        </div>
                        <div className="space-y-2 w-full">
                            <Label className="text-xs text-slate-500">Profile Photo</Label>
                            <CloudinaryUploadButton
                                buttonText={savingPhoto ? "Saving..." : "Upload Profile Photo"}
                                className="w-full sm:w-auto"
                                disabled={savingPhoto}
                                onUploaded={saveProfileImage}
                                onError={() => toast.error("Failed to upload photo. Please try again.")}
                            />
                            <p className="text-[11px] text-slate-500">This image is used in your member ID card.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs text-slate-400">Name</Label>
                            <p className="text-sm font-medium text-slate-800">{session?.user?.name || "—"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400">Email</Label>
                            <p className="text-sm font-medium text-slate-800">{session?.user?.email || "—"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400">Role</Label>
                            <p className="text-sm font-medium text-slate-800 capitalize">{(session?.user as any)?.role?.toLowerCase() || "—"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-700" /> Change Password
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                        <div>
                            <Label>Current Password *</Label>
                            <Input {...register("currentPassword")} type="password" />
                            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
                        </div>
                        <div>
                            <Label>New Password *</Label>
                            <Input {...register("newPassword")} type="password" />
                            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                        </div>
                        <div>
                            <Label>Confirm New Password *</Label>
                            <Input {...register("confirmPassword")} type="password" />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <Button type="submit" disabled={saving} className="bg-blue-800 hover:bg-blue-900 text-white">
                            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Update Password</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
