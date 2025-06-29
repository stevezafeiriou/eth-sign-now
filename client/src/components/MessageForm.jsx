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
`;

const Label = styled.label`
	display: block;
	margin: 0.5rem 0;
	font-weight: 400;
	font-style: italic;
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
	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

const Addr = styled.span`
	background: rgba(0, 0, 0, 0.1);
	padding: 0.25rem 0.75rem;
	border-radius: 12px;
	font-size: 0.8rem;
	font-weight: 400;
	font-family: monospace;
	color: #007bff;
`;

const BtnRow = styled.div`
	display: flex;
	gap: 1rem;
	margin-top: 1.5rem;
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
	// clear signature whenever message changes
	const handleMessageChange = (e) => {
		setMessage(e.target.value);
		if (signature) setSignature("");
	};

	const disabled = !(open || isOwner);

	return (
		<>
			{!open &&
				(!isOwner ? (
					<Warning>Signing and broadcasting are currently disabled.</Warning>
				) : null)}
			<GlassCard>
				<Label>Signer Account</Label>
				{account && <Addr>{account}</Addr>}

				<Label>Your Promise or Message</Label>
				<TextArea disabled={disabled} onChange={handleMessageChange} />

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
