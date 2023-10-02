/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { Link as MuiLink } from '@material-ui/core';
import { PageContainer } from '../components';
import { HEADER_HEIGHT, MOBILE_HEADER_HEIGHT } from '../constants';
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
  height: ${MOBILE_HEADER_HEIGHT};
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${({ theme }) => theme.breakpoints.up('md')} {
    height: ${HEADER_HEIGHT};
  }
`;
const LogoLink = styled(MuiLink).attrs({
  color: 'inherit',
  component: RouterLink,
})`
  height: ${MOBILE_HEADER_HEIGHT};
  padding: 1rem 0.5rem;
  display: flex;
  ${({ theme }) => theme.breakpoints.up('md')} {
    height: ${HEADER_HEIGHT};
  }
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
