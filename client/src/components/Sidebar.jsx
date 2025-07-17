// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const SidebarContainer = styled.aside`
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	width: 240px;
	background: ${({ theme }) => theme.colors.background};
	border-right: 1px solid #e5e7eb;
	display: flex;
	flex-direction: column;
	padding: 1rem 1.5rem;
	box-sizing: border-box;
	z-index: 1000;

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		position: static;
		width: 100%;
		flex-direction: row;
		align-items: center;
		padding: 0.75rem 1rem;
		border-right: none;
		border-bottom: 1px solid #e5e7eb;
	}
`;

const Logo = styled.img`
	width: 48px;
	height: 48px;
	background: #4a90e2;
	border-radius: 8px;
	margin-bottom: 2rem;

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		margin: 0;
		margin-right: 1rem;
	}
`;

const Title = styled.h1`
	font-size: 1rem;
	font-weight: 600;
	margin-bottom: 1rem;
	color: ${({ theme }) => theme.colors.text};

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		font-size: 1rem;
		margin-bottom: 0;
		flex: 1;
	}
`;

const Menu = styled.nav`
	flex: 1;
	display: flex;
	flex-direction: column;

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		flex-direction: row;
		gap: 1rem;
	}
`;

const MenuItem = styled(NavLink)`
	position: relative;
	padding: 0.25rem 0;
	color: ${({ theme }) => theme.colors.muted};
	font-size: 0.85rem;
	font-weight: 500;
	text-decoration: none;

	&.active {
		color: ${({ theme }) => theme.colors.blue};
	}

	&:after {
		content: "";
		position: absolute;
		right: 0;
		top: 50%;
		width: 6px;
		height: 6px;
		border-right: 2px solid
			${({ theme, active }) => (active ? theme.colors.primary : "transparent")};
		border-bottom: 2px solid
			${({ theme, active }) => (active ? theme.colors.primary : "transparent")};
		transform: translateY(-50%) rotate(45deg);
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		padding: 0.5rem 0;
		font-size: 0.9rem;

		&:after {
			display: none;
		}
	}
`;

const ConnectRow = styled.div`
	margin-top: auto;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		flex-direction: row;
		margin-top: 0;
		margin-left: auto;
	}
`;

const Button = styled.button`
	background: #f8f8f8;
	color: ${({ theme }) => theme.colors.blue};
	padding: 0.35rem;
	font-size: 0.85rem;
	font-weight: 500;
	border-radius: 6px;
	border: 1px solid ${({ theme }) => theme.colors.border};
	width: 100%;
	cursor: pointer;
	transition: background 0.2s;

	&:hover:not(:disabled) {
		background: ${({ theme }) => theme.colors.border};
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		width: auto;
		padding: 0.5rem 1rem;
	}
`;

export function Sidebar({
	open,
	onConnect,
	onDisconnect,
	account,
	isOwner,
	onToggleOpen,
}) {
	return (
		<SidebarContainer>
			<Logo src="/favicon.png" />
			<Title>Elliptic Promise</Title>
			<Menu>
				<MenuItem to="/" end>
					Dashboard
				</MenuItem>
				<MenuItem to="/create">Create Promise</MenuItem>
			</Menu>
			<ConnectRow>
				{isOwner && (
					<Button onClick={onToggleOpen}>{open ? "Disable" : "Enable"}</Button>
				)}
				{account ? (
					<Button onClick={onDisconnect}>Disconnect</Button>
				) : (
					<Button onClick={onConnect}>Connect</Button>
				)}
			</ConnectRow>
		</SidebarContainer>
	);
}
