/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { ENLARGED_REPORT_CONTAINER_HEIGHT } from '../constants';

const Wrapper = styled.div`
  min-height: ${ENLARGED_REPORT_CONTAINER_HEIGHT}; // This is so that the chart is properly covered by this div, because of the way MUI Tabs work
`;
export const FlippaTable = () => {
  return <Wrapper>Hiii</Wrapper>;
};
