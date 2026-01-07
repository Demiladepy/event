const snarkjs = require("snarkjs");
const { poseidon } = require("circomlibjs");

async function verifyTicketProof(verificationKey, publicSignals, proof) {
    const res = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);
    return res;
}

module.exports = { verifyTicketProof };
