 //SPDX-License-Identifier: Unlicense
 pragma solidity ^0.8.1;


 contract Whitelist {

     // Max number of whiteslisted addresses allowed
     uint8 public maxWhitelistedAddresses;

     // Create a mapping of whitelisted addresses meaning
     // If it is a whitelisted address, then we will set it to true, if not false 

     mapping(address => bool) public whitelistedAddresses;

     // numWhitelistedAddresses will keep track of the amount of addresses that we have whitelisted
     // we need to keep this number less than X
     uint8 public numAddressesWhitelisted;

     // Setting the max umber of whitelisted addresses 
     // User will set the value X, at deployment 
     constructor(uint8 _maxWhitelistedAddresses){
         maxWhitelistedAddresses = _maxWhitelistedAddresses;
     }


    function addAddressToWhitelist() public {
        // check if user has been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");
        // check to see if num whitelisted is less than the X amount that we want to whitelist
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More addresses can't be added");
        // Add the address which called the function to the whitelistedAddress array 
        whitelistedAddresses[msg.sender] = true;
        // Increase the number of whitelisted spots by 1
        numAddressesWhitelisted += 1; 
    } 

 }