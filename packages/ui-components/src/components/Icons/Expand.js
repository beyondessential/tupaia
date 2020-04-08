/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';

const StyledSVG = styled.svg`
  fill: currentColor;
  width: 1em;
  height: 1em;
  display: inline-block;
  font-size: 1.5rem;
  transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  flex-shrink: 0;
  user-select: none;
  
  path {
    fill: currentColor;
  }
`;

export const Expand = () => (
  <StyledSVG viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M41.2083 0H1.79167C0.800875 0 0 0.802667 0 1.79167V41.2083C0 42.1973 0.800875 43 1.79167 43H41.2083C42.1991 43 43 42.1973 43 41.2083V1.79167C43 0.802667 42.1991 0 41.2083 0ZM32.25 23.2917H23.2917V32.25H19.7083V23.2917H10.75V19.7083H19.7083V10.75H23.2917V19.7083H32.25V23.2917Z"
      fill="#CCCCCC"
    />
  </StyledSVG>
);
