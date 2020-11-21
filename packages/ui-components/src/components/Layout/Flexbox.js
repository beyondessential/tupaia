/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';

export const FlexSpaceBetween = styled(MuiBox)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FlexStart = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const FlexCenter = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FlexEnd = styled(MuiBox)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
