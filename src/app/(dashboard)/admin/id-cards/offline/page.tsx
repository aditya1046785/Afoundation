import { Metadata } from "next";
import OfflineIDCardGenerator from "@/components/dashboard/OfflineIDCardGenerator";

export const metadata: Metadata = {
    title: "Offline ID Card Generator | Admin Dashboard",
};

export default function OfflineIDCardGeneratorPage() {
    return <OfflineIDCardGenerator />;
}
