// src/components/PromiseDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ethers, BigNumber, utils } from "ethers";
import { drawHashArt } from "../utils/hashArt";
import { toast } from "react-toastify";

const Container = styled.div`
	max-width: 800px;
	margin: 2rem auto;
	padding: 0 1rem;
`;
const BackRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
`;
const Back = styled.button`
	background: none;
	border: none;
	color: ${({ theme }) => theme.colors.blue};
	font-size: 0.9rem;
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
`;
const Download = styled.button`
	background: none;
	border: none;
	color: ${({ theme }) => theme.colors.blue};
	font-size: 0.9rem;
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
`;
const TwoCol = styled.div`
	display: grid;
	grid-template-columns: 70% 30%;
	gap: 1.5rem;
	@media (max-width: 768px) {
		grid-template-columns: 1fr;
	}
`;
const Left = styled.div``;
const Right = styled.div``;
const Title = styled.h1`
	font-size: 1.5rem;
	font-weight: 400;
	margin: 0;
`;
const Meta = styled.div`
	font-size: 0.85rem;
	color: ${({ theme }) => theme.colors.muted};
	margin-bottom: 1rem;
`;
const Body = styled.p`
	font-size: 0.95rem;
	color: ${({ theme }) => theme.colors.text};
	line-height: 1.5;
`;
const CanvasWrapper = styled.div`
	width: 100%;
	aspect-ratio: 1/1;
	border-radius: 8px;
	overflow: hidden;
	background: ${({ theme }) => theme.colors.text};
	margin-bottom: 1rem;
`;
const Canvas = styled.canvas`
	width: 100%;
	height: 100%;
