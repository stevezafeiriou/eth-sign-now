// src/hooks/useEthereum.js
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import SignatureJson from "../contracts/Signatures.json";

const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export function useEthereum() {
	const [account, setAccount] = useState(null);
	const [owner, setOwner] = useState(null);
	const [readContract, setReadContract] = useState(null);
	const [writeContract, setWriteContract] = useState(null);
	const [events, setEvents] = useState([]);
	const [open, setOpen] = useState(false);

	// 1️⃣ Read‑only contract
	useEffect(() => {
		const provider = new ethers.providers.JsonRpcProvider(RPC_URL, 31337);
		const ctr = new ethers.Contract(
			CONTRACT_ADDRESS,
			SignatureJson.abi,
			provider
		);
		setReadContract(ctr);
	}, []);

	// 2️⃣ Fetch owner + historical & live events + open flag
	useEffect(() => {
		if (!readContract) return;

		// fetch owner() with try/catch
		(async () => {
			try {
				const onChainOwner = await readContract.owner();
				setOwner(onChainOwner.toLowerCase());
			} catch (err) {
				console.warn("useEthereum: owner() call failed", err);
				setOwner(null);
			}

			// fetch existing MessageSigned events
			const filter = readContract.filters.MessageSigned();
			try {
				const logs = await readContract.queryFilter(filter);
				const evts = logs.map((l) => ({
					messageId: l.args.messageId.toString(),
					signer: l.args.signer,
					message: l.args.message,
					signature: l.args.signature,
					txHash: l.transactionHash,
					blockNumber: l.blockNumber,
				}));
				setEvents(evts);
			} catch (err) {
				console.warn("useEthereum: queryFilter failed", err);
			}

			// fetch open() with try/catch
			try {
				const isOpen = await readContract.open();
				setOpen(isOpen);
			} catch (err) {
				console.warn("useEthereum: open() call failed", err);
				setOpen(false);
			}

			// subscribe to new MessageSigned
			const listener = (messageIdBN, signer, message, signature, event) => {
				const idStr = messageIdBN.toString();
				setEvents((curr) => {
					if (curr.some((e) => e.txHash === event.transactionHash)) return curr;
					return [
						...curr,
						{
							messageId: idStr,
							signer,
							message,
							signature,
							txHash: event.transactionHash,
							blockNumber: event.blockNumber,
						},
					];
				});
			};
			readContract.on(filter, listener);

			// subscribe to OpenToggled
			const toggleListener = (newOpen) => setOpen(newOpen);
			readContract.on("OpenToggled", toggleListener);

			return () => {
				readContract.off(filter, listener);
				readContract.off("OpenToggled", toggleListener);
			};
		})();
	}, [readContract]);

	// 3️⃣ Connect & write
	const connect = useCallback(async () => {
		if (!window.ethereum) return alert("Install MetaMask");
		await window.ethereum.request({ method: "eth_requestAccounts" });
		const web3Prov = new ethers.providers.Web3Provider(window.ethereum);
		const signer = web3Prov.getSigner();
		const addr = (await signer.getAddress()).toLowerCase();
		setAccount(addr);
		setWriteContract(readContract.connect(signer));
	}, [readContract]);

	const toggleOpen = useCallback(() => {
		if (!writeContract)
			return Promise.reject(new Error("Wallet not connected"));
		return writeContract.setOpen(!open);
	}, [writeContract, open]);

	// 4️⃣ Handle account changes
	useEffect(() => {
		if (!window.ethereum) return;
		const handler = (accs) => setAccount(accs[0]?.toLowerCase() || null);
		window.ethereum.on("accountsChanged", handler);
		return () => window.ethereum.removeListener("accountsChanged", handler);
	}, []);

	// 5️⃣ Disconnect
	const disconnect = useCallback(() => {
		setAccount(null);
		setWriteContract(null);
	}, []);

	return {
		account,
		owner,
		readContract,
		writeContract,
		events,
		open,
		toggleOpen,
		connect,
		disconnect,
	};
}
