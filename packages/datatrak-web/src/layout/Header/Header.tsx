import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';
import { PageContainer } from '../../components';
import { HEADER_HEIGHT, TABLET_BREAKPOINT } from '../../constants';
import { UserMenu } from '../UserMenu';
import { HeaderLeft } from './HeaderLeft';

export const HeaderRoot = styled(PageContainer).attrs({ component: 'header' })`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  block-size: ${HEADER_HEIGHT};
  display: flex;
  justify-content: space-between;
  max-block-size: ${HEADER_HEIGHT};
  position: relative;
  width: 100%;
  z-index: 10;

  @media (min-width: ${TABLET_BREAKPOINT}) {
    border-block-end: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.divider};
  }
`;

export const Header = (props: ComponentPropsWithoutRef<typeof HeaderRoot>) => {
  return (
    <HeaderRoot {...props}>
      <HeaderLeft />
      <UserMenu />
    </HeaderRoot>
  );
};
