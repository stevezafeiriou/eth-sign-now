import styled from "styled-components";

export const Navbar = styled.nav`
	width: 100%;
	background: #4a90e2;
	padding: 0.75rem 1.5rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const NavTitle = styled.h1`
	color: white;
	font-size: 1.5rem;
	margin: 0;
`;

export const NavButton = styled.button`
	background: white;
	color: #4a90e2;
	border: none;
	padding: 0.5rem 1rem;
	font-size: 0.9rem;
	border-radius: 4px;
	cursor: pointer;
	&:hover {
		opacity: 0.9;
	}
`;

// A centered container
export const Container = styled.div`
	max-width: 600px;
	margin: 2rem auto;
	font-family: sans-serif;
`;

// A card to hold the form
export const Card = styled.div`
	background: #fafafa;
	padding: 1.5rem;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	margin-bottom: 2rem;
`;

// Shared styles for inputs / textareas
const sharedField = `
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
`;

// Disabled input look
export const Field = styled.input`
	${sharedField}
	background: ${({ disabled }) => (disabled ? "#f0f0f0" : "white")};
`;

// Textarea for message & signature
export const TextArea = styled.textarea`
	${sharedField}
	resize: vertical;
	min-height: ${({ small }) => (small ? "2.5rem" : "6rem")};
	background: ${({ disabled }) => (disabled ? "#f0f0f0" : "white")};
`;

// Buttons
export const Button = styled.button`
	background: #4a90e2;
	color: white;
	border: none;
	padding: 0.6rem 1.2rem;
	margin-top: 1rem;
	margin-right: 0.5rem;
	border-radius: 4px;
	cursor: pointer;
	font-size: 1rem;
	&:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
`;

// Simple table
export const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	margin-top: 1rem;
	th,
	td {
		border: 1px solid #ddd;
		padding: 0.5rem;
		text-align: left;
	}
	th {
		background: #f5f5f5;
	}
`;
