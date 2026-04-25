const { ethers } = require("hardhat");

async function main() {
  const [owner, patient, doctor] = await ethers.getSigners();

  const registry = await ethers.getContractAt(
    "PatientRegistry",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );

  const access = await ethers.getContractAt(
    "AccessControl",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );

  console.log("\n=== TEST START ===\n");

  // 🟢 1. REGISTER PATIENT (POST request equivalent)
  console.log("1. Register Patient");
  const hash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));

  const tx1 = await registry.connect(patient).registerPatient(hash);
  await tx1.wait();
  console.log("✔ Patient registered\n");

  // 🟢 2. CHECK PATIENT (GET request equivalent)
  console.log("2. Check Patient Registration");
  const isRegistered = await registry.isPatientRegistered(patient.address);
  console.log("Result:", isRegistered, "\n");

  // 🟢 3. GRANT ACCESS (POST request equivalent)
  console.log("3. Grant Doctor Access");
  const tx2 = await access.connect(patient).grantAccess(doctor.address);
  await tx2.wait();
  console.log("✔ Access granted\n");

  // 🟢 4. CHECK ACCESS (GET request equivalent)
  console.log("4. Check Access");
  const hasAccess = await access.hasAccess(patient.address, doctor.address);
  console.log("Doctor has access:", hasAccess, "\n");

  console.log("=== TEST COMPLETE ===");
}

main().catch(console.error);