/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { LinkProps, Link as RouterLink } from 'react-router-dom';
import { Link as MuiLink } from '@material-ui/core';
import { PageContainer } from '../components';
import { HEADER_HEIGHT } from '../constants';
import { UserMenu } from './UserMenu';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  width: 100%;
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
const LogoLink = styled(MuiLink).attrs({
  color: 'inherit',
  component: RouterLink,
})<LinkProps>`
  height: ${HEADER_HEIGHT};
  padding: 1rem 0.5rem;
  display: flex;
`;

export const Header = () => {
  return (
    <Wrapper>
      <Container>
        <LogoLink to="/">
          <img src="/datatrak-logo-black.svg" alt="tupaia-logo" />
        </LogoLink>
        <UserMenu />
      </Container>
    </Wrapper>
  );
};
