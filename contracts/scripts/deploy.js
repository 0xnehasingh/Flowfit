const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("Starting FlowFit deployment on Flow...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    // Deploy FlowFit Token
    console.log("\n1. Deploying FlowFitToken...");
    const FlowFitToken = await ethers.getContractFactory("FlowFitToken");
    const flowFitToken = await FlowFitToken.deploy();
    await flowFitToken.deployed();
    console.log("FlowFitToken deployed to:", flowFitToken.address);
    
    // Deploy Achievement NFT
    console.log("\n2. Deploying AchievementNFT...");
    const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
    const baseMetadataURI = "https://api.flowfit.io/metadata"; // Replace with actual metadata URI
    const achievementNFT = await AchievementNFT.deploy(baseMetadataURI);
    await achievementNFT.deployed();
    console.log("AchievementNFT deployed to:", achievementNFT.address);
    
    // Deploy Fitness Challenge
    console.log("\n3. Deploying FitnessChallenge...");
    const FitnessChallenge = await ethers.getContractFactory("FitnessChallenge");
    const fitnessChallenge = await FitnessChallenge.deploy(flowFitToken.address);
    await fitnessChallenge.deployed();
    console.log("FitnessChallenge deployed to:", fitnessChallenge.address);
    
    // Set up permissions
    console.log("\n4. Setting up permissions...");
    
    // Authorize FitnessChallenge contract to mint tokens
    console.log("Authorizing FitnessChallenge to mint tokens...");
    await flowFitToken.setMinterAuthorization(fitnessChallenge.address, true);
    
    // Set FitnessChallenge as sponsored contract for gasless transactions
    console.log("Setting up sponsored transactions...");
    await flowFitToken.setSponsoredContract(fitnessChallenge.address, true);
    
    // Authorize FitnessChallenge to update achievement progress
    console.log("Authorizing FitnessChallenge to update achievements...");
    await achievementNFT.setAuthorizedUpdater(fitnessChallenge.address, true);
    
    // Add sample partner for token redemption
    console.log("\n5. Adding sample partners...");
    await flowFitToken.updatePartner(
        "gym_chain_001",
        deployer.address, // Replace with actual gym partner address
        100, // 100 tokens per gym visit
        true,
        "gym"
    );
    
    await flowFitToken.updatePartner(
        "supplement_store_001",
        deployer.address, // Replace with actual store address
        50, // 50 tokens per supplement purchase
        true,
        "nutrition"
    );
    
    // Verify deployment
    console.log("\n6. Deployment Summary:");
    console.log("======================");
    console.log("FlowFitToken:", flowFitToken.address);
    console.log("AchievementNFT:", achievementNFT.address);
    console.log("FitnessChallenge:", fitnessChallenge.address);
    console.log("Deployer:", deployer.address);
    
    // Save contract addresses for frontend
    const addresses = {
        FlowFitToken: flowFitToken.address,
        AchievementNFT: achievementNFT.address,
        FitnessChallenge: fitnessChallenge.address,
        deployer: deployer.address,
        network: await ethers.provider.getNetwork()
    };
    
    const fs = require('fs');
    const path = require('path');
    
    // Create contracts directory in frontend if it doesn't exist
    const contractsDir = path.join(__dirname, '../../frontend/src/contracts');
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }
    
    // Write addresses to file
    fs.writeFileSync(
        path.join(contractsDir, 'addresses.json'),
        JSON.stringify(addresses, null, 2)
    );
    
    console.log("\nContract addresses saved to frontend/src/contracts/addresses.json");
    console.log("\n🎉 FlowFit deployment completed successfully!");
    
    // Test initial functionality
    console.log("\n7. Testing basic functionality...");
    
    // Test token initial supply
    const totalSupply = await flowFitToken.totalSupply();
    console.log("Initial token supply:", ethers.utils.formatEther(totalSupply), "FFT");
    
    // Test challenge creation
    const challengeCounter = await fitnessChallenge.challengeCounter();
    console.log("Initial challenges created:", challengeCounter.toString());
    
    // Test achievement creation
    const achievementCounter = await achievementNFT.achievementCounter();
    console.log("Initial achievements created:", achievementCounter.toString());
    
    console.log("\n✅ All systems operational!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    }); 