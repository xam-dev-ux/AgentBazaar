import { ethers } from "hardhat";

// USDC token addresses on different networks
const USDC_ADDRESSES: { [key: string]: string } = {
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
  baseMainnet: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet USDC
};

// Helper function to wait for confirmations
async function waitForConfirmations(tx: any, confirmations: number = 2) {
  console.log(`   Waiting for ${confirmations} confirmations...`);
  await tx.deploymentTransaction()?.wait(confirmations);
  console.log(`   ✓ Confirmed`);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "baseMainnet" || network.chainId === 8453n
    ? "baseMainnet"
    : network.name === "baseSepolia" || network.chainId === 84532n
    ? "baseSepolia"
    : "unknown";

  console.log("Deploying contracts with account:", deployer.address);
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
  console.log("Using USDC address:", usdcAddress);

  // 1. Deploy IdentityRegistry
  console.log("\n1. Deploying IdentityRegistry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityAddress = await identityRegistry.getAddress();
  console.log("   ✓ IdentityRegistry deployed to:", identityAddress);
  await waitForConfirmations(identityRegistry, 3);

  // 2. Deploy ReputationRegistry
  console.log("\n2. Deploying ReputationRegistry...");
  const ReputationRegistry = await ethers.getContractFactory(
    "ReputationRegistry"
  );
  const reputationRegistry = await ReputationRegistry.deploy(identityAddress);
  await reputationRegistry.waitForDeployment();
  const reputationAddress = await reputationRegistry.getAddress();
  console.log("   ✓ ReputationRegistry deployed to:", reputationAddress);
  await waitForConfirmations(reputationRegistry, 3);

  // 3. Deploy ValidationRegistry
  console.log("\n3. Deploying ValidationRegistry...");
  const ValidationRegistry = await ethers.getContractFactory(
    "ValidationRegistry"
  );
  const validationRegistry = await ValidationRegistry.deploy(identityAddress);
  await validationRegistry.waitForDeployment();
  const validationAddress = await validationRegistry.getAddress();
  console.log("   ✓ ValidationRegistry deployed to:", validationAddress);
  await waitForConfirmations(validationRegistry, 3);

  // 4. Deploy AgentBazaar (Marketplace)
  console.log("\n4. Deploying AgentBazaar...");
  const AgentBazaar = await ethers.getContractFactory("AgentBazaar");
  const agentBazaar = await AgentBazaar.deploy(
    identityAddress,
    reputationAddress,
    validationAddress,
    usdcAddress
  );
  await agentBazaar.waitForDeployment();
  const bazaarAddress = await agentBazaar.getAddress();
  console.log("   ✓ AgentBazaar deployed to:", bazaarAddress);
  await waitForConfirmations(agentBazaar, 3);

  // Summary
  console.log("\n========================================");
  console.log("Deployment Summary");
  console.log("========================================");
  console.log("Network:", networkName);
  console.log("IdentityRegistry:   ", identityAddress);
  console.log("ReputationRegistry: ", reputationAddress);
  console.log("ValidationRegistry: ", validationAddress);
  console.log("AgentBazaar:        ", bazaarAddress);
  console.log("USDC:               ", usdcAddress);
  console.log("========================================");

  // Save deployment addresses
  const deployment = {
    network: networkName,
    chainId: Number(network.chainId),
    contracts: {
      IdentityRegistry: identityAddress,
      ReputationRegistry: reputationAddress,
      ValidationRegistry: validationAddress,
      AgentBazaar: bazaarAddress,
      USDC: usdcAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment info:");
  console.log(JSON.stringify(deployment, null, 2));

  // Verification instructions
  if (networkName !== "unknown") {
    console.log("\n========================================");
    console.log("Verification Commands");
    console.log("========================================");
    console.log(
      `npx hardhat verify --network ${networkName} ${identityAddress}`
    );
    console.log(
      `npx hardhat verify --network ${networkName} ${reputationAddress} ${identityAddress}`
    );
    console.log(
      `npx hardhat verify --network ${networkName} ${validationAddress} ${identityAddress}`
    );
    console.log(
      `npx hardhat verify --network ${networkName} ${bazaarAddress} ${identityAddress} ${reputationAddress} ${validationAddress} ${usdcAddress}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
