'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PRIVACY_VERIFIER_ADDRESS } from '@/lib/constants';

// ABI for PrivacyVerifier
const VERIFIER_ABI = [
    {
        inputs: [
            { internalType: "uint256[2]", name: "a", type: "uint256[2]" },
            { internalType: "uint256[2][2]", name: "b", type: "uint256[2][2]" },
            { internalType: "uint256[2]", name: "c", type: "uint256[2]" },
            { internalType: "bytes32", name: "commitment", type: "bytes32" },
            { internalType: "bytes32", name: "nullifier", type: "bytes32" },
            { internalType: "uint256", name: "eventId", type: "uint256" }
        ],
        name: "verifyTicketOwnership",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function"
    }
];

export default function CheckInPage() {
    const [scannedData, setScannedData] = useState<any | null>(null);
    const { writeContract, data: hash } = useWriteContract();
    const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        // Safe check for browser environment
        if (typeof window === 'undefined') return;

        const scanner = new Html5QrcodeScanner('qr-reader', {
            fps: 10,
            qrbox: 250,
            rememberLastUsedCamera: true
        }, false);

        scanner.render(
            (decodedText) => {
                try {
                    const data = JSON.parse(decodedText);
                    if (data.proof && data.publicSignals) {
                        setScannedData(data);
                        scanner.clear();
                    }
                } catch (e) {
                    console.warn("Invalid QR content", decodedText);
                }
            },
            (error) => {
                // console.warn(error); 
            }
        );

        return () => {
            try { scanner.clear(); } catch (e) { }
        };
    }, []);

    const handleVerify = () => {
        if (!scannedData) return;

        const { proof, publicSignals, eventId, commitment } = scannedData;

        // Construct args from proof data
        const a = [proof.pi_a[0], proof.pi_a[1]];
        const b = [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]];
        const c = [proof.pi_c[0], proof.pi_c[1]];
        const nullifier = publicSignals[1];

        writeContract({
            address: PRIVACY_VERIFIER_ADDRESS as `0x${string}`,
            abi: VERIFIER_ABI,
            functionName: 'verifyTicketOwnership',
            args: [
                a, b, c,
                commitment,
                `0x${BigInt(nullifier).toString(16)}`,
                BigInt(eventId)
            ]
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Venue Check-In</h1>

            {!scannedData ? (
                <div className="bg-white p-4 rounded-xl">
                    <div id="qr-reader" className="w-full"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-gray-900 border border-purple-500 rounded-xl p-6 text-center">
                        <div className="text-green-400 text-5xl mb-4">✓</div>
                        <h2 className="text-xl font-bold mb-2">Proof Detected</h2>
                        <p className="text-gray-400 text-sm break-all">Nullifier: {scannedData.publicSignals?.[1]?.substring(0, 20)}...</p>
                    </div>

                    <button
                        onClick={handleVerify}
                        disabled={isLoading}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying on Chain...' : 'Verify Entry'}
                    </button>
                </div>
            )}

            {isSuccess && (
                <div className="mt-8 p-6 bg-green-900/30 border border-green-500 rounded-xl text-center">
                    <h2 className="text-2xl font-bold text-green-400">ACCESS GRANTED</h2>
                    <p className="text-green-200">Attendance recorded on-chain.</p>
                    <button onClick={() => window.location.reload()} className="mt-4 underline">Scan Next</button>
                </div>
            )}

            {isError && (
                <div className="mt-8 p-6 bg-red-900/30 border border-red-500 rounded-xl text-center">
                    <h2 className="text-2xl font-bold text-red-400">ACCESS DENIED</h2>
                    <p className="text-red-200">Proof invalid or already used.</p>
                    <button onClick={() => window.location.reload()} className="mt-4 underline">Try Again</button>
                </div>
            )}
        </div>
    );
}
