// Reference1: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC20/ERC20.test.js
// Reference2: https://github.com/OpenZeppelin/openzeppelin-test-helpers

// Import utilities
const { expect } = require('chai');
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

// Load compiled artifacts
const MyToken = artifacts.require('MyToken');

// Start test block
contract('MyToken', function (accounts) {
  const [ initialHolder, recipient, anotherAccount ] = accounts;

  const NAME = 'MyToken';
  const SYMBOL = 'TEST';
  const TOTAL_SUPPLY = new BN('10000000000000000000000');

  beforeEach(async function () {
    this.token = await MyToken.new(NAME, SYMBOL, TOTAL_SUPPLY, {from: initialHolder});
  });

  it('has a name', async function () {
    expect(await this.token.name()).to.be.equal(NAME);
  });

  it('has a symbol', async function () {
    expect(await this.token.symbol()).to.be.equal(SYMBOL);
  });

  it('has 18 decimals', async function () {
    expect(await this.token.decimals()).to.be.bignumber.equal('18');
  });

  it('has 10000 tokens', async function () {
    expect(await this.token.totalSupply()).to.be.bignumber.equal(TOTAL_SUPPLY);
  });

  it('assigns the initial total supply to the initialHolder', async function () {
    expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(TOTAL_SUPPLY);
  });

  describe('_transfer', function () {
    const amount = new BN(5000000);

    beforeEach(async function () {
      this.receipt = await this.token.transfer(recipient, amount);
    });

    describe('when transfer executed normally', function () {
      it('recipient\'s balances increases by the amount', async function () {
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
      });
      it('emits a Transfer event', async function () {
        expectEvent(this.receipt, 'Transfer', {
          from: initialHolder,
          to: recipient,
          value: amount,
        });
      });
    });
    describe('when the sender is the zero address', function () {
      it('reverts', async function () {
        await expectRevert(this.token.transferFrom(ZERO_ADDRESS, recipient, amount),
          'ERC20: transfer from the zero address',
        );
      });
    });
    describe('when the recipient is the zero address', function () {
      it('reverts', async function () {
        await expectRevert(this.token.transfer(ZERO_ADDRESS, amount),
          'ERC20: transfer to the zero address',
        );
      });
    });
  });
});