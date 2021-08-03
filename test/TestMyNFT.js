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

  describe('When first deploy', function () {
    it('has 0 tokens', async function () {
      expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(new BN('0'));
      expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(new BN('0'));
    });
  });

  describe('_mint', function () {
    beforeEach(async function () {
      await this.token.mintFromContent(owner, 'test data');
    });

    describe('When 1 item is minted', function () {
      it('has 1 tokens', async function () {
        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(new BN('1'));
      });
    });

    describe('When duplicated item is minted', function () {
      it('reverts', async function () {
        await expectRevert(this.token.mintFromContent(owner, 'test data'),
            'ERC721: token already minted');
      });
    });
  });

  describe('_transfer', function () {
    beforeEach(async function () {
      await this.token.mintFromContent(owner, 'test data1');
      await this.token.mintFromContent(owner, 'test data2');
    });

    describe('before transfer', function () {
      it('has 2 tokens for owner', async function () {
        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(new BN('2'));
      });

      it('has no token for recipient', async function () {
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(new BN('0'));
      });
    });

    describe('after transfer', function () {
      beforeEach(async function () {
        const nftId = await this.token.getTokenIdFromContent('test data1');
        this.receipt = await this.token.safeTransferFrom(owner, recipient, nftId);
      });

      it('remains 1 token to owner', async function () {
        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(new BN('1'));
      });

      it('gives 1 token to recipient', async function () {
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(new BN('1'));
      });

      it('emits a Transfer event', async function () {
        const tokenId = await this.token.getTokenIdFromContent('test data1');
        await expectEvent(this.receipt, 'Transfer', {from: owner, to: recipient, tokenId: tokenId});
      });
    });
  });

  describe('_burn', function () {
    beforeEach(async function () {
      await this.token.mintFromContent(owner, 'test data1');
      await this.token.mintFromContent(owner, 'test data2');
    });

    describe('before burn', function () {
      it('has 2 tokens for owner', async function () {
        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(new BN('2'));
      });
    });

    describe('after burn', function () {
      beforeEach(async function () {
        this.receipt = await this.token.burnFromContent('test data1');
      });

      it('remains 1 token to owner', async function () {
        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(new BN('1'));
      });

      it('emits a Transfer event', async function () {
        const tokenId = await this.token.getTokenIdFromContent('test data1');
        await expectEvent(this.receipt, 'Transfer', {from: owner, to: ZERO_ADDRESS, tokenId: tokenId});
      });
    });
  });
});