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
    stroke: none;
  }
`;

export const Warning = () => (
  <StyledSVG viewBox="0 0 41 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.5 0.687988C9.19648 0.687988 0 9.88447 0 21.188C0 32.4915 9.19648 41.688 20.5 41.688C31.8035 41.688 41 32.4915 41 21.188C41 9.88447 31.8035 0.687988 20.5 0.687988ZM22.5375 10.4923L21.5188 25.2621H19.4812L18.4625 10.4923H22.5375ZM20.5 32.7749C19.0231 32.7749 17.8261 31.5779 17.8261 30.101C17.8261 28.6241 19.0231 27.4271 20.5 27.4271C21.9769 27.4271 23.1739 28.6241 23.1739 30.101C23.1739 31.5779 21.9769 32.7749 20.5 32.7749Z"
      fill="#697074"
    />
  </StyledSVG>
);
