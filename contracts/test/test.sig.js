const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signatures (full functionality)", function () {
	let signatures;
	let owner, addr1, addr2;

	beforeEach(async function () {
		[owner, addr1, addr2] = await ethers.getSigners();
		const Factory = await ethers.getContractFactory("Signatures");
		signatures = await Factory.deploy();
		await signatures.deployed();
	});

	describe("Open toggling & storing", function () {
		it("defaults to closed", async function () {
			expect(await signatures.open()).to.be.false;
		});

		it("owner can toggle open", async function () {
			await expect(signatures.connect(owner).setOpen(true))
				.to.emit(signatures, "OpenToggled")
				.withArgs(true);
			expect(await signatures.open()).to.be.true;
		});

		it("non-owner cannot toggle", async function () {
			await expect(signatures.connect(addr1).setOpen(true)).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});

		it("owner can store when closed", async function () {
			const msg = "Owner msg";
			const sig = await owner.signMessage(msg);
			await expect(signatures.storeSignedMessage(msg, sig))
				.to.emit(signatures, "MessageSigned")
				.withArgs(0, owner.address, msg, sig);
		});

		it("non-owner cannot store when closed", async function () {
			const msg = "No store";
			const sig = await addr1.signMessage(msg);
			await expect(
				signatures.connect(addr1).storeSignedMessage(msg, sig)
			).to.be.revertedWith("Store: disabled");
		});

		it("non-owner can store when open", async function () {
			await signatures.connect(owner).setOpen(true);
			const msg = "Allowed msg";
			const sig = await addr1.signMessage(msg);
			await expect(signatures.connect(addr1).storeSignedMessage(msg, sig))
				.to.emit(signatures, "MessageSigned")
				.withArgs(0, addr1.address, msg, sig);
		});
	});

	describe("Signature helpers", function () {
		it("recoverSigner returns correct address", async function () {
			const msg = "Recover me";
			const sig = await owner.signMessage(msg);
			expect(await signatures.recoverSigner(msg, sig)).to.equal(owner.address);
		});

		it("verify() works", async function () {
			const msg = "Verify me";
			const sig = await owner.signMessage(msg);
			expect(await signatures.verify(msg, sig, owner.address)).to.be.true;
			expect(await signatures.verify(msg, sig, addr1.address)).to.be.false;
		});
	});

	describe("Voting", function () {
		let messageId;

		beforeEach(async function () {
			const message = "Vote message";
			const sig = await owner.signMessage(message);
			const tx = await signatures.storeSignedMessage(message, sig);
			const receipt = await tx.wait();
			messageId = receipt.events.find((e) => e.event === "MessageSigned").args
				.messageId;
		});

		it("allows an upvote and records forVotes", async function () {
			const weight = await ethers.provider.getBalance(addr1.address);
			await expect(signatures.connect(addr1).vote(messageId, true))
				.to.emit(signatures, "Voted")
				.withArgs(messageId, addr1.address, weight, true);
			expect(await signatures.forVotes(messageId)).to.equal(weight);
		});

		it("allows a downvote and records againstVotes", async function () {
			const weight = await ethers.provider.getBalance(addr2.address);
			await expect(signatures.connect(addr2).vote(messageId, false))
				.to.emit(signatures, "Voted")
				.withArgs(messageId, addr2.address, weight, false);
			expect(await signatures.againstVotes(messageId)).to.equal(weight);
		});

		it("prevents double voting", async function () {
			await signatures.connect(addr1).vote(messageId, true);
			await expect(
				signatures.connect(addr1).vote(messageId, false)
			).to.be.revertedWith("Already voted");
		});

		it("reverts when voting on invalid messageId", async function () {
			await expect(
				signatures.connect(addr1).vote(999, true)
			).to.be.revertedWith("Invalid messageId");
		});

		it("totalVotes returns sum of for + against", async function () {
			const w1 = await ethers.provider.getBalance(addr1.address);
			const w2 = await ethers.provider.getBalance(addr2.address);

			await signatures.connect(addr1).vote(messageId, true);
			await signatures.connect(addr2).vote(messageId, false);

			expect(await signatures.totalVotes(messageId)).to.equal(w1.add(w2));
		});
	});
});
