import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { ethers, BigNumber } from "ethers";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
	max-width: 800px;
	margin: 0 auto;
	padding: 1rem;
`;

const Controls = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-bottom: 1rem;
`;

const SearchInput = styled.input`
	flex: 1;
	min-width: 200px;
	padding: 0.5rem 0.75rem;
	border: 1px solid ${({ theme }) => theme.colors.border};
	background-color: #f8f8f8;
	border-radius: 6px;
	font-size: 0.9rem;
	color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
	padding: 0.5rem 0.75rem;
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: 6px;
	font-size: 0.9rem;
	color: ${({ theme }) => theme.colors.text};
`;

const List = styled.div`
	display: flex;
	flex-direction: column;
`;

const Item = styled.div`
	background: #ffffff;
	border-radius: 6px;
	padding: 1rem;
	cursor: pointer;
	transition: box-shadow 0.2s ease;

	&:hover {
		background: #f8f8f8;
	}
`;

export const TopRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Left = styled.div`
	flex: 1;
	min-width: 0;
`;

export const Title = styled.div`
	font-size: 1rem;
	font-weight: 600;
	color: ${({ theme }) => theme.colors.text};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const Subtitle = styled.div`
	font-size: 0.85rem;
	color: ${({ theme }) => theme.colors.muted};
	margin-top: 0.25rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const Stats = styled.div`
	display: flex;
	gap: 1rem;
	font-size: 0.85rem;
	white-space: nowrap;
`;

export const Stat = styled.div`
	display: flex;
	align-items: center;
	color: ${({ up, theme }) =>
		up ? theme.colors.primary : theme.colors.danger};

	&::before {
		content: "${({ up }) => (up ? "↑" : "↓")}";
		margin-right: 0.25rem;
	}
`;

export const BarPreview = styled.div`
	margin-top: 0.75rem;
`;

export const PreviewBar = styled.div`
	position: relative;
	height: 6px;
	background: ${({ theme }) => theme.colors.border};
	border-radius: 3px;
	overflow: hidden;
`;

export const ForPreview = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	background: ${({ theme }) => theme.colors.primary};
	width: ${({ pct }) => pct}%;
`;

export const AgainstPreview = styled.div`
	position: absolute;
	right: 0;
	top: 0;
	height: 100%;
	background: ${({ theme }) => theme.colors.danger};
	width: ${({ pct }) => pct}%;
`;

export const PreviewLabels = styled.div`
	display: flex;
	justify-content: space-between;
	font-size: 0.75rem;
	color: ${({ theme }) => theme.colors.muted};
	margin-top: 0.25rem;
`;

export function EventsTable({ events, readContract }) {
	const [filter, setFilter] = useState("");
	const [sortKey, setSortKey] = useState("latest");
	const [order, setOrder] = useState("desc");
	const [votes, setVotes] = useState({});
	const navigate = useNavigate();

	// fetch vote counts
	useEffect(() => {
		if (!readContract || events.length === 0) return;
		(async () => {
			const data = {};
			for (const e of events) {
				const f = await readContract.forVotes(e.messageId);
				const a = await readContract.againstVotes(e.messageId);
				data[e.messageId.toString()] = { for: f, against: a };
			}
			setVotes(data);
		})();
	}, [readContract, events]);

	// filter
	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase();
		return events.filter(
			(e) =>
				e.message.toLowerCase().includes(q) ||
				e.signer.toLowerCase().includes(q) ||
				e.txHash.toLowerCase().includes(q)
		);
	}, [events, filter]);

	// sort
	const sorted = useMemo(() => {
		return [...filtered].sort((a, b) => {
			if (sortKey === "for" || sortKey === "against") {
				const va = votes[a.messageId]?.[sortKey] || BigNumber.from(0);
				const vb = votes[b.messageId]?.[sortKey] || BigNumber.from(0);
				if (va.lt(vb)) return order === "asc" ? -1 : 1;
				if (va.gt(vb)) return order === "asc" ? 1 : -1;
				return 0;
			} else {
				const ai = Number(a.messageId);
				const bi = Number(b.messageId);
				if (sortKey === "oldest") {
					return order === "asc" ? ai - bi : bi - ai;
				}
				return order === "asc" ? bi - ai : ai - bi;
			}
		});
	}, [filtered, votes, sortKey, order]);

	const slice = (s, n = 60) => (s.length > n ? s.slice(0, n - 3) + "…" : s);

	return (
		<Container>
			<Controls>
				<SearchInput
					placeholder="Search..."
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
				/>
				<Select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
					<option value="latest">Sort: Latest</option>
					<option value="oldest">Sort: Oldest</option>
					<option value="for">Sort: For Votes</option>
					<option value="against">Sort: Against Votes</option>
				</Select>
				<Select value={order} onChange={(e) => setOrder(e.target.value)}>
					<option value="desc">Order: Desc</option>
					<option value="asc">Order: Asc</option>
				</Select>
			</Controls>

			<List>
				{sorted.map((e) => {
					const v = votes[e.messageId] || {};
					const f = v.for || BigNumber.from(0);
					const a = v.against || BigNumber.from(0);
					const total = f.add(a);
					const pctFor = total.isZero() ? 0 : f.mul(100).div(total).toNumber();
					const pctAgainst = 100 - pctFor;

					return (
						<Item
							key={e.txHash}
							onClick={() => navigate(`/promise/${e.messageId}`)}
						>
							<TopRow>
								<Left>
									<Title>
										#{e.messageId} – {slice(e.message)}
									</Title>
									<Subtitle>by {slice(e.signer, 16)}</Subtitle>
								</Left>
								<Stats>
									<Stat up>
										{parseFloat(ethers.utils.formatEther(f)).toFixed(2)} ETH
									</Stat>
									<Stat>
										{parseFloat(ethers.utils.formatEther(a)).toFixed(2)} ETH
									</Stat>
								</Stats>
							</TopRow>

							{/* <BarPreview>
								<PreviewBar>
									<ForPreview pct={pctFor} />
									<AgainstPreview pct={pctAgainst} />
								</PreviewBar>
								<PreviewLabels>
									<span>{pctFor}%</span>
									<span>{pctAgainst}%</span>
								</PreviewLabels>
							</BarPreview> */}
						</Item>
					);
				})}
			</List>
		</Container>
	);
}
