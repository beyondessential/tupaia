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

export const Sort = () => (
  <StyledSVG viewBox="0 0 42 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M31.5 24.375L21 12.675L10.5 24.375L31.5 24.375Z" fill="#44535C" />
    <path d="M10.5 39.625L21 51.325L31.5 39.625H10.5Z" fill="#44535C" />
  </StyledSVG>
);
