import { Metadata } from "next";
import { CMSAboutEditor } from "@/components/dashboard/cms/CMSAboutEditor";

export const metadata: Metadata = { title: "Edit About Page | Admin CMS" };

export default function CMSAboutPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <CMSAboutEditor />
        </div>
    );
}
