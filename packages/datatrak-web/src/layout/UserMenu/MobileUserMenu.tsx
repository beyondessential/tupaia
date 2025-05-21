import React from 'react';
import styled from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { MenuList } from './MenuList';

export const MobileUserMenuRoot = styled(SafeAreaColumn).attrs({ as: 'article' })`
  block-size: 100dvb;
  inline-size: 100%;
  font-size: 1.125rem;
`;

export const MobileUserMenu = (
  props: React.ComponentPropsWithoutRef<typeof MobileUserMenuRoot>,
) => {
  return (
    <MobileUserMenuRoot {...props}>
      <MenuList />
    </MobileUserMenuRoot>
  );
};
