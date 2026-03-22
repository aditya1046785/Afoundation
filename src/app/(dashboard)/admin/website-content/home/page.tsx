import { Metadata } from "next";
import { getAllSiteSettings } from "@/lib/site-settings";
import { CMSHomeEditor } from "@/components/dashboard/cms/CMSHomeEditor";

export const metadata: Metadata = { title: "Home Page Content | CMS" };

export default async function CMSHomePage() {
    const settings = await getAllSiteSettings();
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">Home Page Content</h1>
                <p className="text-slate-500 text-sm mt-1">Edit all homepage sections. Changes are live immediately.</p>
            </div>
            <CMSHomeEditor settings={settings} />
        </div>
    );
}
