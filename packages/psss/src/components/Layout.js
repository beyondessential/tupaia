/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';

const desktopWidth = '768px';

/*
 * Wrapping container
 */
export const Container = styled(MuiContainer)`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 60px;

  @media (max-width: ${desktopWidth}) {
    grid-template-columns: 1fr;
  }
`;

const headerHeight = '355px';

/*
 * Main section that holds the data table
 */
export const Main = styled.main`
  padding-top: 1rem;
  padding-bottom: 5rem;
  min-height: calc(100vh - ${headerHeight});

  @media (max-width: ${desktopWidth}) {
    min-height: auto;
  }
`;

/*
 * Sidebar
 */
export const Sidebar = styled.aside`
  margin-top: -85px;

  @media (max-width: ${desktopWidth}) {
    margin-top: 0;
    margin-bottom: 3rem;
  }

  /* These styles are temporary for demo only */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 3px;
  border: 1px solid #dedee0;
  height: 800px;
`;
