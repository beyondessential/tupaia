/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';
import { FOOTER_HEIGHT } from '../constants';

const footerFontColor = '#c4c4c4';

const Container = styled.footer`
  height: ${FOOTER_HEIGHT};
  background: #283238;
  padding: 1rem;

  span,
  a {
    color: ${footerFontColor};
    font-size: 12px;
    line-height: 14px;
    margin-right: 1rem;
  }
`;

const date = new Date();

export const Footer = () => (
  <Container>
    <MuiContainer>
      <span>&copy; {date.getFullYear()} Beyond Essential</span>
      <MuiLink href="https://tupaia.org">tupaia.org</MuiLink>
    </MuiContainer>
  </Container>
);
