const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PAY402 contracts to Base...\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "wei\n");

  // Base Mainnet USDC address
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
  console.log("📦 USDC Address:", USDC_ADDRESS, "\n");

  // Deploy PAY402 Token
  console.log("1️⃣ Deploying PAY402 Token...");
  const PAY402Token = await hre.ethers.getContractFactory("PAY402Token");
  const pay402Token = await PAY402Token.deploy();
  await pay402Token.waitForDeployment();
  const pay402TokenAddress = await pay402Token.getAddress();
  console.log("✅ PAY402 Token deployed to:", pay402TokenAddress, "\n");

  // Deploy X402 Facilitator
  console.log("2️⃣ Deploying X402 Facilitator...");
  const X402Facilitator = await hre.ethers.getContractFactory("X402Facilitator");
  const facilitator = await X402Facilitator.deploy(pay402TokenAddress, USDC_ADDRESS);
  await facilitator.waitForDeployment();
  const facilitatorAddress = await facilitator.getAddress();
  console.log("✅ X402 Facilitator deployed to:", facilitatorAddress, "\n");

  // Set facilitator as trusted minter
  console.log("3️⃣ Setting Facilitator as trusted minter...");
  const tx = await pay402Token.setTrustedMinter(facilitatorAddress);
  await tx.wait();
  console.log("✅ Trusted minter set!\n");

  // Verify contracts
  console.log("📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("PAY402 Token:        ", pay402TokenAddress);
  console.log("X402 Facilitator:    ", facilitatorAddress);
  console.log("USDC Token:          ", USDC_ADDRESS);
  console.log("Deployer:            ", deployer.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get token stats
  const maxSupply = await pay402Token.MAX_SUPPLY();
  const tokensPerUSDC = await pay402Token.TOKENS_PER_USDC();
  const totalSupply = await pay402Token.totalSupply();
  
  console.log("📊 Token Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Max Supply:          ", hre.ethers.formatEther(maxSupply), "PAY402");
  console.log("Initial Supply:      ", hre.ethers.formatEther(totalSupply), "PAY402");
  console.log("Price:                1 USDC =", hre.ethers.formatEther(tokensPerUSDC), "PAY402");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✨ Deployment complete!");
  console.log("\n📝 Save these addresses to your .env file:");
  console.log(`PAY402_TOKEN_ADDRESS=${pay402TokenAddress}`);
  console.log(`FACILITATOR_ADDRESS=${facilitatorAddress}`);
  console.log(`USDC_ADDRESS=${USDC_ADDRESS}`);
  
  console.log("\n🔍 Verify contracts on Basescan:");
  console.log(`npx hardhat verify --network base ${pay402TokenAddress}`);
  console.log(`npx hardhat verify --network base ${facilitatorAddress} ${pay402TokenAddress} ${USDC_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

