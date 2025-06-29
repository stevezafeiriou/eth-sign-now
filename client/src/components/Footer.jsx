// src/components/Footer.jsx
import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 2rem 1rem;
	color: #1b1d1c;
	background: transparent;
	font-size: 0.8rem;
`;

const ContractLink = styled.a`
	color: #1b1d1c;
	text-decoration: none;
	font-weight: 400;
	margin-bottom: 0.75rem;

	&:hover {
		text-decoration: underline;
	}
`;

const Notice = styled.p`
	color: #777;
	max-width: 750px;
	text-align: justify;
	line-height: 1.4;
	opacity: 0.8;
`;

export function Footer() {
	return (
		<FooterContainer>
			<ContractLink
				href="https://etherscan.io/address/0x610178dA211FEF7D417bC0e6FeD39F05609AD788"
				target="_blank"
				rel="noopener noreferrer"
			>
				contract 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
			</ContractLink>

			<Notice>
				**THE APPLICATION, THE UNDERLYING SMART CONTRACTS, AND ANY RELATED
				SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OR
				REPRESENTATIONS OF ANY KIND—EXPRESS, IMPLIED, OR STATUTORY—INCLUDING
				(BUT NOT LIMITED TO) WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
				PARTICULAR PURPOSE, TITLE, SECURITY, NON-INFRINGEMENT, OR THAT THE CODE
				IS ERROR-FREE OR WILL OPERATE WITHOUT INTERRUPTION.
				<br />
				<br />
				By interacting with this software you acknowledge and accept the
				intrinsic risks of cryptographic systems and blockchain-based networks,
				including (but not limited to) volatile price fluctuations of digital
				assets, smart-contract bugs, irreversible transactions, regulatory
				uncertainty, and latent cybersecurity threats. You are solely
				responsible for securing your private keys and for complying with all
				applicable laws.
				<br />
				<br />
				TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE
				AUTHORS, DEVELOPERS, CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR ANY
				DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, EXEMPLARY, OR
				PUNITIVE DAMAGES—OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR OTHER
				INTANGIBLE LOSSES—ARISING OUT OF OR IN CONNECTION WITH (A) YOUR ACCESS
				TO OR USE OF (OR INABILITY TO USE) THE APPLICATION OR SMART CONTRACTS,
				(B) ANY UNAUTHORISED ACCESS, BUG, ERROR, OR SECURITY BREACH, OR (C) ANY
				CONTENT, GOODS, OR SERVICES MADE AVAILABLE THROUGH THIRD-PARTY LINKS.
				TOTAL LIABILITY, IF ANY, SHALL NOT EXCEED THE GREATER OF (I) USD 100 OR
				(II) THE AMOUNT YOU PAID (IF ANY) TO USE THE SOFTWARE DURING THE 12
				MONTHS PRECEDING THE CLAIM.
				<br />
				<br />
				Nothing in or related to this software constitutes legal, financial,
				investment, or tax advice. Always conduct your own due diligence and
				consult professional advisers.
				<br />
				<br />
				This Agreement is governed by the laws of [Jurisdiction]. Exclusive
				venue for any dispute shall be the courts located in [City, Country].
			</Notice>
		</FooterContainer>
	);
}
