/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';
import * as COLORS from '../theme/colors';

export default {
  title: 'Footer',
};

const Footer = styled.footer`
  background: ${COLORS.DARKGREY};
  padding: 1rem;

  span,
  a {
    color: #c4c4c4;
    font-size: 12px;
    line-height: 14px;
    margin-right: 1rem;
  }
`;

const date = new Date();

export const footer = () => (
  <Footer>
    <MuiContainer>
      <span>&copy; {date.getFullYear()} Beyond Essential</span>
      <MuiLink href="https://tupaia.org">tupaia.org</MuiLink>
    </MuiContainer>
  </Footer>
);
