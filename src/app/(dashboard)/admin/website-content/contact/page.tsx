import { Metadata } from "next";
import { CMSContactEditor } from "@/components/dashboard/cms/CMSContactEditor";

export const metadata: Metadata = { title: "Edit Contact Page | Admin CMS" };

export default function CMSContactPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <CMSContactEditor />
        </div>
    );
}
