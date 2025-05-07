import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { HEADER_HEIGHT, TABLET_BREAKPOINT } from '../../constants';
import { UserMenu } from '../UserMenu';
import { HeaderLeft } from './HeaderLeft';

export const HeaderRoot = styled(SafeAreaColumn).attrs({
  as: 'header',
})`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  block-size: ${HEADER_HEIGHT};
  display: flex;
  justify-content: space-between;
  max-block-size: ${HEADER_HEIGHT};
  padding-top: env(safe-area-inset-top, 0);
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
