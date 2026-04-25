const { ethers, network } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Deploy PatientRegistry
  const PatientRegistry = await ethers.getContractFactory("PatientRegistry");
  const registry = await PatientRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("PatientRegistry deployed to:", registryAddr);

  // Deploy AccessControl
  const AccessControl = await ethers.getContractFactory("AccessControl");
  const access = await AccessControl.deploy(registryAddr);
  await access.waitForDeployment();
  const accessAddr = await access.getAddress();
  console.log("AccessControl deployed to:", accessAddr);

  const deployment = {
    PatientRegistry: registryAddr,
    AccessControl: accessAddr,
    network: network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
  console.log("Saved to deployment.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
