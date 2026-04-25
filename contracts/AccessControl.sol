// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PatientRegistry.sol";

contract AccessControl {

    PatientRegistry private registry;

    // patient => provider => hasAccess
    mapping(address => mapping(address => bool)) private accessMap;

    event AccessGranted(address indexed patient, 
                        address indexed provider, 
                        uint256 timestamp);
    event AccessRevoked(address indexed patient, 
                        address indexed provider, 
                        uint256 timestamp);

    constructor(address _registryAddress) {
        registry = PatientRegistry(_registryAddress);
    }

    modifier onlyRegisteredPatient() {
        require(
            registry.isPatientRegistered(msg.sender),
            'Not a registered patient'
        );
        _;
    }

    function grantAccess(address _provider) 
        external onlyRegisteredPatient {
        require(_provider != msg.sender, 
                'Cannot grant to self');
        require(!accessMap[msg.sender][_provider], 
                'Already granted');
        accessMap[msg.sender][_provider] = true;
        emit AccessGranted(msg.sender, _provider, 
                           block.timestamp);
    }

    function revokeAccess(address _provider) 
        external onlyRegisteredPatient {
        require(accessMap[msg.sender][_provider], 
                'No access to revoke');
        accessMap[msg.sender][_provider] = false;
        emit AccessRevoked(msg.sender, _provider, 
                           block.timestamp);
    }

    function hasAccess(address _patient, address _provider) 
        external view returns (bool) {
        return accessMap[_patient][_provider];
    }
}
