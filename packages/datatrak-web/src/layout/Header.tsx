/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { Link as MuiLink } from '@material-ui/core';
import { PageContainer } from '../components';
import { HEADER_HEIGHT } from '../constants';
import { UserMenu } from './UserMenu';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
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

const StyledImg = styled.img`
  height: 3.5rem;
  width: auto;
`;

export const Header = () => {
  return (
    <Wrapper>
      <Container>
        <MuiLink color="inherit" component={RouterLink} to="/">
          <StyledImg src="/datatrak-logo-black.svg" alt="tupaia-logo" />
        </MuiLink>
        <UserMenu />
      </Container>
    </Wrapper>
  );
};
