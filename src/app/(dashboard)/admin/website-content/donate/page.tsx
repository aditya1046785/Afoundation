import { Metadata } from "next";
import { CMSDonateEditor } from "@/components/dashboard/cms/CMSDonateEditor";

export const metadata: Metadata = { title: "Edit Donate Page | Admin CMS" };

export default function CMSDonatePage() {
    return (
        <div className="max-w-4xl mx-auto">
            <CMSDonateEditor />
        </div>
    );
}
