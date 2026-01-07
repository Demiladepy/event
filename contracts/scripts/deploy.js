const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Ticket Contract
    const VeriFiTicket = await hre.ethers.getContractFactory("VeriFiTicket");
    const ticket = await VeriFiTicket.deploy();
    await ticket.waitForDeployment();
    const ticketAddress = await ticket.getAddress();
    console.log("VeriFiTicket deployed to:", ticketAddress);

    // 2. Deploy Marketplace
    const VeriFiMarketplace = await hre.ethers.getContractFactory("VeriFiMarketplace");
    const marketplace = await VeriFiMarketplace.deploy(ticketAddress);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("VeriFiMarketplace deployed to:", marketplaceAddress);

    // 3. Deploy Badge Contract
    const AttendanceBadge = await hre.ethers.getContractFactory("AttendanceBadge");
    const badge = await AttendanceBadge.deploy(ticketAddress);
    await badge.waitForDeployment();
    const badgeAddress = await badge.getAddress();
    console.log("AttendanceBadge deployed to:", badgeAddress);

    // 4. Deploy Privacy Verifier (Mock/Real)
    // Check if we have a real verifier, otherwise deploy mock for demo
    let verifierAddress;
    try {
        // Try to deploy real verifier if generated
        // const Verifier = await hre.ethers.getContractFactory("Verifier"); 
        // const v = await Verifier.deploy();
        // await v.waitForDeployment();
        // verifierAddress = await v.getAddress();
        throw new Error("No real verifier generated yet");
    } catch (e) {
        console.log("Deploying Mock Verifier for testing...");
        const MockIVerifier = await hre.ethers.getContractFactory("MockIVerifier");
        const mock = await MockIVerifier.deploy();
        await mock.waitForDeployment();
        const mockAddress = await mock.getAddress();

        const PrivacyVerifier = await hre.ethers.getContractFactory("PrivacyVerifier");
        const privacy = await PrivacyVerifier.deploy(mockAddress);
        await privacy.waitForDeployment();
        verifierAddress = await privacy.getAddress();
    }
    console.log("PrivacyVerifier deployed to:", verifierAddress);

    // 5. Update Frontend Constants
    const constantsPath = path.join(__dirname, "../../frontend/lib/constants.ts");
    let constantsContent = fs.readFileSync(constantsPath, "utf8");

    constantsContent = constantsContent.replace(/export const VERIFI_TICKET_ADDRESS = ".*";/, `export const VERIFI_TICKET_ADDRESS = "${ticketAddress}";`);
    constantsContent = constantsContent.replace(/export const VERIFI_MARKETPLACE_ADDRESS = ".*";/, `export const VERIFI_MARKETPLACE_ADDRESS = "${marketplaceAddress}";`);
    constantsContent = constantsContent.replace(/export const ATTENDANCE_BADGE_ADDRESS = ".*";/, `export const ATTENDANCE_BADGE_ADDRESS = "${badgeAddress}";`);
    constantsContent = constantsContent.replace(/export const PRIVACY_VERIFIER_ADDRESS = ".*";/, `export const PRIVACY_VERIFIER_ADDRESS = "${verifierAddress}";`);

    fs.writeFileSync(constantsPath, constantsContent);
    console.log("Frontend constants updated!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
