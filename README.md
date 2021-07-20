# 클레이튼 web3.py 연습

## 세팅
#### Python 3.9.5
```shell
pip install -r requirements.txt
```
#### Node.js 14.17.3
```shell
npm install github:barrysteyn/node-scrypt#fb60a8d3c158fe115a624b5ffa7480f3a24b03fb
npm install
ln -s node_modules/truffle/build/cli.bundled.js truffle
```
#### 컨트랙트 배포
```shell
./truffle deploy --network baobab --reset
```

## 실행
### 컨트랙트 확인
```shell
python main.py
```
### 토큰 전송
```shell
python main.py send_token
```

## npm 및 truffle 구성 방법
#### npm
```shell
npm init
npm install @openzeppelin/contracts
npm install github:barrysteyn/node-scrypt#fb60a8d3c158fe115a624b5ffa7480f3a24b03fb
npm install truffle
ln -s node_modules/truffle/build/cli.bundled.js truffle
npm install caver.js
npm install truffle-hdwallet-provider-klaytn
npm audit fix
```
#### truffle
```shell
./truffle init
```
contracts/MyToken.sol
```solidity
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "TEST") {
        _mint(msg.sender, 1e24);
    }
}
```
migrations/2_deploy_contracts.sol
```js
const MyToken = artifacts.require("./MyToken.sol");

module.exports = function (deployer) {
  deployer.deploy(MyToken);
};

```
truffle-config.js
```js
const HDWalletProvider = require("truffle-hdwallet-provider-klaytn");
const privateKey = "0x...";

module.exports = {
  networks: {
    baobab: {
      // provider: () => new HDWalletProvider(privateKey, "https://api.baobab.klaytn.net:8651/"),
      provider: () => new HDWalletProvider(privateKey, "http://chainnet-en-pg001.dakao.io:8551/"),
      network_id: "1001", // Baobab 네트워크 id
      gas: '8500000',
      gasPrice: null
    },
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 9545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
  },

  compilers: {
    solc: {
      version: "0.8.6"
    }
  }
};
```
