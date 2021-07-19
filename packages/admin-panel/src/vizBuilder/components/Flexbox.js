/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';

export const FlexStart = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const FlexEnd = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const FlexSpaceBetween = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const FlexCenter = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FlexColumn = styled(MuiBox)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
