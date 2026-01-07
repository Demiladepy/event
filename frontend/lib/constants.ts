export const VERIFI_TICKET_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const VERIFI_MARKETPLACE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const ATTENDANCE_BADGE_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const PRIVACY_VERIFIER_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const VeriFiTicketABI = [
    "function createEvent(string _name, uint256 _totalSupply, uint256 _price, uint256 _eventDate, string _metadataURI, uint96 _royaltyBps) external returns (uint256)",
    "function mintTicket(uint256 _eventId, bytes32 _commitment) external payable returns (uint256)",
    "function events(uint256) view returns (string name, uint256 totalSupply, uint256 price, uint256 eventDate, address organizer, string metadataURI, bool active)",
    "event EventCreated(uint256 indexed eventId, address indexed organizer)",
    "function eventCounter() view returns (uint256)",
    "function tokenURI(uint256) view returns (string)",
    "function tickets(uint256) view returns (uint256 eventId, bool hasAttended, uint256 attendanceTimestamp, uint8 tier)",
    "function ownerOf(uint256) view returns (address)"
];

export const VeriFiMarketplaceABI = [
    "function listTicket(uint256 _ticketId, uint256 _price) external",
    "function buyTicket(uint256 _ticketId) external payable",
    "function listings(uint256) view returns (address seller, uint256 price, bool active)",
    "event TicketListed(uint256 indexed ticketId, address indexed seller, uint256 price)",
    "function cancelListing(uint256 _ticketId) external"
];

export const PrivacyVerifierABI = [
    {
        "inputs": [
            { "internalType": "uint256[2]", "name": "a", "type": "uint256[2]" },
            { "internalType": "uint256[2][2]", "name": "b", "type": "uint256[2][2]" },
            { "internalType": "uint256[2]", "name": "c", "type": "uint256[2]" },
            { "internalType": "bytes32", "name": "commitment", "type": "bytes32" },
            { "internalType": "bytes32", "name": "nullifier", "type": "bytes32" },
            { "internalType": "uint256", "name": "eventId", "type": "uint256" }
        ],
        "name": "verifyTicketOwnership",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
