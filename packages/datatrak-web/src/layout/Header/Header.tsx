import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { HEADER_HEIGHT } from '../../constants';
import { HeaderLeft } from './HeaderLeft';
import { UserMenu } from '../UserMenu';

export const HeaderRoot = styled(SafeAreaColumn).attrs({
  as: 'header',
})`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  block-size: ${HEADER_HEIGHT};
  border-block-end: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  display: flex;
  justify-content: space-between;
  max-block-size: ${HEADER_HEIGHT};
  padding-top: env(safe-area-inset-top, 0);
  position: relative;
  inline-size: 100%;
  z-index: 10;
`;

export const Header = (props: ComponentPropsWithoutRef<typeof HeaderRoot>) => {
  return (
    <HeaderRoot {...props}>
      <HeaderLeft />
      <UserMenu />
    </HeaderRoot>
  );
};
