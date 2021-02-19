/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

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

  // Todo: Make page layouts
  // @see https://github.com/beyondessential/tupaia-backlog/issues/2279

  //display: grid;
  //grid-template-columns: 2fr 1fr;
  //grid-gap: 40px;

  // @media (max-width: ${desktopWidth}) {
  //   grid-template-columns: 1fr;
  // }
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
