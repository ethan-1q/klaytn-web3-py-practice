// Import utilities
const { expect } = require('chai');
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const ethers = require('ethers');
const { ZERO_ADDRESS } = constants;
const { toWei } = web3.utils;

// Load compiled artifacts
const MyTrade = artifacts.require('MyTrade');
const MyToken = artifacts.require('MyToken');
const MyNFT = artifacts.require('MyNFT');

// Start test block
contract('MyTrade', function (accounts) {
  const [ token_owner, nft_owner, exchanger, seller, buyer ] = accounts;

  const TOKEN_NAME = 'MyToken';
  const TOKEN_SYMBOL = 'TEST';
  const TOKEN_TOTAL_SUPPLY = new BN(toWei('10000', 'ether'));
  const NFT_NAME = 'MyNFT';
  const NFT_SYMBOL = 'NFT';

  const nftContent = 'test data';

  beforeEach(async function () {
    this.token = await MyToken.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_TOTAL_SUPPLY, {from: token_owner});
    this.nft = await MyNFT.new(NFT_NAME, NFT_SYMBOL, {from: nft_owner});
    this.trade = await MyTrade.new(this.token.address, this.nft.address, {from: exchanger});

    // seller의 nft 발행
    await this.nft.mintFromContent(seller, nftContent, {from: nft_owner});

    // 거래를 위한 최초 토큰 지급
    await this.token.transfer(buyer, new BN(toWei('5', 'ether')), {from: token_owner});
  });

  describe('When open the first trade', function () {
    it('emits a TradeStatusChange event (Open)', async function () {
      const nftId = await this.nft.getTokenIdFromContent(nftContent);
      await this.nft.approve(this.trade.address, nftId, {from: seller});
      const receipt = await this.trade.openTrade(nftContent, this.trade.address, {from: seller});
      await expectEvent(receipt, 'TradeStatusChange', {
        tradeId: new BN('0'),
        status: ethers.utils.formatBytes32String('Open')
      });
    });
  });

  describe('Given opened trade', function () {
    beforeEach(async function () {
      const nftId = await this.nft.getTokenIdFromContent(nftContent);
      await this.nft.approve(this.trade.address, nftId, {from: seller});
      await this.trade.openTrade(nftContent, this.trade.address, {from: seller});
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

    describe('When trade is not executed yet', function () {
      it('Buyer\'s balance is 5 MyToken', async function () {
        expect(await this.token.balanceOf(buyer)).to.be.bignumber.equal(new BN(toWei('5', 'ether')));
      });
      it('Seller\'s balance is 0 MyToken', async function () {
        expect(await this.token.balanceOf(seller)).to.be.bignumber.equal(new BN('0'));
      });
      it('Buyer has 0 nft', async function () {
        expect(await this.nft.balanceOf(buyer)).to.be.bignumber.equal(new BN('0'));
      });
      it('Market has 1 nft', async function () {
        expect(await this.nft.balanceOf(this.trade.address)).to.be.bignumber.equal(new BN('1'));
      });
    });

    describe('When trade is executed at 1 MyToken', function () {
      beforeEach(async function () {
        await this.token.approve(this.trade.address, new BN(toWei('1', 'ether')), {from: buyer});
        await this.token.approve(this.trade.address, new BN(toWei('1', 'ether')), {from: exchanger});
        this.receipt = await this.trade.executeTrade(
            nftContent, new BN(toWei('1', 'ether')), buyer, seller, new BN('1'), new BN('1'), {from: exchanger}
        );
      });

      it('emits a TradeStatusChange event (Executed)', async function () {
        await expectEvent(this.receipt, 'TradeStatusChange', {
          tradeId: new BN('0'),
          status: ethers.utils.formatBytes32String('Executed')
        });
      });

      it('Buyer\'s balance is 4 MyToken', async function () {
        expect(await this.token.balanceOf(buyer)).to.be.bignumber.equal(new BN(toWei('4', 'ether')));
      });
      it('Seller\'s balance is greater than 0 MyToken and less than 1 MyToken', async function () {
        expect(await this.token.balanceOf(seller)).to.be.bignumber.greaterThan(new BN('0'));
        expect(await this.token.balanceOf(seller)).to.be.bignumber.lessThan(new BN(toWei('1', 'ether')));
      });
      it('Buyer has 1 nft', async function () {
        expect(await this.nft.balanceOf(buyer)).to.be.bignumber.equal(new BN('1'));
      });
      it('Market has 0 nft', async function () {
        expect(await this.nft.balanceOf(this.trade.address)).to.be.bignumber.equal(new BN('0'));
      });
    });
  });
});