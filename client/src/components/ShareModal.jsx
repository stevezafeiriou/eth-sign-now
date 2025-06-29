// src/components/ShareModal.jsx
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { ethers } from "ethers";
import { drawHashArt } from "../utils/hashArt";

const FullScreen = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(255, 255, 255, 0.6);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const Modal = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	max-width: 90vw;
	padding: 16px;
`;

const CloseBtn = styled.button`
	position: absolute;
	top: 8px;
	right: 8px;
	background: transparent;
	border: none;
	font-size: 1.5rem;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s ease-in-out;

	&:hover {
		background: #ddd;
	}
`;

const CanvasEl = styled.canvas`
	background: #1b1d1c;
	border-radius: 12px;
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
	width: 90vw;
	max-width: 600px;
	aspect-ratio: 1/1;
	display: block;
	margin-top: 32px;
`;

const ControlGroup = styled.div`
	margin-top: 16px;
	display: flex;
	gap: 12px;
`;

const Btn = styled.button`
	background: transparent;
	backdrop-filter: blur(8px);
	border-radius: 16px;
	border: 1px solid #1b1d1c;
	color: #1b1d1c;
	padding: 0.5rem 1.2rem;
	font-size: 0.9rem;
	cursor: pointer;
	transition: all 0.2s ease-in-out;

	&:not(:disabled):hover {
		color: #fff;
		background: #1b1d1c;
	}
	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

function wrapText(ctx, text, maxWidth) {
	const words = text.split(" ");
	const lines = [];
	let line = "";
	for (let w of words) {
		const test = line + w + " ";
		if (ctx.measureText(test).width > maxWidth && line) {
			lines.push(line.trim());
			line = w + " ";
		} else {
			line = test;
		}
	}
	if (line) lines.push(line.trim());
	return lines;
}

export function ShareModal({ event, onClose }) {
	const canvasRef = useRef(null);
	const [timestamp, setTimestamp] = useState("");
	const [iconOnly, setIconOnly] = useState(false);

	useEffect(() => {
		if (!event) return;
		new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", 31337)
			.getBlock(event.blockNumber)
			.then((b) => setTimestamp(new Date(b.timestamp * 1000).toLocaleString()));
	}, [event]);

	useEffect(() => {
		if (!event) return;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const W = 800,
			H = 800;
		canvas.width = W;
		canvas.height = H;

		// fill bg
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, W, H);

		if (iconOnly) {
			// IDENTICON ONLY MODE: fill a centered 400×400 block
			const size = 730;
			const x = (W - size) / 2;
			const y = (H - size) / 2;
			drawHashArt(ctx, event.signature || event.txHash, x, y, size);
			return;
		}

		// FULL MODE: draw message + signature
		const pad = 40;
		const fontSize = 16;
		const lineH = fontSize * 1.2;
		const maxW = W - pad * 2;

		// <Message>
		ctx.fillStyle = "#1b1d1c";
		ctx.font = `${fontSize}px Courier Prime`;
		let y = pad;
		ctx.fillText("<Promise>", pad, (y += lineH));

		ctx.font = `${fontSize}px sans-serif`;
		event.message.split("\n").forEach((raw) =>
			wrapText(ctx, raw, maxW).forEach((l) => {
				ctx.fillText(l, pad, (y += lineH));
			})
		);

		ctx.font = `${fontSize}px Courier Prime`;
		ctx.fillText("</Promise>", pad, (y += lineH));

		// <Signature>
		const sig = event.signature || "";
		const mid = Math.ceil(sig.length / 2);
		const sig1 = sig.slice(0, mid),
			sig2 = sig.slice(mid);
		const sigLines = [
			"<Signature>",
			`eth:tx: ${event.txHash}`,
			`eth:signer: ${event.signer}`,
			`eth:timestamp: ${timestamp}`,
			`eth:signature: ${sig1}`,
			sig2,
			"</Signature>",
		];

		ctx.fillStyle = "#1b1d1c";
		ctx.font = `${fontSize}px Courier Prime`;
		let sy = H - pad - sigLines.length * lineH + lineH; // top of signature block
		sigLines.forEach((ln) =>
			wrapText(ctx, ln, maxW).forEach((wrapped) => {
				ctx.fillText(wrapped, pad, sy);
				sy += lineH;
			})
		);
	}, [event, timestamp, iconOnly]);

	if (!event) return null;

	const download = () => {
		const url = canvasRef.current.toDataURL("image/png");
		const a = document.createElement("a");
		a.href = url;
		a.download = iconOnly ? "identicon.png" : "message.png";
		a.click();
	};

	return createPortal(
		<FullScreen>
			<Modal>
				<CloseBtn onClick={onClose}>×</CloseBtn>
				<CanvasEl ref={canvasRef} />
				<ControlGroup>
					<Btn onClick={download}>Download Image</Btn>
					<Btn onClick={() => setIconOnly((b) => !b)}>
						{iconOnly ? "Show Promise" : "Show Hash"}
					</Btn>
				</ControlGroup>
			</Modal>
		</FullScreen>,
		document.body
	);
}
