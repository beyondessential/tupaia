/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MOBILE_THRESHOLD } from '../../../constants';

// Placeholder for MapOverlaySelector component
const Wrapper = styled.div`
  width: 18.75rem;
  margin: 1em;
  height: 2.5rem;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.palette.secondary.main};
  opacity: 0.6;
  position: absolute;
  top: 0;
  @media screen and (max-width: ${MOBILE_THRESHOLD}) {
    display: none;
  }
`;

export const FixedMapOverlaySelector = () => {
  return <Wrapper />;
};
