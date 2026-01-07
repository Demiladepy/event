const snarkjs = require("snarkjs");
const { poseidon } = require("circomlibjs"); // Ensure this is installed where scripts run

async function generateTicketProof(ticketId, secret, eventId, commitment) {
    // Calculate nullifier locally to return it
    // Note: poseidon accepts array of bigints/strings
    const nullifier = poseidon([secret, eventId]);

    const input = {
        ticketId: ticketId,
        secret: secret,
        eventId: eventId,
        commitment: commitment,
        nullifier: nullifier
    };

    // Paths need to be correct relative to execution
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "circuits/ticketOwnership.wasm",
        "circuits/ticketOwnership_final.zkey"
    );

    // Format for Solidity call
    // SnarkJS returns string inputs usually
    const solidityProof = {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
        c: [proof.pi_c[0], proof.pi_c[1]],
        input: publicSignals
    };

    return { solidityProof, nullifier: poseidon.F.toString(nullifier) };
}

module.exports = { generateTicketProof };
