// src/components/EventsTable.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import styled from "styled-components";
import { GlassCard } from "../styles/glass";
import { ShareModal } from "./ShareModal";
import { drawHashArt } from "../utils/hashArt";
import { FaList, FaThLarge } from "react-icons/fa";

const Container = styled.div`
	margin: 1rem 0;
`;

const Controls = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const SearchInput = styled.input`
	flex: 1;
	min-width: 200px;
	padding: 0.5rem 0.75rem;
	border: 1px solid rgba(0, 0, 0, 0.2);
	border-radius: 8px;
	font-size: 0.9rem;
	&:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
	}
`;

const Tabs = styled.div`
	display: flex;
	gap: 0.5rem;
`;

const Tab = styled.button`
	background: ${({ active }) => (active ? "#1b1d1c" : "transparent")};
	color: ${({ active }) => (active ? "#fff" : "#1b1d1c")};
	border: 1px solid #1b1d1c;
	padding: 0.5rem 1rem;
	border-radius: 8px;
	cursor: pointer;
	font-size: 0.9rem;
	transition: 0.2s;
	&:hover {
		background: #1b1d1c;
		color: #fff;
	}
`;

const TableWrapper = styled.div`
	overflow-x: auto;
	font-family: "Inter", sans-serif;
	margin-bottom: 1.5rem; /* space after table */
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
		transition: color 0.2s;
		&:hover {
			color: #007bff;
		}
	}
	@media (max-width: 600px) {
		display: block;
		thead {
			display: none;
		}
		tr {
			display: block;
			margin-bottom: 1rem;
			border: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 8px;
			padding: 0.5rem;
		}
		td {
			display: flex;
			justify-content: space-between;
			padding: 0.5rem;
			border: none;
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		}
		td:last-child {
			border-bottom: none;
		}
		td::before {
			content: attr(data-label);
			font-weight: 600;
			margin-right: 0.5rem;
		}
	}
`;

const TruncatedCell = styled.div`
	width: 100%;
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

const ImageGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 1rem;
	margin-bottom: 1.5rem; /* space after grid */
`;

const GridItem = styled.div`
	overflow: hidden;
	border-radius: 8px;
	background: #fff;
	cursor: pointer;
	transition: transform 0.2s;
	&:hover {
		transform: scale(1.05);
	}
	canvas {
		display: block;
		width: 100%;
		height: auto;
	}
`;

const TabIcon = styled.button`
	background: transparent;
	border: none;
	padding: 0.5rem;
	border-radius: 8px;
	cursor: pointer;
	color: ${({ active }) => (active ? "#1b1d1c" : "rgba(0,0,0,0.6)")};
	background: ${({ active }) => (active ? "#fff" : "transparent")};
	box-shadow: ${({ active }) =>
		active ? "0 1px 3px rgba(0,0,0,0.2)" : "none"};
	transition: all 0.2s;
	font-size: 1.2rem;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		color: #007bff;
	}
`;

export function EventsTable({ events }) {
	const [selected, setSelected] = useState(null);
	const [expanded, setExpanded] = useState({});
	const [filter, setFilter] = useState("");
	const [tab, setTab] = useState("list");
	const canvasRefs = useRef({});

	const toggleExpand = (tx, field) =>
		setExpanded((prev) => ({
			...prev,
			[tx]: { ...prev[tx], [field]: !prev[tx]?.[field] },
		}));

	const renderText = (text = "", tx, field) => {
		const isExpanded = expanded[tx]?.[field];
		const limit = 30;
		if (text.length <= limit) return text;
		return isExpanded ? (
			<>
				{text}
				<ExpandBtn
					onClick={(e) => {
						e.stopPropagation();
						toggleExpand(tx, field);
					}}
				>
					Show less
				</ExpandBtn>
			</>
		) : (
			<>
				{text.slice(0, limit)}…{" "}
				<ExpandBtn
					onClick={(e) => {
						e.stopPropagation();
						toggleExpand(tx, field);
					}}
				>
					Show more
				</ExpandBtn>
			</>
		);
	};

	/** -----------------------------------------------------------------
	 *  NEWEST-FIRST ORDERING
	 *  -----------------------------------------------------------------
	 *  1. Filter by query (if any).
	 *  2. Reverse the list so the most-recent event—assumed to be appended
	 *     last in `events`—appears first in both the table and grid.
	 *  ----------------------------------------------------------------- */
	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase();
		const base = q
			? events.filter(
					(e) =>
						e.signer.toLowerCase().includes(q) ||
						e.txHash.toLowerCase().includes(q) ||
						(e.signature || "").toLowerCase().includes(q)
			  )
			: events;

		return [...base].reverse(); // newest → oldest
	}, [events, filter]);

	/* draw hash-art for grid */
	useEffect(() => {
		if (tab !== "grid") return;
		filtered.forEach((e) => {
			const canvas = canvasRefs.current[e.txHash];
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			const size = (canvas.width = 120);
			canvas.height = size;
			drawHashArt(ctx, e.signature || e.txHash, 0, 0, size);
		});
	}, [tab, filtered]);

	return (
		<Container>
			<GlassCard>
				<h2>Signed Messages</h2>
				{/* ----- controls ----- */}
				<Controls>
					<SearchInput
						type="text"
						placeholder="Search by address, tx or signature…"
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
					/>
					<Tabs>
						<TabIcon
							onClick={() => setTab("list")}
							active={tab === "list"}
							aria-label="List view"
						>
							<FaList />
						</TabIcon>
						<TabIcon
							onClick={() => setTab("grid")}
							active={tab === "grid"}
							aria-label="Grid view"
						>
							<FaThLarge />
						</TabIcon>
					</Tabs>
				</Controls>

				{/* ----- list view ----- */}
				{tab === "list" && (
					<TableWrapper>
						<Table>
							<thead>
								<tr>
									<th>No</th>
									<th>Address</th>
									<th>Promise</th>
									<th>Tx Hash</th>
									<th>Signature</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((e) => (
									<tr key={e.txHash} onClick={() => setSelected(e)}>
										<td data-label="No">{e.txHash.length}</td>
										<td data-label="Address">
											{e.signer.slice(0, 6)}…{e.signer.slice(-4)}
										</td>
										<td data-label="Promise">
											<TruncatedCell>
												{renderText(e.message, e.txHash, "msg")}
											</TruncatedCell>
										</td>
										<td
											data-label="Tx Hash"
											onClick={(ev) => ev.stopPropagation()}
										>
											<a
												href={`http://localhost:8545/tx/${e.txHash}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												{e.txHash.slice(0, 6)}…{e.txHash.slice(-4)}
											</a>
										</td>
										<td data-label="Signature">
											<TruncatedCell style={{ fontFamily: "monospace" }}>
												{renderText(e.signature, e.txHash, "sig")}
											</TruncatedCell>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</TableWrapper>
				)}

				{/* ----- grid view ----- */}
				{tab === "grid" && (
					<ImageGrid>
						{filtered.map((e) => (
							<GridItem key={e.txHash} onClick={() => setSelected(e)}>
								<canvas ref={(el) => (canvasRefs.current[e.txHash] = el)} />
							</GridItem>
						))}
					</ImageGrid>
				)}
			</GlassCard>

			{selected && (
				<ShareModal event={selected} onClose={() => setSelected(null)} />
			)}
		</Container>
	);
}
