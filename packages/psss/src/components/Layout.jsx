import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiBox from '@material-ui/core/Box';

const desktopWidth = '768px';

/*
 * Wrapping container
 */
export const Container = styled(MuiContainer)`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 40px;

  @media (max-width: ${desktopWidth}) {
    grid-template-columns: 1fr;
  }
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

/*
 * Sidebar
 */
export const Sidebar = styled.aside`
  margin-top: -85px;

  @media (max-width: ${desktopWidth}) {
    margin-top: 0;
    margin-bottom: 3rem;
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
