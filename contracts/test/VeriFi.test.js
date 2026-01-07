const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VeriFi Protocol", function () {
    let ticketContract, marketplaceContract, badgeContract, verifierContract;
    let owner, organizer, buyer, otherAccount;

    beforeEach(async function () {
        [owner, organizer, buyer, otherAccount] = await ethers.getSigners();

        const VeriFiTicket = await ethers.getContractFactory("VeriFiTicket");
        ticketContract = await VeriFiTicket.deploy();

        const VeriFiMarketplace = await ethers.getContractFactory("VeriFiMarketplace");
        marketplaceContract = await VeriFiMarketplace.deploy(await ticketContract.getAddress());

        const AttendanceBadge = await ethers.getContractFactory("AttendanceBadge");
        badgeContract = await AttendanceBadge.deploy(await ticketContract.getAddress());

        const MockIVerifier = await ethers.getContractFactory("MockIVerifier");
        const mockVerifier = await MockIVerifier.deploy();

        const PrivacyVerifier = await ethers.getContractFactory("PrivacyVerifier");
        verifierContract = await PrivacyVerifier.deploy(await mockVerifier.getAddress());
    });

    it("Should create event and mint ticket", async function () {
        const eventName = "Test Event";
        const price = ethers.parseEther("0.1");
        const totalSupply = 100;

        await ticketContract.connect(organizer).createEvent(
            eventName,
            totalSupply,
            price,
            Math.floor(Date.now() / 1000) + 86400,
            "ipfs://metadata",
            1000 // 10% royalty
        );

        // Buyer mints with dummy commitment
        const commitment = ethers.keccak256(ethers.toUtf8Bytes("secret"));

        await expect(ticketContract.connect(buyer).mintTicket(0, commitment, { value: price }))
            .to.emit(ticketContract, "TicketMinted")
            .withArgs(0, 0, buyer.address);

        expect(await ticketContract.ownerOf(0)).to.equal(buyer.address);
    });
});
