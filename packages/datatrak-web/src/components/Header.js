/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { MainMenu } from './MainMenu';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';

const Container = styled.div`
  // Use position relative to ensure header menu is above page components
  position: relative;
  z-index: 1;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  background: white;
`;

const StyledImg = styled.img`
  height: 30px;
  width: auto;
`;

const Link = props => <MuiLink color="inherit" {...props} component={RouterLink} />;

export const Header = ({ user }) => {
  return (
    <Container>
      <Link to="/">
        <StyledImg src="/tupaia-logo-black.svg" alt="tupaia-logo" />
      </Link>
      <MainMenu user={user} />
    </Container>
  );
};
