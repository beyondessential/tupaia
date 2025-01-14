import React from 'react';
import styled from 'styled-components';
import { PageContainer } from '../../components';
import { HEADER_HEIGHT } from '../../constants';
import { UserMenu } from '../UserMenu';
import { HeaderLeft } from './HeaderLeft';
import { TABLET_BREAKPOINT } from '../../constants';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  width: 100%;
  z-index: 10;

  @media (min-width: ${TABLET_BREAKPOINT}) {
    border: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

const Container = styled(PageContainer).attrs({
  maxWidth: false,
})`
  position: relative;
  z-index: 1;
  height: ${HEADER_HEIGHT};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Header = () => {
  return (
    <Wrapper>
      <Container>
        <HeaderLeft />
        <UserMenu />
      </Container>
    </Wrapper>
  );
};
