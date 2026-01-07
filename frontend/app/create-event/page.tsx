'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { VeriFiTicketABI, VERIFI_TICKET_ADDRESS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
    const router = useRouter();
    const { data: hash, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash
    });

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        supply: '',
        date: '',
        royalty: '10' // 10%
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // In a real app we'd upload image/metadata to IPFS here
        // const metadataURI = await uploadToIPFS(...)
        const metadataURI = "ipfs://QmMockMetadata";

        const dateBigInt = BigInt(Math.floor(new Date(formData.date).getTime() / 1000));

        try {
            writeContract({
                address: VERIFI_TICKET_ADDRESS as `0x${string}`,
                abi: VeriFiTicketABI,
                functionName: 'createEvent',
                args: [
                    formData.name,
                    BigInt(formData.supply),
                    parseEther(formData.price),
                    dateBigInt,
                    metadataURI,
                    BigInt(Number(formData.royalty) * 100) // Convert % to BPS
                ]
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl p-8">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Create New Event
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 p-8 rounded-xl border border-gray-800">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Event Name</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Ticket Price (ETH)</label>
                        <input
                            type="number"
                            step="0.001"
                            required
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Total Supply</label>
                        <input
                            type="number"
                            required
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.supply}
                            onChange={(e) => setFormData({ ...formData, supply: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Event Date</label>
                        <input
                            type="datetime-local"
                            required
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                            // Note: date input color hack might be needed for browser
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Resale Royalty (%)</label>
                        <input
                            type="number"
                            max="100"
                            required
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.royalty}
                            onChange={(e) => setFormData({ ...formData, royalty: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isConfirming}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50"
                >
                    {isConfirming ? 'Creating Event...' : 'Launch Event'}
                </button>

                {isSuccess && (
                    <div className="p-4 bg-green-900/20 border border-green-800 rounded text-green-400 text-center">
                        Event created successfully!
                    </div>
                )}
            </form>
        </div>
    );
}
