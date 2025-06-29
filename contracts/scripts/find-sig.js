// scripts/find-sig.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
	const address = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

	// get the deployed contract
	const contract = await hre.ethers.getContractAt("Signatures", address);

	// fetch all MessageSigned events
	const filter = contract.filters.MessageSigned();
	const logs = await contract.queryFilter(filter);

	console.log(
		logs.map((l) => ({
			signer: l.args.signer,
			message: l.args.message,
			txHash: l.transactionHash,
			blockNumber: l.blockNumber,
		}))
	);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
