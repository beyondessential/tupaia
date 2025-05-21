import React from 'react';
import styled from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { MenuList } from './MenuList';

const Wrapper = styled(SafeAreaColumn).attrs({ as: 'article' })`
  block-size: 100dvb;
  inline-size: 100%;
`;

export const MobileUserMenu = () => {
  return (
    <Wrapper>
      <MenuList />
    </Wrapper>
  );
};
