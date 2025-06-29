// src/components/Navbar.jsx
import React from "react";
import styled from "styled-components";
import { GlassButton } from "../styles/glass";

const Nav = styled.nav`
	width: 100%;
	padding: 1rem 2rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const Left = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
`;

const Title = styled.h1`
	color: #1b1d1c;
	font-size: 1.2rem;
	font-weight: 400;
	margin: 0;
`;

const Status = styled.span`
	background: rgba(0, 0, 0, 0.1);
	padding: 0.25rem 0.75rem;
	border-radius: 12px;
	font-size: 0.8rem;
	font-weight: 400;
	font-family: monospace;
	color: ${({ open }) => (open ? "#28a745" : "#007bff")};
`;

const ButtonRow = styled.div`
	display: flex;
	gap: 1rem;
`;

export function Navbar({
	account,
	isOwner,
	open,
	onToggleOpen,
	onConnect,
	onDisconnect,
}) {
	return (
		<Nav>
			<Left>
				<Title>Elliptic Promise</Title>
				<Status open={open}>{open ? "Signatures Enabled" : "View Only"}</Status>
			</Left>

			<ButtonRow>
				{isOwner && (
					<GlassButton onClick={onToggleOpen}>
						{open ? "Disable Signatures" : "Enable Signatures"}
					</GlassButton>
				)}

				{account ? (
					<GlassButton onClick={onDisconnect}>Disconnect</GlassButton>
				) : (
					<GlassButton onClick={onConnect}>Connect Wallet</GlassButton>
				)}
			</ButtonRow>
		</Nav>
	);
}
