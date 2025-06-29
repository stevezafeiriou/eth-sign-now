const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signatures (owner-only)", function () {
	let signatures, owner, addr1;

	beforeEach(async () => {
		[owner, addr1] = await ethers.getSigners();
		const Factory = await ethers.getContractFactory("Signatures");
		signatures = await Factory.deploy();
		await signatures.deployed();
	});

	it("owner can store a valid signed message", async () => {
		const message = "Hello, owner!";
		const signature = await owner.signMessage(message);

		await expect(signatures.storeSignedMessage(message, signature))
			.to.emit(signatures, "MessageSigned")
			.withArgs(owner.address, message);
	});

	it("reverts if owner supplies a bad signature", async () => {
		const message = "Tamper me";
		const badSig = await owner.signMessage("Not the same message");

		await expect(
			signatures.storeSignedMessage(message, badSig)
		).to.be.revertedWith("Invalid signature");
	});

	it("non-owner cannot store even valid signatures", async () => {
		const message = "Hello, owner!";
		const signature = await owner.signMessage(message);

		// simply assert it reverts
		await expect(
			signatures.connect(addr1).storeSignedMessage(message, signature)
		).to.be.reverted;
	});

	it("recoverSigner returns correct address", async () => {
		const msg = "Test recover";
		const sig = await owner.signMessage(msg);
		expect(await signatures.recoverSigner(msg, sig)).to.equal(owner.address);
	});

	it("verify() works", async () => {
		const msg = "Verify test";
		const sig = await owner.signMessage(msg);
		expect(await signatures.verify(msg, sig, owner.address)).to.be.true;
		expect(await signatures.verify(msg, sig, addr1.address)).to.be.false;
	});
});
