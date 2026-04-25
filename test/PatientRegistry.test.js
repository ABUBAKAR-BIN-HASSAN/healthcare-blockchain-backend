const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PatientRegistry", function () {
  let patientRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const PatientRegistry = await ethers.getContractFactory("PatientRegistry");
    patientRegistry = await PatientRegistry.deploy();
  });

  it("should register a new patient", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(addr1).registerPatient(patientIdHash);
    expect(await patientRegistry.isPatientRegistered(addr1.address)).to.equal(true);
  });

  it("should reject duplicate registration", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(addr1).registerPatient(patientIdHash);
    await expect(
      patientRegistry.connect(addr1).registerPatient(patientIdHash)
    ).to.be.revertedWith("Already registered");
  });

  it("should reject zero bytes32 as patientIdHash", async function () {
    const zeroHash = ethers.ZeroHash;
    await expect(
      patientRegistry.connect(addr1).registerPatient(zeroHash)
    ).to.be.revertedWith("Invalid hash");
  });

  it("should add a record and retrieve it", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(addr1).registerPatient(patientIdHash);
    
    const recordCid = "record123";
    await patientRegistry.connect(addr1).addRecord(recordCid);
    
    const records = await patientRegistry.getPatientRecords(addr1.address);
    expect(records[0]).to.equal(recordCid);
  });

  it("should reject record from unregistered address", async function () {
    await expect(
      patientRegistry.connect(addr1).addRecord("somecid")
    ).to.be.revertedWith("Not registered");
  });

  it("should accumulate multiple records", async function () {
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("patient1"));
    await patientRegistry.connect(addr1).registerPatient(patientIdHash);
    
    await patientRegistry.connect(addr1).addRecord("cid1");
    await patientRegistry.connect(addr1).addRecord("cid2");
    
    const records = await patientRegistry.getPatientRecords(addr1.address);
    expect(records.length).to.equal(2);
    expect(records[0]).to.equal("cid1");
    expect(records[1]).to.equal("cid2");
  });

  it("should increment patient count", async function () {
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("p1"));
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes("p2"));
    
    await patientRegistry.connect(addr1).registerPatient(hash1);
    await patientRegistry.connect(addr2).registerPatient(hash2);
    
    expect(await patientRegistry.getPatientCount()).to.equal(2);
  });
});
