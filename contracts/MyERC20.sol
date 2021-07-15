// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract GLDToken is ERC20 {
    constructor() ERC20("TestToken", "TEST") {
        _mint(msg.sender, 1e24);
    }
}