import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import { useEthereum } from "./hooks/useEthereum";

import { Sidebar } from "./components/Sidebar";
import { EventsTable } from "./components/EventsTable";
import { PromiseDetail } from "./components/PromiseDetail";
import { MessageForm } from "./components/MessageForm";

const AppLayout = styled.div`
	display: flex;
	min-height: 100vh;
	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

const MainContent = styled.main`
	flex: 1;
	padding: 2rem 1rem;
	margin-left: 240px;
	box-sizing: border-box;
	@media (max-width: 768px) {
		margin-left: 0;
		padding-top: 1rem;
	}
`;

export default function App() {
	const {
		account,
		owner,
		events,
		readContract,
		writeContract,
		connect,
		disconnect,
		open,
		toggleOpen,
	} = useEthereum();
	const isOwner = account && owner === account;

	const [message, setMessage] = React.useState("");
	const [signature, setSignature] = React.useState("");

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
		const tx = writeContract.storeSignedMessage(message, signature);
		toast.promise(
			tx,
			{
				pending: "Broadcasting…",
				success: (tx) => {
					tx.wait().then(() => toast.success("Confirmed!"));
					return "Sent " + tx.hash.slice(0, 10) + "…";
				},
				error: "Broadcast failed",
			},
			{ autoClose: false }
		);
		try {
			await tx;
			setMessage("");
			setSignature("");
		} catch {}
	};

	const handleToggle = async () => {
		const tx = toggleOpen();
		toast.promise(
			tx,
			{
				pending: open ? "Disabling…" : "Enabling…",
				success: (tx) => {
					tx.wait().then(() =>
						toast.success(`Signatures ${open ? "disabled" : "enabled"}!`)
					);
					return open ? "Disabled" : "Enabled";
				},
				error: "Toggle failed",
			},
			{ autoClose: false }
		);
	};

	return (
		<ThemeProvider theme={theme}>
			<GlobalStyles />
			<ToastContainer position="top-right" />

			<BrowserRouter>
				<AppLayout>
					<Sidebar
						open={open}
						onConnect={connect}
						onDisconnect={disconnect}
						account={account}
						isOwner={isOwner}
						onToggleOpen={handleToggle}
					/>

					<MainContent>
						<Routes>
							<Route
								path="/"
								element={
									<EventsTable
										events={events}
										readContract={readContract}
										writeContract={writeContract}
										account={account}
									/>
								}
							/>
							<Route
								path="/promise/:id"
								element={
									<PromiseDetail
										events={events}
										readContract={readContract}
										writeContract={writeContract}
										account={account}
									/>
								}
							/>
							<Route
								path="/create"
								element={
									account ? (
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
									) : (
										<p style={{ textAlign: "center" }}>
											Please connect your wallet.
										</p>
									)
								}
							/>
						</Routes>
					</MainContent>
				</AppLayout>
			</BrowserRouter>
		</ThemeProvider>
	);
}
