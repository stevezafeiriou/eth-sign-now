require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// For Etherscan verification
require("@nomiclabs/hardhat-etherscan");

module.exports = {
	defaultNetwork: "localhost",
	networks: {
		localhost: {
			url: "http://127.0.0.1:8545",
			accounts: [process.env.DEPLOYER_PRIVATE_KEY],
			chainId: 31337,
		},
		mainnet: {
			url: process.env.MAINNET_RPC,
			accounts: [process.env.DEPLOYER_PRIVATE_KEY],
			chainId: 1,
		},
	},
	solidity: {
		compilers: [
			{
				version: "0.8.20",
				settings: { optimizer: { enabled: true, runs: 200 } },
			},
		],
	},
	// etherscan: { apiKey: process.env.ETHERSCAN_API_KEY },  // if installed
};
