import { createGlobalStyle } from 'styled-components';
import satoshiFont from '../fonts/Satoshi-Variable.ttf';

const GlobalStyles = createGlobalStyle`

@font-face {
    font-family: 'Satoshi';
    src: url(${satoshiFont}) format('truetype');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%;
  }

  body {
    font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    font-size: 1.6rem;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
`;

export default GlobalStyles;