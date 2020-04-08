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
export const Submit = () => (
  <StyledSVG viewBox="0 0 40 39" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.486 21.5949L14.3708 27.0614C14.6721 27.5013 15.1637 27.7683 15.7028 27.7997C16.2419 27.8154 16.7494 27.5798 17.0823 27.1557L29.514 11.5416"
      stroke="#697074"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M20 37.3347C29.847 37.3347 37.8388 29.4177 37.8388 19.6628C37.8388 9.90796 29.847 1.99097 20 1.99097C10.153 1.99097 2.16125 9.90796 2.16125 19.6628C2.16125 29.4177 10.153 37.3347 20 37.3347Z"
      stroke="#697074"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </StyledSVG>
);
