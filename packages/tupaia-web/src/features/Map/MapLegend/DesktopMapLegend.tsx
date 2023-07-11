/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MOBILE_BREAKPOINT } from '../../../constants';

const Wrapper = styled.div`
  pointer-events: auto;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

export const DesktopMapLegend = ({ Legend }) => {
  return <Wrapper>{Legend}</Wrapper>;
};
