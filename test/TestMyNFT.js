// Reference1: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC721/ERC721.test.js
// Reference2: https://github.com/OpenZeppelin/openzeppelin-test-helpers

// Import utilities
const { expect } = require('chai');
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

// Load compiled artifacts
const MyNFT = artifacts.require('MyNFT');

// Start test block
contract('MyNFT', function (accounts) {
  const [ owner, recipient, anotherAccount ] = accounts;

  const NAME = 'MyNFT';
  const SYMBOL = 'NFT';

  beforeEach(async function () {
    this.token = await MyNFT.new(NAME, SYMBOL, {from: owner});
  });

  it('has a name', async function () {
    expect(await this.token.name()).to.be.equal(NAME);
  });

  it('has a symbol', async function () {
    expect(await this.token.symbol()).to.be.equal(SYMBOL);
  });

  describe('when first deploy', function () {
    it('has 0 tokens', async function () {
      expect(await this.token.totalSupply()).to.be.bignumber.equal(new BN('0'));
    });
  });

  describe('when 1 item minted', function () {
    beforeEach(async function () {
      await this.token.mintNFT('first NFT', owner);
    });

    it('has 1 tokens', async function () {
      expect(await this.token.totalSupply()).to.be.bignumber.equal(new BN('1'));
    });
  });

  describe('_transfer', function () {
    beforeEach(async function () {
      await this.token.mintNFT('first NFT', owner);
      await this.token.mintNFT('second NFT', owner);
    });

    describe('before transfer', function () {
      it('has no token for recipient', async function () {
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(new BN('0'));
      });
    });

    describe('after transfer', function () {
      const tokenId = new BN('0');
      beforeEach(async function () {
        this.receipt = await this.token.transferFrom(owner, recipient, tokenId);
      });

      it('gives 1 token to recipient', async function () {
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(new BN('1'));
      });

      it('emits a Transfer event', async function () {
        expectEvent(this.receipt, 'Transfer', { from: owner, to: recipient, tokenId: tokenId });
      });
    });
  });
});