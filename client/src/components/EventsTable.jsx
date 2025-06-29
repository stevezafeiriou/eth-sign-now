// src/components/EventsTable.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { GlassCard } from "../styles/glass";
import { ShareModal } from "./ShareModal";

const TableWrapper = styled.div`
	overflow-x: auto;
	font-family: "Inter", sans-serif;
	margin: 1rem 0;
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	table-layout: fixed;
	font-size: 0.9rem;

	th,
	td {
		padding: 0.75rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		vertical-align: top;
		white-space: pre-wrap;
		word-break: break-word;
		text-align: left;
	}

	th {
		background: #1b1d1c;
		color: #fff;
		font-weight: 400;
	}

	tr {
		cursor: pointer;
		transition: background 0.2s;
	}
	tr:hover {
		background: rgba(74, 144, 226, 0.1);
	}

	a {
		color: #1b1d1c;
		text-decoration: none;
	}
`;

const TruncatedCell = styled.div`
	width: 100%;
	white-space: pre-wrap;
	word-wrap: break-word;
`;

const ExpandBtn = styled.span`
	display: block;
	color: #007bff;
	cursor: pointer;
	margin-top: 4px;
	&:hover {
		text-decoration: underline;
	}
`;

export function EventsTable({ events }) {
	const [selected, setSelected] = useState(null);
	const [expanded, setExpanded] = useState({});

	const toggle = (tx, field) => {
		setExpanded((prev) => ({
			...prev,
			[tx]: { ...prev[tx], [field]: !prev[tx]?.[field] },
		}));
	};

	const renderText = (text = "", tx, field) => {
		const isExpanded = expanded[tx]?.[field];
		const limit = 30;
		if (text.length <= limit) return text;
		if (isExpanded) {
			return (
				<>
					{text}
					<ExpandBtn
						onClick={(e) => {
							e.stopPropagation();
							toggle(tx, field);
						}}
					>
						Show less
					</ExpandBtn>
				</>
			);
		}
		return (
			<>
				{text.slice(0, limit)}…{" "}
				<ExpandBtn
					onClick={(e) => {
						e.stopPropagation();
						toggle(tx, field);
					}}
				>
					Show more
				</ExpandBtn>
			</>
		);
	};

	return (
		<>
			<GlassCard>
				<h2>Signed by</h2>
				<TableWrapper>
					<Table>
						<thead>
							<tr>
								<th>Signer</th>
								<th>Message</th>
								<th>Tx</th>
								<th>Signature</th>
							</tr>
						</thead>
						<tbody>
							{events.map((e, i) => (
								<tr key={`${e.txHash}-${i}`} onClick={() => setSelected(e)}>
									<td>
										{e.signer.slice(0, 6)}…{e.signer.slice(-4)}
									</td>
									<td>
										<TruncatedCell>
											{renderText(e.message, e.txHash, "msg")}
										</TruncatedCell>
									</td>
									<td>
										<a
											href={`http://localhost:8545/tx/${e.txHash}`}
											target="_blank"
											rel="noopener noreferrer"
											onClick={(e) => e.stopPropagation()}
										>
											{e.txHash.slice(0, 10)}…
										</a>
									</td>
									<td>
										<TruncatedCell style={{ fontFamily: "monospace" }}>
											{renderText(e.signature, e.txHash, "sig")}
										</TruncatedCell>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</TableWrapper>
			</GlassCard>

			{selected && (
				<ShareModal event={selected} onClose={() => setSelected(null)} />
			)}
		</>
	);
}
