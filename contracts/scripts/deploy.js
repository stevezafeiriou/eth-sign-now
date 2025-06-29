const hre = require("hardhat");

async function main() {
	console.log("Deploying Signatures contract.");
	const Signatures = await hre.ethers.getContractFactory("Signatures");
	const signatures = await Signatures.deploy();
	await signatures.deployed();
	console.log("[SUCCESS] Signatures deployed to:", signatures.address);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
