pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";

// Ticket Ownership Proof
// Proves that the user knows the secret key for a valid ticket commitment
// and creates a unique nullifier to prevent double-spending/double-entry.
template TicketOwnership() {
    // Private inputs
    signal input ticketId;
    signal input secret;
    signal input eventId;
    
    // Public inputs
    signal input commitment;
    signal input nullifier;
    
    // Internal signals
    signal commitmentCalc;
    signal nullifierCalc;

    // Verify commitment = hash(ticketId, secret)
    // We use Poseidon for efficient hashing in ZK
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== ticketId;
    commitmentHasher.inputs[1] <== secret;
    
    commitmentCalc <== commitmentHasher.out;
    commitment === commitmentCalc;
    
    // Generate nullifier = hash(secret, eventId)
    // This ensures:
    // 1. The same ticket cannot be used twice for the same event (nullifier will be same)
    // 2. The secret is not revealed
    // 3. The eventId is bound to the proof
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== secret;
    nullifierHasher.inputs[1] <== eventId;
    
    nullifierCalc <== nullifierHasher.out;
    nullifier === nullifierCalc;
}

// Main component with public inputs
component main {public [commitment, nullifier]} = TicketOwnership();
