const { ethers } = require("hardhat");

async function main(){
    // Contract factory is an abstraction used to deploy new smart contracts so we are
    // instantiating a factory for our whitelist contract 
    const whitelistContract = await ethers.getContractFactory("Whitelist");

    // Deploy the contract 
    const deployedWhitelistContract = await whitelistContract.deploy(10);
    // 10 is the max we want to deploy 

    // Wait for the contract to be finished deploying 
    await deployedWhitelistContract.deployed();

    console.log("Whitelist Contract Address: ", deployedWhitelistContract);
    
}

main().then(() => process.exit(0))
      .catch((error) => {
          console.error(error);
          process.exit(1);
          
      });  