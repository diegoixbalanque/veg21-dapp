require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // 🧱 Local Hardhat Network
    hardhat: {
      chainId: 31337,
    },

    // 🧪 Celo Baklava (Sepolia) Testnet - Nueva testnet oficial
    "celo-baklava": {
      url: process.env.CELO_BAKLAVA_RPC_URL || "https://baklava-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 62320,
      gasPrice: "auto",
    },

    // 🌍 Celo Mainnet
    "celo-mainnet": {
      url: process.env.CELO_MAINNET_RPC_URL || "https://forno.celo.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42220,
      gasPrice: "auto",
    },
  },

  etherscan: {
    apiKey: {
      celo: process.env.CELOSCAN_API_KEY || "",
      "celo-baklava": process.env.CELOSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "celo-mainnet",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "celo-baklava",
        chainId: 62320,
        urls: {
          apiURL: "https://api-baklava.celoscan.io/api",
          browserURL: "https://baklava.celoscan.io",
        },
      },
    ],
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
