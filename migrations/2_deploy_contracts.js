const MyToken = artifacts.require("./MyToken.sol");
const MyNFT = artifacts.require("./MyNFT.sol");

module.exports = async function (deployer) {
  await deployer.deploy(MyToken, 'MyToken', 'TEST', (1e24).toLocaleString('fullwide', {useGrouping:false}));
  await deployer.deploy(MyNFT);
};
