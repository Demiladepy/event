'use client';

import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import QRCode from 'react-qr-code';
import { VERIFI_MARKETPLACE_ADDRESS, VERIFI_TICKET_ADDRESS, PRIVACY_VERIFIER_ADDRESS, PrivacyVerifierABI } from '@/lib/constants';

// Helper to load snarkjs dynamically only on client
async function generateProof(ticketId: string, secret: string, eventId: string) {
    // @ts-ignore
    // const snarkjs = await import('snarkjs');
    console.log("Mocking snarkjs for build debug");
    const proof = { pi_a: ["0", "0"], pi_b: [["0", "0"], ["0", "0"]], pi_c: ["0", "0"] };
    const publicSignals = ["0", "0"];
    return { proof, publicSignals };
    /*
    const input = {
        ticketId: ticketId,
        secret: secret,
        eventId: eventId,
    };
    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            "/zk/ticketOwnership.wasm",
            "/zk/ticketOwnership_final.zkey"
        );
        return { proof, publicSignals };
    } catch (e) {
        console.error("ZK Proof failed", e);
        throw e;
    }
    */
}

export function ZKProofGenerator({ ticketId, eventId, commitment }: { ticketId: string, eventId: string, commitment: string }) {
    const [generating, setGenerating] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [proofData, setProofData] = useState<any>(null);
    const { writeContract } = useWriteContract();

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const secret = localStorage.getItem(`ticket_${ticketId}_secret`) || "0";
            const res = await generateProof(ticketId, secret, eventId);
            setProofData({ ...res, eventId, commitment });
            return res;
        } catch (e) {
            alert('Proof generation failed (Check console for WASM/ZKEY errors)');
            throw e;
        } finally {
            setGenerating(false);
        }
    };

    const handleAnonymousCheckIn = async () => {
        let currentProof = proofData;
        if (!currentProof) {
            try {
                currentProof = await handleGenerate();
            } catch { return; }
        }

        const { proof, publicSignals } = currentProof;
        const nullifier = publicSignals[1];
        const solidityProof = {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
            c: [proof.pi_c[0], proof.pi_c[1]],
        };

        try {
            await writeContract({
                address: PRIVACY_VERIFIER_ADDRESS as `0x${string}`,
                abi: PrivacyVerifierABI,
                functionName: 'verifyTicketOwnership',
                args: [
                    solidityProof.a,
                    solidityProof.b,
                    solidityProof.c,
                    commitment as `0x${string}`,
                    `0x${BigInt(nullifier).toString(16)}` as `0x${string}`,
                    BigInt(eventId)
                ]
            });
            alert('Check-in tx sent!');
        } catch (e) {
            console.error(e);
            alert('Transaction failed');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button
                    onClick={handleAnonymousCheckIn}
                    disabled={generating}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                    {generating ? 'Generating...' : 'Self Check-In'}
                </button>
                <button
                    onClick={() => setShowQR(!showQR)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                >
                    {showQR ? 'Hide QR' : 'Show QR'}
                </button>
            </div>

            {showQR && (
                <div className="p-4 bg-white rounded-lg flex flex-col items-center">
                    {proofData ? (
                        <>
                            <QRCode value={JSON.stringify(proofData)} size={200} />
                            <p className="text-black text-xs mt-2 text-center font-mono">
                                Scan at Verification Gate
                            </p>
                        </>
                    ) : (
                        <div className="text-gray-500 text-sm text-center py-4">
                            <p className="mb-2">Generate proof to display QR</p>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="px-3 py-1 bg-black text-white rounded text-xs"
                            >
                                {generating ? 'Generating...' : 'Generate Proof'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
