const HDWalletProvider = require("truffle-hdwallet-provider-klaytn");
const privateKey = "0x19a0e6c99aaef89900278e29af962e35bab66394312e55d891a97d51e781cda0";

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
