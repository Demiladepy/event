'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VeriFiMarketplaceABI, VERIFI_MARKETPLACE_ADDRESS, VeriFiTicketABI, VERIFI_TICKET_ADDRESS } from '@/lib/constants'; // Need to add Marketplace ABI to constants
import { formatEther, parseEther } from 'viem';

// Add Marketplace ABI to constants first (I will do this in a separate write if needed, or inline here for brevity)
const MARKETPLACE_ABI = [
    "function listTicket(uint256 _ticketId, uint256 _price) external",
    "function buyTicket(uint256 _ticketId) external payable",
    "function listings(uint256) view returns (address seller, uint256 price, bool active)",
    "event TicketListed(uint256 indexed ticketId, address indexed seller, uint256 price)"
];

function ListingCard({ ticketId }: { ticketId: number }) {
    const { data: listing } = useReadContract({
        address: VERIFI_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'listings',
        args: [BigInt(ticketId)]
    }) as { data: any };

    const { data: ticketURI } = useReadContract({
        address: VERIFI_TICKET_ADDRESS as `0x${string}`,
        abi: VeriFiTicketABI,
        functionName: 'tokenURI',
        args: [BigInt(ticketId)]
    });

    const { writeContract, data: hash } = useWriteContract();
    const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

    if (!listing || !listing[2]) return null; // Not active

    const handleBuy = () => {
        writeContract({
            address: VERIFI_MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'buyTicket',
            args: [BigInt(ticketId)],
            value: listing[1]
        });
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-pink-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-xl">Ticket #{ticketId}</h3>
                    <p className="text-gray-500 text-xs truncate w-32">Seller: {listing[0]}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{formatEther(listing[1])} ETH</p>
                </div>
            </div>

            <button
                onClick={handleBuy}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg font-bold hover:shadow-lg disabled:opacity-50"
            >
                {isLoading ? 'Purchasing...' : 'Buy Now'}
            </button>
            {isSuccess && <p className="text-green-500 text-center mt-2">Purchased!</p>}
        </div>
    );
}

export default function MarketplacePage() {
    // Brute force check first 20 tickets for listings
    const ids = Array.from({ length: 20 }, (_, i) => i);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Secondary Market
            </h1>
            <p className="text-gray-400 mb-8">Securely trade tickets with automated royalties for creators.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ids.map(id => (
                    <ListingCard key={id} ticketId={id} />
                ))}
            </div>
        </div>
    );
}
