'use client';

import { useReadContract } from 'wagmi';
import { VeriFiTicketABI, VERIFI_TICKET_ADDRESS } from '@/lib/constants';
import Link from 'next/link';
import { formatEther } from 'viem';

// A simple component to fetch and display ALL events by iterating IDs.
// In prod we'd use a subgraph.
// Helper wrapper to fetch a single event
function EventCard({ eventId }: { eventId: number }) {
  const { data: eventData } = useReadContract({
    address: VERIFI_TICKET_ADDRESS as `0x${string}`,
    abi: VeriFiTicketABI,
    functionName: 'events',
    args: [BigInt(eventId)]
  }) as { data: any }; // Type assertion for simplicity

  if (!eventData || eventData[0] === "") return null; // Assume name empty = not existent

  return (
    <Link href={`/events/${eventId}`} className="block group">
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
          {/* Placeholder for event image */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-4xl font-bold opacity-20">
            EVENT
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors uppercase tracking-wide">
            {eventData[0]}
          </h3>
          <div className="flex justify-between items-center text-gray-400 text-sm">
            <span>{new Date(Number(eventData[3]) * 1000).toLocaleDateString()}</span>
            <span className="text-white font-medium bg-white/10 px-2 py-1 rounded">
              {formatEther(eventData[2])} ETH
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  // Hack: display first 10 events
  const eventIds = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-20 space-y-6">
        <div className="inline-block p-2 px-4 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-sm font-medium mb-4">
          ✨ Next-Generation Ticketing
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-white via-purple-200 to-gray-400 bg-clip-text text-transparent">
          VERIFI
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          The first ticketing platform with zero-knowledge privacy, automated royalties, and soulbound reputation.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Link href="/create-event" className="text-purple-400 hover:text-purple-300">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventIds.map(id => (
            <EventCard key={id} eventId={id} />
          ))}
        </div>
      </section>
    </div>
  );
}
