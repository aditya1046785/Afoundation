import { Metadata } from "next";
import { getAllSiteSettings } from "@/lib/site-settings";
import { CMSGeneralEditor } from "@/components/dashboard/cms/CMSGeneralEditor";

export const metadata: Metadata = { title: "General Settings | CMS" };

export default async function CMSGeneralPage() {
    const settings = await getAllSiteSettings();
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">General Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Core website information, contact details, and social links.</p>
            </div>
            <CMSGeneralEditor settings={settings} />
        </div>
    );
}
