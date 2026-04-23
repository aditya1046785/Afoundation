"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { CloudinaryUploadButton } from "@/components/ui/cloudinary-upload-button";

interface Props {
    settings: Record<string, string>;
}

export function CMSHomeEditor({ settings }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const { register, getValues, setValue } = useForm({ defaultValues: settings });

    const saveSection = async (sectionKeys: string[]) => {
        setIsSaving(true);
        const values = getValues();
        const sectionData = sectionKeys.reduce((acc, key) => {
            acc[key] = values[key] || "";
            return acc;
        }, {} as Record<string, string>);

        try {
            const res = await fetch("/api/site-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sectionData),
            });
            const data = await res.json();
            if (data.success) toast.success("Changes saved successfully!");
            else toast.error("Failed to save changes.");
        } catch {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const heroKeys = ["hero_badge_text", "hero_heading", "hero_subheading", "hero_description_suffix", "hero_image", "hero_cta1_text", "hero_cta1_link", "hero_cta2_text", "hero_cta2_link"];
    const statsKeys = ["impact_stat1_number", "impact_stat1_label", "impact_stat1_icon", "impact_stat2_number", "impact_stat2_label", "impact_stat2_icon", "impact_stat3_number", "impact_stat3_label", "impact_stat3_icon", "impact_stat4_number", "impact_stat4_label", "impact_stat4_icon"];
    const aboutKeys = ["about_brief_eyebrow", "about_brief_heading", "about_brief_text", "about_brief_image", "about_brief_highlights", "about_brief_cta_text", "about_brief_cta_link"];
    const causesKeys = ["causes_eyebrow", "causes_heading", "causes_subtext", "causes_card_cta_text", "cause1_title", "cause1_description", "cause1_icon", "cause2_title", "cause2_description", "cause2_icon", "cause3_title", "cause3_description", "cause3_icon"];
    const donateCtaKeys = ["donate_cta_eyebrow", "donate_cta_heading", "donate_cta_subtext", "donate_cta_button_text", "donate_cta_trust_text", "donate_amounts"];
    const testimonialKeys = ["testimonials_eyebrow", "testimonials_heading", "testimonial1_name", "testimonial1_designation", "testimonial1_quote", "testimonial1_image", "testimonial2_name", "testimonial2_designation", "testimonial2_quote", "testimonial2_image", "testimonial3_name", "testimonial3_designation", "testimonial3_quote", "testimonial3_image"];
    const sectionHeadingKeys = ["team_section_heading", "team_section_subtext", "blog_section_heading", "blog_section_subtext", "gallery_section_heading", "gallery_section_subtext"];

    const SaveBtn = ({ keys }: { keys: string[] }) => (
        <Button type="button" onClick={() => saveSection(keys)} disabled={isSaving} className="bg-blue-800 hover:bg-blue-900 text-white">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
        </Button>
    );

    return (
        <Tabs defaultValue="hero" className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1 bg-slate-100 p-1">
                {["hero", "stats", "about", "causes", "donate-cta", "testimonials", "sections"].map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="capitalize text-xs">
                        {tab.replace("-", " ")}
                    </TabsTrigger>
                ))}
            </TabsList>

            {/* HERO */}
            <TabsContent value="hero">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Hero Section</CardTitle>
                        <SaveBtn keys={heroKeys} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label>Eyebrow Text</Label>
                                <Input {...register("hero_badge_text")} placeholder="The Art of Giving" />
                            </div>
                            <div>
                                <Label>Heading *</Label>
                                <Input {...register("hero_heading")} placeholder="Nirashray Foundation" />
                            </div>
                            <div>
                                <Label>Subheading</Label>
                                <Textarea {...register("hero_subheading")} rows={2} />
                            </div>
                            <div>
                                <Label>Description Suffix</Label>
                                <Textarea {...register("hero_description_suffix")} rows={2} placeholder="Every life we touch adds a new, beautiful color to the canvas of humanity." />
                            </div>
                            <div>
                                <Label>Background Image URL</Label>
                                <Input {...register("hero_image")} placeholder="/hero-bg.jpg or Cloudinary URL" />
                                <CloudinaryUploadButton
                                    buttonText="Upload Hero Image"
                                    className="mt-2"
                                    disabled={isSaving}
                                    onUploaded={(url) => {
                                        setValue("hero_image", url, { shouldDirty: true });
                                        toast.success("Hero image uploaded.");
                                    }}
                                    onError={() => toast.error("Failed to upload hero image.")}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>CTA Button 1 Text</Label>
                                    <Input {...register("hero_cta1_text")} placeholder="Donate Now" />
                                </div>
                                <div>
                                    <Label>CTA Button 1 Link</Label>
                                    <Input {...register("hero_cta1_link")} placeholder="/donate" />
                                </div>
                                <div>
                                    <Label>CTA Button 2 Text</Label>
                                    <Input {...register("hero_cta2_text")} placeholder="Join Us" />
                                </div>
                                <div>
                                    <Label>CTA Button 2 Link</Label>
                                    <Input {...register("hero_cta2_link")} placeholder="/register" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* IMPACT STATS */}
            <TabsContent value="stats">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Impact Statistics</CardTitle>
                        <SaveBtn keys={statsKeys} />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <p className="font-medium text-sm text-slate-700">Stat {i}</p>
                                    <div>
                                        <Label className="text-xs">Number (e.g. 500+)</Label>
                                        <Input {...register(`impact_stat${i}_number`)} placeholder="500+" />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Label</Label>
                                        <Input {...register(`impact_stat${i}_label`)} placeholder="Lives Impacted" />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Icon (Lucide name)</Label>
                                        <Input {...register(`impact_stat${i}_icon`)} placeholder="Heart, Users, Calendar..." />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* ABOUT BRIEF */}
            <TabsContent value="about">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">About Brief Section</CardTitle>
                        <SaveBtn keys={aboutKeys} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Eyebrow Text</Label>
                            <Input {...register("about_brief_eyebrow")} placeholder="Our Story" />
                        </div>
                        <div>
                            <Label>Section Heading</Label>
                            <Input {...register("about_brief_heading")} placeholder="Who We Are" />
                        </div>
                        <div>
                            <Label>Content Text</Label>
                            <Textarea {...register("about_brief_text")} rows={5} placeholder="Write about your organization..." />
                        </div>
                        <div>
                            <Label>Section Image URL</Label>
                            <Input {...register("about_brief_image")} placeholder="/about-brief.jpg or Cloudinary URL" />
                            <CloudinaryUploadButton
                                buttonText="Upload About Image"
                                className="mt-2"
                                disabled={isSaving}
                                onUploaded={(url) => {
                                    setValue("about_brief_image", url, { shouldDirty: true });
                                    toast.success("About image uploaded.");
                                }}
                                onError={() => toast.error("Failed to upload about image.")}
                            />
                        </div>
                        <div>
                            <Label>Highlights (one per line)</Label>
                            <Textarea
                                {...register("about_brief_highlights")}
                                rows={4}
                                placeholder={`Registered NGO under Societies Registration Act\n80G Tax Exemption Certificate\nFully transparent fund utilization\nActive across multiple communities`}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label>CTA Button Text</Label>
                                <Input {...register("about_brief_cta_text")} placeholder="Learn More About Us" />
                            </div>
                            <div>
                                <Label>CTA Link</Label>
                                <Input {...register("about_brief_cta_link")} placeholder="/about" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* CAUSES */}
            <TabsContent value="causes">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Our Causes (3 Cards)</CardTitle>
                        <SaveBtn keys={causesKeys} />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                <p className="font-medium text-sm text-slate-700">Section Copy</p>
                                <div>
                                    <Label className="text-xs">Eyebrow Text</Label>
                                    <Input {...register("causes_eyebrow")} placeholder="What We Do" />
                                </div>
                                <div>
                                    <Label className="text-xs">Section Heading</Label>
                                    <Input {...register("causes_heading")} placeholder="Our Canvas of Impact" />
                                </div>
                                <div>
                                    <Label className="text-xs">Section Subtext</Label>
                                    <Textarea {...register("causes_subtext")} rows={2} />
                                </div>
                                <div>
                                    <Label className="text-xs">Card CTA Text</Label>
                                    <Input {...register("causes_card_cta_text")} placeholder="Support This Cause" />
                                </div>
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <p className="font-medium text-sm text-slate-700">Cause {i}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Title</Label>
                                            <Input {...register(`cause${i}_title`)} placeholder="Education for All" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Icon (Lucide name)</Label>
                                            <Input {...register(`cause${i}_icon`)} placeholder="GraduationCap" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Description</Label>
                                        <Textarea {...register(`cause${i}_description`)} rows={2} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* DONATE CTA */}
            <TabsContent value="donate-cta">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Donate CTA Section</CardTitle>
                        <SaveBtn keys={donateCtaKeys} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Eyebrow Text</Label>
                            <Input {...register("donate_cta_eyebrow")} placeholder="Join Our Mission" />
                        </div>
                        <div>
                            <Label>Heading</Label>
                            <Input {...register("donate_cta_heading")} placeholder="Make a Difference Today" />
                        </div>
                        <div>
                            <Label>Subtext</Label>
                            <Textarea {...register("donate_cta_subtext")} rows={2} />
                        </div>
                        <div>
                            <Label>Primary Button Text</Label>
                            <Input {...register("donate_cta_button_text")} placeholder="Donate Now" />
                        </div>
                        <div>
                            <Label>Trust Line</Label>
                            <Input {...register("donate_cta_trust_text")} placeholder="Tax benefits under 80G of Income Tax Act • Secure payment via Razorpay" />
                        </div>
                        <div>
                            <Label>Preset Donation Amounts (comma-separated)</Label>
                            <Input {...register("donate_amounts")} placeholder="500,1000,2000,5000,10000" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* TESTIMONIALS */}
            <TabsContent value="testimonials">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Testimonials (3 slots)</CardTitle>
                        <SaveBtn keys={testimonialKeys} />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                <p className="font-medium text-sm text-slate-700">Section Copy</p>
                                <div>
                                    <Label className="text-xs">Eyebrow Text</Label>
                                    <Input {...register("testimonials_eyebrow")} placeholder="Testimonials" />
                                </div>
                                <div>
                                    <Label className="text-xs">Section Heading</Label>
                                    <Input {...register("testimonials_heading")} placeholder="What People Say" />
                                </div>
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <p className="font-medium text-sm text-slate-700">Testimonial {i}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Name</Label>
                                            <Input {...register(`testimonial${i}_name`)} placeholder="Full Name" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Designation</Label>
                                            <Input {...register(`testimonial${i}_designation`)} placeholder="Volunteer, Donor..." />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Quote</Label>
                                        <Textarea {...register(`testimonial${i}_quote`)} rows={2} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Photo URL (optional)</Label>
                                        <Input {...register(`testimonial${i}_image`)} placeholder="/photos/person.jpg" />
                                        <CloudinaryUploadButton
                                            buttonText={`Upload Testimonial ${i} Photo`}
                                            className="mt-2"
                                            disabled={isSaving}
                                            onUploaded={(url) => {
                                                setValue(`testimonial${i}_image`, url, { shouldDirty: true });
                                                toast.success(`Testimonial ${i} photo uploaded.`);
                                            }}
                                            onError={() => toast.error(`Failed to upload testimonial ${i} photo.`)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* SECTION HEADINGS */}
            <TabsContent value="sections">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Section Headings</CardTitle>
                        <SaveBtn keys={sectionHeadingKeys} />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: "team", label: "Team Section" },
                                { key: "blog", label: "Blog Section" },
                                { key: "gallery", label: "Gallery Section" },
                            ].map(({ key, label }) => (
                                <div key={key} className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <p className="font-medium text-sm text-slate-700">{label}</p>
                                    <div>
                                        <Label className="text-xs">Heading</Label>
                                        <Input {...register(`${key}_section_heading`)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Subtext</Label>
                                        <Input {...register(`${key}_section_subtext`)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
