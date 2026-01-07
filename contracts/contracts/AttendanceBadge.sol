// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AttendanceBadge is ERC721 {
    uint256 public badgeCounter;
    
    mapping(uint256 => uint256) public badgeToEvent; // badgeId => eventId
    mapping(address => uint256[]) public userBadges;
    
    address public ticketContract;
    
    event BadgeMinted(uint256 indexed badgeId, address indexed attendee, uint256 indexed eventId);
    
    constructor(address _ticketContract) ERC721("VeriFi Attendance Badge", "VAB") {
        ticketContract = _ticketContract;
    }
    
    function mintBadge(address _attendee, uint256 _eventId) external {
        require(msg.sender == ticketContract, "Only ticket contract");
        
        uint256 badgeId = badgeCounter++;
        badgeToEvent[badgeId] = _eventId;
        userBadges[_attendee].push(badgeId);
        
        _safeMint(_attendee, badgeId);
        
        emit BadgeMinted(badgeId, _attendee, _eventId);
    }
    
    function getUserBadges(address _user) external view returns (uint256[] memory) {
        return userBadges[_user];
    }
    
    // SOULBOUND: Prevent transfers
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        // If from is 0, it is a mint (allowed).
        // If from is not 0, it is a transfer (not allowed).
        if (from != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }
}
