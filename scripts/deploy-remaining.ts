import { ethers } from "hardhat";

// Already deployed contract addresses
const DEPLOYED = {
  identityRegistry: "0xf09B249652A5032d1C9A39fa20E50578403f13e7",
  reputationRegistry: "0xEeCCE3D98977736A8296a69A1996D1C2eaF6E6Dd",
};

// USDC token addresses on different networks
const USDC_ADDRESSES: { [key: string]: string } = {
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  baseMainnet: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// Helper function to wait for confirmations
async function waitForConfirmations(tx: any, confirmations: number = 3) {
  console.log(`   Waiting for ${confirmations} confirmations...`);
  await tx.deploymentTransaction()?.wait(confirmations);
  console.log(`   ✓ Confirmed`);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName =
    network.name === "baseMainnet" || network.chainId === 8453n
      ? "baseMainnet"
      : network.name === "baseSepolia" || network.chainId === 84532n
      ? "baseSepolia"
      : "unknown";

  console.log("Deploying remaining contracts with account:", deployer.address);
  console.log("Network:", networkName, `(Chain ID: ${network.chainId})`);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  // Get USDC address for the network
  const usdcAddress = USDC_ADDRESSES[networkName];
  if (!usdcAddress) {
    throw new Error(`USDC address not configured for network: ${networkName}`);
  }

  console.log("\nUsing already deployed contracts:");
  console.log("IdentityRegistry:   ", DEPLOYED.identityRegistry);
  console.log("ReputationRegistry: ", DEPLOYED.reputationRegistry);
  console.log("USDC:               ", usdcAddress);

  // Deploy ValidationRegistry
  console.log("\n1. Deploying ValidationRegistry...");
  const ValidationRegistry = await ethers.getContractFactory(
    "ValidationRegistry"
  );
  const validationRegistry = await ValidationRegistry.deploy(
    DEPLOYED.identityRegistry
  );
  await validationRegistry.waitForDeployment();
  const validationAddress = await validationRegistry.getAddress();
  console.log("   ✓ ValidationRegistry deployed to:", validationAddress);
  await waitForConfirmations(validationRegistry, 3);

  // Deploy AgentBazaar (Marketplace)
  console.log("\n2. Deploying AgentBazaar...");
  const AgentBazaar = await ethers.getContractFactory("AgentBazaar");
  const agentBazaar = await AgentBazaar.deploy(
    DEPLOYED.identityRegistry,
    DEPLOYED.reputationRegistry,
    validationAddress,
    usdcAddress
  );
  await agentBazaar.waitForDeployment();
  const bazaarAddress = await agentBazaar.getAddress();
  console.log("   ✓ AgentBazaar deployed to:", bazaarAddress);
  await waitForConfirmations(agentBazaar, 3);

  // Summary
  console.log("\n========================================");
  console.log("Complete Deployment Summary");
  console.log("========================================");
  console.log("Network:", networkName);
  console.log("IdentityRegistry:   ", DEPLOYED.identityRegistry);
  console.log("ReputationRegistry: ", DEPLOYED.reputationRegistry);
  console.log("ValidationRegistry: ", validationAddress);
  console.log("AgentBazaar:        ", bazaarAddress);
  console.log("USDC:               ", usdcAddress);
  console.log("========================================");

  // Verification instructions
  if (networkName !== "unknown") {
    console.log("\n========================================");
    console.log("Verification Commands");
    console.log("========================================");
    console.log(
      `npx hardhat verify --network ${networkName} ${DEPLOYED.identityRegistry}`
    );
    console.log(
      `npx hardhat verify --network ${networkName} ${DEPLOYED.reputationRegistry} ${DEPLOYED.identityRegistry}`
    );
    console.log(
      `npx hardhat verify --network ${networkName} ${validationAddress} ${DEPLOYED.identityRegistry}`
    );
    console.log(
      `npx hardhat verify --network ${networkName} ${bazaarAddress} ${DEPLOYED.identityRegistry} ${DEPLOYED.reputationRegistry} ${validationAddress} ${usdcAddress}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
