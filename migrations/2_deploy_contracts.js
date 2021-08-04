const MyToken = artifacts.require("./MyToken.sol");
const MyNFT = artifacts.require("./MyNFT.sol");
const MyTrade = artifacts.require("./MyTrade.sol");

module.exports = async function (deployer) {
  await deployer.deploy(MyToken, 'MyToken', 'TEST', '1000000' + '0'.repeat(18))
      .then(async function() {
        await deployer.deploy(MyNFT, 'MyNFT', 'NFT')
          .then(async function() {
            await deployer.deploy(MyTrade, MyToken.address, MyNFT.address);
    });
  });
};
