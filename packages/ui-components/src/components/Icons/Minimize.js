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

export const Minimize = () => (
  <StyledSVG viewBox="0 0 44 43" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M41.9066 0H2.48991C1.49912 0 0.698242 0.802667 0.698242 1.79167V41.2083C0.698242 42.1973 1.49912 43 2.48991 43H41.9066C42.8974 43 43.6982 42.1973 43.6982 41.2083V1.79167C43.6982 0.802667 42.8974 0 41.9066 0ZM32.9482 23.2917H11.4482V19.7083H32.9482V23.2917Z"
      fill="#44535C"
    />
  </StyledSVG>
);
