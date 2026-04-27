import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { WhatsAppFloatButton } from "@/components/public/WhatsAppFloatButton";
import { getAllSiteSettings } from "@/lib/site-settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    const settings = await getAllSiteSettings();

    return (
        <div className="flex flex-col min-h-screen">
            <AnnouncementBar />
            <Navbar settings={settings} />
            <main className="flex-1">{children}</main>
            <Footer settings={settings} />
            <WhatsAppFloatButton />
        </div>
    );
}
