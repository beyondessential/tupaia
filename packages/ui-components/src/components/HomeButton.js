/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiLink from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledLink = styled(MuiLink)`
  display: flex;
  align-items: center;
`;

const StyledImg = styled.img`
  height: 32px;
  width: auto;
`;

const Link = props => <StyledLink color="inherit" {...props} component={RouterLink} />;

export const HomeButton = ({ source, ...props }) => (
  <Link to="/">
    <StyledImg src={source} alt="logo" {...props} />
  </Link>
);

HomeButton.propTypes = {
  source: PropTypes.string.isRequired,
};
