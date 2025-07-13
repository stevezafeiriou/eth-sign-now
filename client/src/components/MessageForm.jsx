// src/components/MessageForm.jsx
import React from "react";
import styled from "styled-components";
import { GlassCard, GlassButton } from "../styles/glass";

const Warning = styled.div`
	background: #ffe5e5;
	border: 1px solid #e74c3c;
	color: #e74c3c;
	padding: 1rem;
	border-radius: 16px;
	font-weight: 400;
	margin-bottom: 1rem;
	text-align: center;

	@media (max-width: 600px) {
		padding: 0.75rem;
		font-size: 0.9rem;
	}
`;

const Label = styled.label`
	display: block;
	margin: 0.5rem 0;
	font-weight: 400;
	font-style: italic;

	@media (max-width: 600px) {
		font-size: 0.9rem;
	}
`;

const TextArea = styled.textarea`
	width: 100%;
	padding: 0.75rem;
	margin-top: 0.5rem;
	border: 1px solid rgba(0, 0, 0, 0.3);
	border-radius: 8px;
	background: ${({ disabled }) =>
		disabled ? "#f0f0f0" : "rgba(0, 0, 0, 0.05)"};
	color: #1b1d1c;
	resize: vertical;
	min-height: ${({ small }) => (small ? "3rem" : "7rem")};

	@media (max-width: 600px) {
		padding: 0.6rem;
		min-height: ${({ small }) => (small ? "2.5rem" : "5rem")};
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

const Addr = styled.a`
	display: inline-block;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	background: rgba(0, 0, 0, 0.1);
	padding: 0.25rem 0.75rem;
	border-radius: 12px;
	font-size: 0.8rem;
	font-weight: 400;
	font-family: monospace;
	color: #007bff;
	transition: all 0.2s ease-in-out;
	cursor: pointer;
	text-decoration: none;

	&:hover {
		background: rgba(0, 0, 0, 1);
		color: #ffffff;
	}

	@media (max-width: 600px) {
		max-width: 140px;
		font-size: 0.75rem;
		padding: 0.2rem 0.6rem;
	}
`;

const BtnRow = styled.div`
	display: flex;
	gap: 1rem;
	margin-top: 1.5rem;

	@media (max-width: 600px) {
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}
`;

export function MessageForm({
	account,
	isOwner,
	open,
	message,
	setMessage,
	signature,
	setSignature,
	onSign,
	onSend,
}) {
	// clear stale signature when message changes
	const handleMessageChange = (e) => {
		setMessage(e.target.value);
		if (signature) setSignature("");
	};

	const disabled = !(open || isOwner);

	return (
		<>
			{!open && !isOwner && (
				<Warning>Signing and broadcasting are currently disabled.</Warning>
			)}
			<GlassCard>
				<Label>Signer Account</Label>
				{account && (
					<Addr
						href={`https://etherscan.io/address/${account}`}
						target="_blank"
						rel="noopener"
					>
						{account}
					</Addr>
				)}

				<Label>Your Promise or Message</Label>
				<TextArea
					disabled={disabled}
					onChange={handleMessageChange}
					value={message}
				/>

				<Label>Signature Hash</Label>
				<TextArea small disabled value={signature} />

				<BtnRow>
					<GlassButton
						disabled={disabled || !message || Boolean(signature)}
						onClick={onSign}
					>
						Sign
					</GlassButton>
					<GlassButton disabled={disabled || !signature} onClick={onSend}>
						Broadcast
					</GlassButton>
				</BtnRow>
			</GlassCard>
		</>
	);
}
