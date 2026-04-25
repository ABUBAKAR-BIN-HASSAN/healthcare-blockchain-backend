// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PatientRegistry {

    struct Patient {
        bytes32 patientIdHash;   // keccak256 of off-chain ID
        string[] recordCIDs;     // File name references
        uint256 registeredAt;
        bool isRegistered;
    }

    mapping(address => Patient) private patients;
    address[] private patientAddresses;

    event PatientRegistered(address indexed patientAddress, 
                            bytes32 indexed patientIdHash, 
                            uint256 timestamp);
    event RecordAdded(address indexed patientAddress, 
                      string cid, uint256 timestamp);

    modifier onlyRegistered() {
        require(patients[msg.sender].isRegistered, 'Not registered');
        _;
    }
    modifier notRegistered() {
        require(!patients[msg.sender].isRegistered, 'Already registered');
        _;
    }

    function registerPatient(bytes32 _patientIdHash) 
        external notRegistered {
        require(_patientIdHash != bytes32(0), 'Invalid hash');
        patients[msg.sender] = Patient({
            patientIdHash: _patientIdHash,
            recordCIDs: new string[](0),
            registeredAt: block.timestamp,
            isRegistered: true
        });
        patientAddresses.push(msg.sender);
        emit PatientRegistered(msg.sender, _patientIdHash, 
                               block.timestamp);
    }

    function addRecord(string calldata _cid) 
        external onlyRegistered {
        require(bytes(_cid).length > 0, 'Empty reference');
        patients[msg.sender].recordCIDs.push(_cid);
        emit RecordAdded(msg.sender, _cid, block.timestamp);
    }

    function isPatientRegistered(address _addr) 
        external view returns (bool) {
        return patients[_addr].isRegistered;
    }

    function getPatientRecords(address _addr) 
        external view returns (string[] memory) {
        return patients[_addr].recordCIDs;
    }

    function getPatientCount() 
        external view returns (uint256) {
        return patientAddresses.length;
    }
}
