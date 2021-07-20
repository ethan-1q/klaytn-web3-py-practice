// SPDX-License-Identifier: UNLICENSED
// https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-solidity

pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MyToken.sol";

// All test contracts must start with Test
contract TestMyToken {

    // all test functions must start with test
    function testMyToken() public {
        string memory name = 'testname';
        string memory symbol = 'testsymbol';
        uint initialSupply = 1e24;

        MyToken mt = new MyToken(name, 'test', initialSupply);

        // https://github.com/trufflesuite/truffle/blob/develop/packages/resolver/solidity/Assert.sol
        Assert.equal(mt.name(), name, "name test");
        Assert.notEqual(mt.symbol(), symbol, "symbol test");
        Assert.equal(mt.totalSupply(), initialSupply, "initialSupply test");
    }
}