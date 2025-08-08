import { Container } from '@material-ui/core';
import styled from 'styled-components';

export const Main = styled.main`
  overflow-x: auto;
  height: 100vh;
  // This is so that we can make the PageBody component fill the whole remaining height of the screen
  display: flex;
  flex-direction: column;
  flex: 1;
`;
export const PageContentWrapper = styled(Container).attrs({
  maxWidth: false,
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: 0;
  padding-inline: 1.5rem;
  max-height: 100%;
  overflow: hidden;
`;
