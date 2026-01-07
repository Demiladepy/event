// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VeriFiMarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    IERC721 public ticketContract;
    mapping(uint256 => Listing) public listings;
    
    uint256 public platformFee = 250; // 2.5% in basis points
    address public feeRecipient;
    
    event TicketListed(uint256 indexed ticketId, address indexed seller, uint256 price);
    event TicketSold(uint256 indexed ticketId, address indexed buyer, uint256 price, uint256 royalty);
    event ListingCancelled(uint256 indexed ticketId);
    
    constructor(address _ticketContract) {
        ticketContract = IERC721(_ticketContract);
        feeRecipient = msg.sender;
    }
    
    function listTicket(uint256 _ticketId, uint256 _price) external {
        require(ticketContract.ownerOf(_ticketId) == msg.sender, "Not owner");
        require(ticketContract.getApproved(_ticketId) == address(this) || ticketContract.isApprovedForAll(msg.sender, address(this)), "Not approved");
        
        listings[_ticketId] = Listing({
            seller: msg.sender,
            price: _price,
            active: true
        });
        
        emit TicketListed(_ticketId, msg.sender, _price);
    }
    
    function buyTicket(uint256 _ticketId) external payable nonReentrant {
        Listing memory listing = listings[_ticketId];
        require(listing.active, "Not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        
        listings[_ticketId].active = false;
        
        // Calculate royalty using EIP-2981
        // Note: The cast to ERC2981 checks the interface but in a real app we should use IERC2981 and checks.
        // Assuming VeriFiTicket implements it (it does).
        (address royaltyRecipient, uint256 royaltyAmount) = IERC2981(address(ticketContract)).royaltyInfo(_ticketId, listing.price);
        
        // Calculate platform fee
        uint256 platformFeeAmount = (listing.price * platformFee) / 10000;
        
        // Calculate seller proceeds
        uint256 sellerProceeds = listing.price - royaltyAmount - platformFeeAmount;
        
        // Transfer funds
        if (royaltyAmount > 0) {
            payable(royaltyRecipient).transfer(royaltyAmount);
        }
        if (platformFeeAmount > 0) {
            payable(feeRecipient).transfer(platformFeeAmount);
        }
        payable(listing.seller).transfer(sellerProceeds);
        
        // Transfer NFT
        ticketContract.safeTransferFrom(listing.seller, msg.sender, _ticketId);
        
        emit TicketSold(_ticketId, msg.sender, listing.price, royaltyAmount);
    }
    
    function cancelListing(uint256 _ticketId) external {
        require(listings[_ticketId].seller == msg.sender, "Not seller");
        listings[_ticketId].active = false;
        emit ListingCancelled(_ticketId);
    }
}
