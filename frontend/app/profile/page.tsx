'use client';

import { useAccount, useReadContract } from 'wagmi';
import { VeriFiTicketABI, VERIFI_TICKET_ADDRESS } from '@/lib/constants';
import { ZKProofGenerator } from '@/components/ZKProofGenerator';

// Helper to fetch user tickets
// In reality, this requires an indexer or enumerating `tokenOfOwnerByIndex` if using Enumerable.
// VeriFiTicket inherits ERC721 but not Enumerable in the snippet I wrote. 
// So `tokenOfOwnerByIndex` might NOT exist unless I added it. 
// I used `ERC721` from OpenZeppelin. 
// Standard ERC721 does not have enumeration.
// I can't easily fetch "All tickets of user" efficiently without logs or Enumerable.
// I will assume for the demo that I simply fetch IDs 0 to 20 and check ownership. 
// (Brute force for hackathon demo).

function TicketItem({ ticketId, ownerAddress }: { ticketId: number, ownerAddress: string }) {
    const { data: owner } = useReadContract({
        address: VERIFI_TICKET_ADDRESS as `0x${string}`,
        abi: ["function ownerOf(uint256) view returns (address)"],
        functionName: 'ownerOf',
        args: [BigInt(ticketId)]
    });

    const isOwner = owner === ownerAddress;

    // Also fetch event info for this ticket
    // Requires `tickets(ticketId)` -> returns struct with eventId
    const { data: ticketData } = useReadContract({
        address: VERIFI_TICKET_ADDRESS as `0x${string}`,
        abi: ["function tickets(uint256) view returns (uint256 eventId, bool hasAttended, uint256 attendanceTimestamp, uint8 tier)"],
        functionName: 'tickets',
        args: [BigInt(ticketId)]
    }) as { data: any };

    if (!isOwner || !ticketData) return null;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">Ticket #{ticketId}</h3>
                    <p className="text-sm text-gray-400">Event ID: {ticketData[0].toString()}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${ticketData[1] ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {ticketData[1] ? 'USED' : 'VALID'}
                </div>
            </div>

            <div className="mt-auto">
                {!ticketData[1] && (
                    <ZKProofGenerator
                        ticketId={ticketId.toString()}
                        eventId={ticketData[0].toString()}
                        commitment="0x..." // We need the commitment we made. Assuming local storage in real app.
                    />
                )}
                {ticketData[1] && (
                    <button disabled className="w-full py-2 bg-gray-800 text-gray-500 rounded cursor-not-allowed">
                        Already Checked In
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { address } = useAccount();
    const ids = Array.from({ length: 20 }, (_, i) => i); // check first 20 tickets

    if (!address) return <div className="p-20 text-center">Connect Wallet to view tickets</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ids.map(id => (
                    <TicketItem key={id} ticketId={id} ownerAddress={address} />
                ))}
            </div>
        </div>
    );
}
