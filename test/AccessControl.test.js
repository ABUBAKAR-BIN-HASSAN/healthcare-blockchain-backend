const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControl", function () {
  let patientRegistry;
  let accessControl;
  let owner;
  let patient;
  let provider;

  beforeEach(async function () {
    [owner, patient, provider] = await ethers.getSigners();
    
    const PatientRegistry = await ethers.getContractFactory("PatientRegistry");
    patientRegistry = await PatientRegistry.deploy();
    const registryAddr = await patientRegistry.getAddress();
    
    const AccessControl = await ethers.getContractFactory("AccessControl");
    accessControl = await AccessControl.deploy(registryAddr);
  });

  it("should grant access to a provider", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(patient).registerPatient(patientIdHash);
    
    await accessControl.connect(patient).grantAccess(provider.address);
    expect(await accessControl.hasAccess(patient.address, provider.address)).to.equal(true);
  });

  it("should reject grant from unregistered patient", async function () {
    await expect(
      accessControl.connect(patient).grantAccess(provider.address)
    ).to.be.revertedWith("Not a registered patient");
  });

  it("should prevent granting access twice", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(patient).registerPatient(patientIdHash);
    
    await accessControl.connect(patient).grantAccess(provider.address);
    await expect(
      accessControl.connect(patient).grantAccess(provider.address)
    ).to.be.revertedWith("Already granted");
  });

  it("should prevent granting access to self", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(patient).registerPatient(patientIdHash);
    
    await expect(
      accessControl.connect(patient).grantAccess(patient.address)
    ).to.be.revertedWith("Cannot grant to self");
  });

  it("should revoke access from a provider", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(patient).registerPatient(patientIdHash);
    
    await accessControl.connect(patient).grantAccess(provider.address);
    await accessControl.connect(patient).revokeAccess(provider.address);
    expect(await accessControl.hasAccess(patient.address, provider.address)).to.equal(false);
  });

  it("should reject revoke if access was never granted", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(patient).registerPatient(patientIdHash);
    
    await expect(
      accessControl.connect(patient).revokeAccess(provider.address)
    ).to.be.revertedWith("No access to revoke");
  });
});
