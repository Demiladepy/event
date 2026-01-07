'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
    return (
        <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    VeriFi
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/create-event" className="text-gray-300 hover:text-white transition-colors">
                        Create Event
                    </Link>
                    <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                        Marketplace
                    </Link>
                    <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                        My Tickets
                    </Link>
                    <ConnectButton />
                </div>
            </div>
        </nav>
    );
}