`;
const InfoTable = styled.div`
	font-size: 0.85rem;
	margin-top: 1rem;
	& > div {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	.label {
		color: ${({ theme }) => theme.colors.muted};
	}
	.value {
		color: ${({ theme }) => theme.colors.blue};
		text-align: right;
	}
`;
const OverviewBox = styled.div`
	background: #f8f8f8;
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: 8px;
	padding: 1rem;
	margin-bottom: 1rem;
	h3 {
		margin: 0 0 0.5rem;
		font-weight: 400;
	}
`;
const Bar = styled.div`
	display: flex;
	height: 8px;
	background: ${({ theme }) => theme.colors.border};
	border-radius: 4px;
	overflow: hidden;
	margin-bottom: 0.5rem;
`;
const ForBar = styled.div`
	background: ${({ theme }) => theme.colors.primary};
	width: ${(p) => p.pctFor}%;
`;
const AgainstBar = styled.div`
	background: ${({ theme }) => theme.colors.danger};
	width: ${(p) => p.pctAgainst}%;
`;
const LabelRow = styled.div`
	display: flex;
	justify-content: space-between;
	font-size: 0.85rem;
	color: #374151;
`;
const VoterCount = styled.div`
	font-size: 0.8rem;
	color: #6b7280;
`;
const ButtonRow = styled.div`
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1rem;
`;
const VoteBtn = styled.button`
	flex: 1;
	padding: 0.35rem;
	font-size: 0.9rem;
	color: #fff;
	background: ${(p) => (p.pos ? "#4E6E81" : "#FF0303")};
	border: none;
	border-radius: 4px;
	cursor: pointer;
	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media screen {
	}
`;
const Section = styled.div`
	border-radius: 6px;
	padding: 0;
	margin-bottom: 0.5rem;
`;
const SecHeader = styled.div`
	font-size: 0.8rem;
	margin-bottom: 0.25rem;
`;
const SecFooter = styled.div`
	font-size: 0.75rem;
	color: ${({ theme }) => theme.colors.muted};
	margin-top: 0.5rem;
`;

export function PromiseDetail({
	events,
	readContract,
	writeContract,
	account,
}) {
	const { id } = useParams(),
		nav = useNavigate();
	const [evt, setEvt] = useState(null);
	const [votes, setVotes] = useState({
		for: BigNumber.from(0),
		against: BigNumber.from(0),
	});
	const [voters, setVoters] = useState(0);
	const [proposedOn, setProposedOn] = useState("");
	const [txs, setTxs] = useState([]);
	const [loading, setLoading] = useState(false);

	// find event
	useEffect(() => {
		const e = events.find((x) => String(x.messageId) === id);
		if (e) setEvt(e);
	}, [events, id]);

	// load on‑chain
	useEffect(() => {
		if (!evt || !readContract) return;
		(async () => {
			const f = await readContract.forVotes(evt.messageId);
			const a = await readContract.againstVotes(evt.messageId);
			setVotes({ for: f, against: a });

			const logs = await readContract.queryFilter(
				readContract.filters.Voted(evt.messageId)
			);
			setVoters(new Set(logs.map((l) => l.args.voter.toLowerCase())).size);

			const entries = await Promise.all(
				logs.map(async (l) => {
					const tx = await readContract.provider.getTransaction(
						l.transactionHash
					);
					const blk = await readContract.provider.getBlock(tx.blockNumber);
					return {
						header: `${tx.from.slice(0, 6)}… voted ${
							l.args.support ? "for" : "against"
						} (${parseFloat(utils.formatEther(l.args.weight)).toFixed(2)} ETH)`,
						footer: new Date(blk.timestamp * 1000).toLocaleDateString(),
					};
				})
			);
			setTxs(entries);

			const blk0 = await readContract.provider.getBlock(evt.blockNumber);
			setProposedOn(new Date(blk0.timestamp * 1000).toLocaleDateString());
		})();
	}, [evt, readContract]);

	// draw hash art
	useEffect(() => {
		if (!evt) return;
		const c = document.getElementById("hashArt"),
			ctx = c.getContext("2d");
		const size = c.clientWidth;
		c.width = c.height = size;
		drawHashArt(ctx, evt.signature, { size });
	}, [evt]);

	if (!evt) return <Container>Loading…</Container>;

	const total = votes.for.add(votes.against);
	const pctFor = total.isZero() ? 0 : votes.for.mul(100).div(total).toNumber();
	const pctAgainst = 100 - pctFor;

	const downloadImage = () => {
		const c = document.getElementById("hashArt");
		const a = document.createElement("a");
		a.href = c.toDataURL();
		a.download = `promise-${evt.messageId}.png`;
		a.click();
	};

	// **VOTE function**
	const vote = async (support) => {
		if (!writeContract || !account) return;
		setLoading(true);
		try {
			const tx = await writeContract.vote(evt.messageId, support);
			await toast.promise(
				tx.wait(),
				{
					pending: support ? "Upvoting…" : "Downvoting…",
					success: "Vote confirmed!",
					error: "Transaction failed",
				},
				{ autoClose: 2000 }
			);
			// refresh
			const [f2, a2] = await Promise.all([
				readContract.forVotes(evt.messageId),
				readContract.againstVotes(evt.messageId),
			]);
			setVotes({ for: f2, against: a2 });
			const logs2 = await readContract.queryFilter(
				readContract.filters.Voted(evt.messageId)
			);
			setVoters(new Set(logs2.map((l) => l.args.voter.toLowerCase())).size);
		} catch (err) {
			const reason = err.error?.data?.message || err.message || "";
			toast.error(
				reason.includes("Already voted")
					? "You’ve already voted."
					: "Voting failed: " + reason
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container>
			<BackRow>
				<Back onClick={() => nav(-1)}>← Go Back</Back>
			</BackRow>
			<TwoCol>
				<Right>
					<Title>Promise #{evt.messageId}</Title>
					<Meta>
						Proposed on {proposedOn} by {evt.signer.slice(0, 6)}…
					</Meta>

					<CanvasWrapper>
						<Canvas id="hashArt" />
					</CanvasWrapper>

					<InfoTable>
						<div>
							<span className="label">Tx Hash:</span>
							<span className="value">
								{evt.txHash.slice(0, 6)}…{evt.txHash.slice(-4)}
							</span>
						</div>
						<div>
							<span className="label">Signature:</span>
							<span className="value">
								{evt.signature.slice(0, 6)}…{evt.signature.slice(-4)}
							</span>
						</div>
					</InfoTable>
					<Body>{evt.message}</Body>
					<Download onClick={downloadImage}>Download Image</Download>
				</Right>
				<Left>
					<OverviewBox>
						<h3>Total Votes</h3>
						<Bar>
							<ForBar pctFor={pctFor} />
							<AgainstBar pctAgainst={pctAgainst} />
						</Bar>
						<LabelRow>
							<div style={{ marginRight: "10px" }}>
								For {parseFloat(utils.formatEther(votes.for)).toFixed(2)} ETH
							</div>
							<div style={{ marginLeft: "10px" }}>
								Against{" "}
								{parseFloat(utils.formatEther(votes.against)).toFixed(2)} ETH
							</div>
						</LabelRow>
						<VoterCount>Voters: {voters}</VoterCount>
					</OverviewBox>
					<ButtonRow>
						<VoteBtn pos onClick={() => vote(true)} disabled={loading}>
							↑ For
						</VoteBtn>
						<VoteBtn onClick={() => vote(false)} disabled={loading}>
							↓ Against
						</VoteBtn>
					</ButtonRow>
					{txs.length > 0 ? (
						txs.map((t, i) => (
							<Section key={i}>
								<SecHeader>{t.header}</SecHeader>
								<SecFooter>{t.footer}</SecFooter>
							</Section>
						))
					) : (
						<div className="empty">No transactions yet</div>
					)}
				</Left>
			</TwoCol>
		</Container>
	);
}
