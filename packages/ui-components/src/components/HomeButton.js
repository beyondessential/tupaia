/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiLink from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(MuiLink)`
  display: flex;
  align-items: center;
`;

const StyledImg = styled.img`
  height: 32px;
  width: auto;
`;

const Link = props => <StyledLink color="inherit" {...props} component={RouterLink} />;

export const HomeButton = () => (
  <Link to="/">
    <StyledImg src="/psss-logo-white.svg" alt="psss logo" />
  </Link>
);
