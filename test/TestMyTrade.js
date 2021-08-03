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
  const [ token_owner, nft_owner, exchanger, seller, buyer ] = accounts;

  const TOKEN_NAME = 'MyToken';
  const TOKEN_SYMBOL = 'TEST';
  const TOKEN_TOTAL_SUPPLY = new BN('10000000000000000000000');
  const NFT_NAME = 'MyNFT';
  const NFT_SYMBOL = 'NFT';

  const nftContent = 'test data';

  beforeEach(async function () {
    this.token = await MyToken.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_TOTAL_SUPPLY, {from: token_owner});
    this.nft = await MyNFT.new(NFT_NAME, NFT_SYMBOL, {from: nft_owner});
    this.trade = await MyTrade.new(this.token.address, this.nft.address, {from: exchanger});

    await this.nft.mintFromContent(seller, nftContent, {from: nft_owner});
    const nftId = await this.nft.getTokenIdFromContent(nftContent);
    await this.nft.approve(this.trade.address, nftId, {from: seller});

    await this.token.transfer(exchanger, new BN('50000'), {from: token_owner});
    await this.token.transfer(buyer, new BN('50000'), {from: token_owner});
    await this.token.approve(exchanger, new BN('30000'), {from: buyer});
  });

  describe('When open the first trade', function () {
    it('emits a TradeStatusChange event (Open)', async function () {
      const receipt = await this.trade.openTrade(nftContent, {from: seller});
      await expectEvent(receipt, 'TradeStatusChange', {
        tradeId: new BN('0'),
        status: ethers.utils.formatBytes32String('Open')
      });
    });
  });

  describe('Given opened trade', function () {
    beforeEach(async function () {
      await this.trade.openTrade(nftContent, {from: seller});
    });

    describe('When trade is cancelled trade by the poster', function () {
      beforeEach(async function () {
        this.receipt = await this.trade.cancelTrade(nftContent, {from: seller});
      });

      it('emits a TradeStatusChange event (Cancelled)', async function () {
        await expectEvent(this.receipt, 'TradeStatusChange', {
          tradeId: new BN('0'),
          status: ethers.utils.formatBytes32String('Cancelled')
        });
      });
    });

    describe('When trade is cancelled trade by the other', function () {
      it('reverts', async function () {
        await expectRevert(this.trade.cancelTrade(nftContent, {from: buyer}),
          'Trade can only be canceled by the poster');
      });
    });

    // describe('When trade is executed at 10000 token', function () {
    //   beforeEach(async function () {
    //     this.receipt = await this.trade.executeTrade(
    //         nftContent, new BN('10000'), buyer, seller, new BN('1'), new BN('1'), {from: exchanger}
    //     );
    //   });
    //
    //   it('emits a TradeStatusChange event (Executed)', async function () {
    //     await expectEvent(this.receipt, 'TradeStatusChange', {
    //       tradeId: new BN('0'),
    //       status: ethers.utils.formatBytes32String('Executed')
    //     });
    //   });
    // });
  });
});