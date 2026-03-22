import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "Events",
    description: "Upcoming and past events by Nirashray Foundation.",
};

interface EventType {
    id: string; title: string; slug: string; description: string;
    date: Date; time: string; venue: string; image: string | null;
    isPublished: boolean;
}

export default async function EventsPage() {
    const now = new Date();
    const [upcoming, past]: [EventType[], EventType[]] = await Promise.all([
        prisma.event.findMany({
            where: { isPublished: true, date: { gte: now } },
            orderBy: { date: "asc" },
        }),
        prisma.event.findMany({
            where: { isPublished: true, date: { lt: now } },
            orderBy: { date: "desc" },
            take: 12,
        }),
    ]) as any;

    const EventCard = ({ event, isPast }: { event: EventType; isPast?: boolean }) => (
        <div className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 ${isPast ? "opacity-75" : ""}`}>
            {event.image && (
                <div className="aspect-video relative">
                    <Image src={event.image} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
            )}
            <div className="p-5">
                <h3 className="font-serif font-bold text-slate-900 text-lg mb-2">{event.title}</h3>
                <div className="flex flex-col gap-1.5 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" />{formatDate(event.date)}</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" />{event.time}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" />{event.venue}</span>
                </div>
                <p className="text-slate-600 text-sm line-clamp-3">{event.description}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="font-serif text-4xl font-bold mb-3">Events</h1>
                    <p className="text-blue-200">Join us at our upcoming events and activities</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-10">
                {/* Upcoming */}
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Upcoming Events</h2>
                {upcoming.length === 0 ? (
                    <p className="text-slate-400 text-center py-10 mb-10">No upcoming events at the moment.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
                        {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
                    </div>
                )}

                {/* Past */}
                {past.length > 0 && (
                    <>
                        <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Past Events</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {past.map((event) => <EventCard key={event.id} event={event} isPast />)}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
