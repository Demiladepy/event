// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract VeriFiTicket is ERC721, ERC2981, Ownable {
    struct Event {
        string name;
        uint256 totalSupply;
        uint256 price;
        uint256 eventDate;
        address organizer;
        string metadataURI;
        bool active;
    }
    
    struct Ticket {
        uint256 eventId;
        bool hasAttended;
        uint256 attendanceTimestamp;
        uint8 tier; // 0=standard, 1=VIP after 1 event, 2=Platinum after 5
    }
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => bytes32) public ticketCommitments; // For ZK privacy
    
    uint256 public eventCounter;
    uint256 public ticketCounter;
    
    event EventCreated(uint256 indexed eventId, address indexed organizer);
    event TicketMinted(uint256 indexed ticketId, uint256 indexed eventId, address indexed buyer);
    event AttendanceRecorded(uint256 indexed ticketId, bytes32 nullifier);
    
    constructor() ERC721("VeriFi Ticket", "VFT") Ownable(msg.sender) {}

    function createEvent(
        string memory _name,
        uint256 _totalSupply,
        uint256 _price,
        uint256 _eventDate,
        string memory _metadataURI,
        uint96 _royaltyBps // Basis points (10% = 1000)
    ) external returns (uint256) {
        uint256 eventId = eventCounter++;
        
        events[eventId] = Event({
            name: _name,
            totalSupply: _totalSupply,
            price: _price,
            eventDate: _eventDate,
            organizer: msg.sender,
            metadataURI: _metadataURI,
            active: true
        });
        
        _setTokenRoyalty(eventId, msg.sender, _royaltyBps);
        
        emit EventCreated(eventId, msg.sender);
        return eventId;
    }
    
    function mintTicket(uint256 _eventId, bytes32 _commitment) external payable returns (uint256) {
        Event memory evt = events[_eventId];
        require(evt.active, "Event not active");
        require(msg.value >= evt.price, "Insufficient payment");
        
        uint256 ticketId = ticketCounter++;
        
        tickets[ticketId] = Ticket({
            eventId: _eventId,
            hasAttended: false,
            attendanceTimestamp: 0,
            tier: 0
        });
        
        // Store the user-provided commitment (generated off-chain using Poseidon)
        ticketCommitments[ticketId] = _commitment;
        
        _safeMint(msg.sender, ticketId);
        
        // Transfer payment to organizer
        payable(evt.organizer).transfer(msg.value);
        
        emit TicketMinted(ticketId, _eventId, msg.sender);
        return ticketId;
    }
    
    function recordAttendance(
        uint256 _ticketId,
        bytes32 _nullifier // Prevents double check-ins
    ) external {
        // Spec logic:
        require(ownerOf(_ticketId) == msg.sender || msg.sender == events[tickets[_ticketId].eventId].organizer, "Not authorized");
        require(!tickets[_ticketId].hasAttended, "Already attended");
        
        tickets[_ticketId].hasAttended = true;
        tickets[_ticketId].attendanceTimestamp = block.timestamp;
        
        // Upgrade tier based on total attendance
        tickets[_ticketId].tier = _calculateTier(msg.sender);
        
        emit AttendanceRecorded(_ticketId, _nullifier);
    }
    
    function _calculateTier(address _user) internal view returns (uint8) {
        uint256 attendanceCount = 0;
        for (uint256 i = 0; i < ticketCounter; i++) {
            if (_ownerOf(i) == _user && tickets[i].hasAttended) {
                 attendanceCount++;
            }
        }
        
        if (attendanceCount >= 5) return 2; // Platinum
        if (attendanceCount >= 1) return 1; // VIP
        return 0; // Standard
    }
    
    function tokenURI(uint256 _ticketId) public view override(ERC721, ERC2981) returns (string memory) {
        Ticket memory ticket = tickets[_ticketId];
        Event memory evt = events[ticket.eventId];
        
        // Dynamic metadata based on attendance and tier
        return string(abi.encodePacked(
            evt.metadataURI,
            "?attended=", ticket.hasAttended ? "true" : "false",
            "&tier=", Strings.toString(ticket.tier)
        ));
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
