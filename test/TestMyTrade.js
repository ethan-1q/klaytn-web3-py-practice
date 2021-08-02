// Import utilities
const { expect } = require('chai');
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const ethers = require('ethers')
const { ZERO_ADDRESS } = constants;

// Load compiled artifacts
const MyTrade = artifacts.require('MyTrade');
const MyToken = artifacts.require('MyToken');
const MyNFT = artifacts.require('MyNFT');

// Start test block
contract('MyTrade', function (accounts) {
  const [ owner, seller, buyer ] = accounts;

  const TOKEN_NAME = 'MyToken';
  const TOKEN_SYMBOL = 'TEST';
  const TOKEN_TOTAL_SUPPLY = new BN('10000000000000000000000');
  const NFT_NAME = 'MyNFT';
  const NFT_SYMBOL = 'NFT';

  beforeEach(async function () {
    this.token = await MyToken.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_TOTAL_SUPPLY, {from: owner});
    this.nft = await MyNFT.new(NFT_NAME, NFT_SYMBOL, {from: owner});
    this.trade = await MyTrade.new(this.token.address, this.nft.address, {from: owner});

    await this.nft.mintFromData(seller, 'test data');
    const nftId = await this.nft.getTokenIdFromData('test data');
    await this.nft.approve(this.trade.address, nftId, {from: seller});
  });

  describe('When open the first trade', function () {
    it('emits a TradeStatusChange event', async function () {
      const receipt = await this.trade.openTrade('test data', this.trade.address, {from: seller});
      await expectEvent(receipt, 'TradeStatusChange', {
        tradeId: new BN('0'),
        status: ethers.utils.formatBytes32String('Open')
      });
    });
  });
});