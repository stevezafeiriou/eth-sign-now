// src/App.jsx
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import { useEthereum } from "./hooks/useEthereum";
import { Navbar } from "./components/Navbar";
import { MessageForm } from "./components/MessageForm";
import { EventsTable } from "./components/EventsTable";
import { Footer } from "./components/Footer";

export default function App() {
	const {
		account,
		owner,
		events,
		writeContract,
		connect,
		disconnect,
		open,
		toggleOpen,
	} = useEthereum();
	const isOwner = account && owner && account === owner;

	const [message, setMessage] = useState("");
	const [signature, setSignature] = useState("");

	const handleSign = async () => {
		try {
			const sig = await writeContract.signer.signMessage(message);
			setSignature(sig);
			toast.success("Message signed!");
		} catch {
			toast.error("Signing failed");
		}
	};

	const handleSend = async () => {
		if (!writeContract || !signature) return;
		const txPromise = writeContract.storeSignedMessage(message, signature);
		toast.promise(
			txPromise,
			{
				pending: "Broadcasting…",
				success: (tx) => {
					tx.wait().then(() => toast.success("Confirmed!"));
					return "Sent " + tx.hash.slice(0, 10) + "…";
				},
				error: "Transaction failed",
			},
			{ autoClose: false }
		);

		try {
			await txPromise;
			setMessage("");
			setSignature("");
		} catch {}
	};

	// Wrap toggleOpen in toast.promise
	const handleToggleWriting = async () => {
		const txPromise = toggleOpen();
		toast.promise(
			txPromise,
			{
				pending: open ? "Disabling Signatures..." : "Enabling Signatures...",
				success: (tx) => {
					// fire a second toast once confirmed
					tx.wait().then(() => {
						toast.success(
							`Signatures are now ${open ? "enabled" : "disabled"}!`
						);
					});
					return open ? "Disabled" : "Enabled";
				},
				error: "Transaction failed",
			},
			{ autoClose: false }
		);
	};

	return (
		<ThemeProvider theme={theme}>
			<GlobalStyles />
			<ToastContainer position="top-right" />

			<Navbar
				account={account}
				isOwner={isOwner}
				open={open}
				onToggleOpen={handleToggleWriting}
				onConnect={connect}
				onDisconnect={disconnect}
			/>

			<main style={{ padding: "1rem", maxWidth: 800, margin: "0 auto" }}>
				{account && (
					<MessageForm
						account={account}
						isOwner={isOwner}
						open={open}
						message={message}
						setMessage={setMessage}
						signature={signature}
						setSignature={setSignature}
						onSign={handleSign}
						onSend={handleSend}
					/>
				)}
				<EventsTable events={events} />
			</main>
			<Footer />
		</ThemeProvider>
	);
}
