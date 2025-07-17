import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  /* Reset & box‑sizing */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Responsive root font sizing */
  html {
    font-size: 100%; /* 16px */
    scroll-behavior: smooth;

    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: 87.5%; /* 14px */
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
      font-size: 75%; /* 12px */
    }
  }

  body {
    min-height: 100vh;
    overflow-x: hidden;
    font-family: "Inter", sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.6;
  }

  img, picture, video, canvas, svg {
    max-width: 100%;
    display: block;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font: inherit;
    cursor: pointer;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.2);
    border-radius: 4px;
  }
`;
