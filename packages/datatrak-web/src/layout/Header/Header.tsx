/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { PageContainer } from '../../components';
import { HEADER_HEIGHT } from '../../constants';
import { UserMenu } from '../UserMenu';
import { LogoButton } from './LogoButton';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  width: 100%;
  box-shadow: inset 0 0 1px #333;
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
        <LogoButton />
        <UserMenu />
      </Container>
    </Wrapper>
  );
};
