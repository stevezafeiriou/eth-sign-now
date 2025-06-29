// src/hooks/useEthereum.js
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import SignatureJson from "../contracts/Signatures.json";

const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export function useEthereum() {
	const [account, setAccount] = useState(null);
	const [owner, setOwner] = useState(null);
	const [readContract, setReadContract] = useState(null);
	const [writeContract, setWriteContract] = useState(null);
	const [events, setEvents] = useState([]);
	const [open, setOpen] = useState(false);

	// 1️⃣ Instantiate read‐only contract
	useEffect(() => {
		const provider = new ethers.providers.JsonRpcProvider(RPC_URL, 31337);
		const ctr = new ethers.Contract(
			CONTRACT_ADDRESS,
			SignatureJson.abi,
			provider
		);
		setReadContract(ctr);
	}, []);

	// 2️⃣ Fetch owner + history + live events (now including signature)
	useEffect(() => {
		if (!readContract) return;

		// fetch owner
		readContract.owner().then((o) => setOwner(o.toLowerCase()));

		const filter = readContract.filters.MessageSigned();

		// historical events
		readContract.queryFilter(filter).then((logs) => {
			const evts = logs.map((l) => ({
				signer: l.args.signer,
				message: l.args.message,
				signature: l.args.signature, // ← now included
				txHash: l.transactionHash,
				blockNumber: l.blockNumber,
			}));
			setEvents(evts);
		});

		// live listener
		const listener = (signer, message, signature, event) => {
			setEvents((curr) => {
				if (curr.some((e) => e.txHash === event.transactionHash)) return curr;
				return [
					...curr,
					{
						signer,
						message,
						signature, // ← now included
						txHash: event.transactionHash,
						blockNumber: event.blockNumber,
					},
				];
			});
		};

		readContract.on(filter, listener);

		// — fetch initial open state —
		readContract.open().then(setOpen);
		// — listen for toggles —
		const toggleListener = (newOpen) => setOpen(newOpen);
		readContract.on("OpenToggled", toggleListener);

		return () => {
			readContract.off(filter, listener);
			readContract.off("OpenToggled", toggleListener);
		};
	}, [readContract]);

	// 3️⃣ Connect wallet & setup writeContract
	const connect = useCallback(async () => {
		if (!window.ethereum) return alert("Install MetaMask");
		await window.ethereum.request({ method: "eth_requestAccounts" });
		const web3Prov = new ethers.providers.Web3Provider(window.ethereum);
		const signer = web3Prov.getSigner();
		const addr = (await signer.getAddress()).toLowerCase();
		setAccount(addr);
		setWriteContract(readContract.connect(signer));
	}, [readContract]);

	// toggle the open flag on-chain; return the tx promise
	const toggleOpen = useCallback(() => {
		if (!writeContract) {
			return Promise.reject(new Error("Wallet not connected"));
		}
		// returns a Promise<ContractTransaction>
		return writeContract.setOpen(!open);
	}, [writeContract, open]);

	// 4️⃣ React to account changes
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
		events,
		writeContract,
		open,
		toggleOpen,
		connect,
		disconnect,
	};
}
