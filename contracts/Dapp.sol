//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Dapp {
    address immutable owner;

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function depositAmount() public payable {}

    function withdrawAmount(uint _amount, address _address) public {
        payable(_address).transfer(_amount);
    }
}
