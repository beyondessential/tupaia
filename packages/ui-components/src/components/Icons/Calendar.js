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
    fill: none;
    stroke: currentColor; 
  }
`;

export const Calendar = () => (
  <StyledSVG viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.23352 9.05962C2.23352 7.75583 3.23 6.70337 4.46446 6.70337H33.4666C34.7011 6.70337 35.6975 7.75583 35.6975 9.05962V34.9783C35.6975 36.2821 34.7011 37.3346 33.4666 37.3346H4.46446C3.23 37.3346 2.23352 36.2821 2.23352 34.9783V9.05962Z"
      stroke="#697074"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.23352 16.1284H35.6975"
      stroke="#697074"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.157 10.2378V1.99097"
      stroke="#697074"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26.7737 10.2378V1.99097"
      stroke="#697074"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </StyledSVG>
);
