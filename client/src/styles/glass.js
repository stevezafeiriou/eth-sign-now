import styled from "styled-components";

export const GlassCard = styled.div`
	background: transparent;
	backdrop-filter: blur(10px);
	border-radius: 16px;
	padding: 0.5rem 2rem;
	box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
	margin-bottom: 2rem;

	h2 {
		font-weight: 400;
		font-style: italic;
	}
`;

export const GlassButton = styled.button`
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
