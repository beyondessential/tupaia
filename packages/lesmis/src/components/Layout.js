/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiBox from '@material-ui/core/Box';

const desktopWidth = '768px';

/*
 * Wrapping container
 */
export const Container = styled(MuiContainer)`
  min-height: 85vh;
  padding-top: 5%;
`;

const headerHeight = '315px';
const footerHeight = '48px';

/*
 * Main section that holds the data table
 */
export const Main = styled.main`
  padding-top: 1rem;
  padding-bottom: 5rem;
  min-height: calc(100vh - ${headerHeight} - 1rem - 5rem + ${footerHeight});

  @media (max-width: ${desktopWidth}) {
    min-height: auto;
  }
`;

const ToolbarWrapper = styled.section`
  padding-top: 1.1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const Toolbar = ({ children }) => (
  <ToolbarWrapper>
    <MuiContainer maxWidth={false}>{children}</MuiContainer>
  </ToolbarWrapper>
);

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

export const FlexRow = styled(MuiBox)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
