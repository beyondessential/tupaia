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
`;

const Link = props => <StyledLink color="inherit" {...props} component={RouterLink} />;

export const HomeButton = () => (
  <Link to="/">
    <img src="/psss-logo.svg" alt="psss logo" />
  </Link>
);
