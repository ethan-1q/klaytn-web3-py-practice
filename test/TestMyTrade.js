// Reference1: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC721/ERC721.test.js
// Reference2: https://github.com/OpenZeppelin/openzeppelin-test-helpers

// Import utilities
const { expect } = require('chai');
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

// Load compiled artifacts
const MyTrade = artifacts.require('MyTrade');

// Start test block
contract('MyTrade', function (accounts) {
  const [ owner, recipient, anotherAccount ] = accounts;

  beforeEach(async function () {
    this.token = await MyTrade.new({from: owner});
  });
});