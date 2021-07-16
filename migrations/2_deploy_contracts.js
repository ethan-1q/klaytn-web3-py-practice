const TestToken = artifacts.require("./TestToken.sol");
const TestNFT = artifacts.require("./TestNFT.sol");

module.exports = function (deployer) {
  deployer.deploy(TestToken);
  deployer.deploy(TestNFT);
};
