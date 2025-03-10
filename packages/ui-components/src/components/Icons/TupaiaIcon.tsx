import React, { SVGAttributes } from 'react';
import styled from 'styled-components';

const StyledSVG = styled.svg`
  width: 1em;
  height: 1em;
  display: inline-block;
  font-size: 1.5rem;
  transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  flex-shrink: 0;
  user-select: none;
`;

export const TupaiaIcon = (props: SVGAttributes<HTMLOrSVGElement>) => (
  <StyledSVG {...props} viewBox="0 0 35 51" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.5147 34.8154C27.1762 34.8154 35.0005 27.0491 35.0005 17.5076C35.0005 7.93453 27.1762 0.199951 17.5147 0.199951C7.85308 0.199951 0.0288086 7.96623 0.0288086 17.5076C0.0288086 27.0808 7.85308 34.8154 17.5147 34.8154Z"
      fill="#EC632D"
    />
    <path
      d="M15.7085 48.6361C15.7085 48.6361 17.5141 52.1547 19.3197 48.6361L34.5248 19.0608C34.5248 19.0608 36.3304 15.5422 32.3708 15.5422H2.62581C2.62581 15.5422 -1.33386 15.5422 0.471741 19.0608L15.7085 48.6361Z"
      fill="#EC632D"
    />
    <path
      d="M17.5141 30.1557C24.5782 30.1557 30.2801 24.4816 30.2801 17.5078C30.2801 10.534 24.5782 4.85986 17.5141 4.85986C10.4501 4.85986 4.74817 10.534 4.74817 17.5078C4.74817 24.4816 10.4501 30.1557 17.5141 30.1557Z"
      fill="white"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.5879 9.82446H20.4723V14.611H25.3506V20.3726H20.4832L20.5149 25.1909H14.6305L14.5988 20.3726H9.70959V14.611H14.5879V9.82446Z"
      fill="#007DC2"
    />
  </StyledSVG>
);
