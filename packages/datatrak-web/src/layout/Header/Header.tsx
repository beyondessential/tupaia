import React from 'react';
import styled from 'styled-components';
import { PageContainer } from '../../components';
import { HEADER_HEIGHT, TABLET_BREAKPOINT } from '../../constants';
import { UserMenu } from '../UserMenu';
import { HeaderLeft } from './HeaderLeft';

const Wrapper = styled(PageContainer).attrs({ component: 'header' })`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  display: flex;
  block-size: ${HEADER_HEIGHT};
  justify-content: space-between;
  position: relative;
  width: 100%;
  z-index: 10;

  @media (min-width: ${TABLET_BREAKPOINT}) {
    border-block-end: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.divider};
  }
`;

export const Header = () => {
  return (
    <Wrapper>
      <HeaderLeft />
      <UserMenu />
    </Wrapper>
  );
};
